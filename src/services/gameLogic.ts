import { GameState, GameAction, Player, Field, GamePhase, FieldType, Category, User, Question, QuestionDifficulty } from '../types';
import { CATEGORIES, PLAYER_COLORS, BASE_HP, FIELD_HP, BOT_NAMES, POINTS, PHASE_DURATIONS, ELIMINATION_COIN_BONUS, XP_PER_CORRECT_ANSWER, XP_DIFFICULTY_MULTIPLIER, XP_FOR_WIN } from '../constants';
import { normalizeAnswer } from '../utils';

export const createInitialGameState = (playerCount: number, user: User, isOnlineMode: boolean = false, botDifficulty: QuestionDifficulty): GameState => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
        const isBot = i !== 0;
        return {
            id: `player-${i+1}`,
            name: isBot ? (isOnlineMode ? BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] : `Bot ${i}`) : user.nickname,
            color: PLAYER_COLORS[i % PLAYER_COLORS.length],
            score: 0,
            coins: i === 0 ? user.luduCoins : 1000,
            isBot: isBot,
            mainBaseCategory: CATEGORIES[i % CATEGORIES.length],
            usedAttackCategories: [],
            finalPoints: 0,
            isEliminated: false,
        }
    });
    
    // The radius is now always 2 to ensure enough neutral fields for Phase 1 (playerCount * 3)
    const radius = 2;
    let board: Field[] = [];
    let fieldIdCounter = 0;

    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
          board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
      }
    }

    // Base positions are adjusted for the larger map, ensuring good separation.
    const basePositions = playerCount <= 2
      ? [{ q: 2, r: 0 }, { q: -2, r: 0 }]
      : [{ q: 2, r: 0 }, { q: -2, r: 0 }, { q: 1, r: -2 }, { q: -1, r: 2 }];

    const assignedBaseCoords = new Set<string>();

    players.forEach((player, i) => {
        const pos = basePositions[i];
        const coordKey = `${pos.q},${pos.r}`;
        const baseField = board.find(f => f.q === pos.q && f.r === pos.r)!;
        baseField.type = FieldType.PlayerBase;
        baseField.ownerId = player.id;
        baseField.category = player.mainBaseCategory;
        baseField.hp = BASE_HP;
        baseField.maxHp = BASE_HP;
        assignedBaseCoords.add(coordKey);
    });

    const neutralFields = board.filter(f => !assignedBaseCoords.has(`${f.q},${f.r}`));
    
    // Shuffle categories for neutral fields
    const shuffledCategories = [...CATEGORIES].sort(() => 0.5 - Math.random());

    neutralFields.forEach((field, i) => {
        field.type = FieldType.Neutral;
        field.category = shuffledCategories[i % shuffledCategories.length];
        field.hp = FIELD_HP;
        field.maxHp = FIELD_HP;
    });
    
    const matchStats = players.reduce((acc, player) => {
        acc[player.id] = {
            correct: 0,
            total: 0,
            xpEarned: 0,
            categories: Object.values(Category).reduce((catAcc, cat) => {
                catAcc[cat] = { correct: 0, total: 0 };
                return catAcc;
            }, {} as Record<Category, { correct: number; total: number }>)
        };
        return acc;
    }, {} as GameState['matchStats']);

    return {
        players,
        board: board.filter(f => f.type !== FieldType.Empty),
        // FIX: Start in the new `Phase1_PickField` sub-phase.
        gamePhase: GamePhase.Phase1_PickField,
        currentTurnPlayerIndex: 0,
        round: 1,
        gameLog: [`Hra začala s ${playerCount} hráči.`],
        activeQuestion: null,
        winners: null,
        phase1Selections: {},
        gameStartTime: Date.now(),
        answerResult: null,
        eliminationResult: null,
        questionHistory: user.stats.answeredQuestions || [],
        matchStats,
        botDifficulty
    };
};

export const getAttackers = (players: Player[]): Player[] => {
    const activePlayers = players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) return [];
    
    const sortedPlayers = [...activePlayers].sort((a, b) => a.score - b.score);
    const attackerCount = Math.max(1, Math.floor(sortedPlayers.length / 2));
    
    return sortedPlayers.slice(0, attackerCount);
};

// --- Bot Decision Making ---
export const decideBotAction = (gameState: GameState): { action: 'HEAL' | 'ATTACK' | 'PASS', targetField?: Field, category?: Category, reason?: string, difficulty?: QuestionDifficulty } => {
    const bot = gameState.players[gameState.currentTurnPlayerIndex];
    const difficulty = gameState.botDifficulty;

    // --- Easy Bot: Simple, random logic ---
    if (difficulty === 'easy') {
        const botBase = gameState.board.find(f => f.ownerId === bot.id && f.type === 'PLAYER_BASE');
        if (botBase && botBase.hp < botBase.maxHp && Math.random() < 0.25) { // Lower chance to heal
            return { action: 'HEAL', targetField: botBase, category: botBase.category!, difficulty: 'easy' };
        }
        const validTargets = gameState.board.filter(f => f.ownerId !== null && f.ownerId !== bot.id && f.type !== 'NEUTRAL');
        if (validTargets.length === 0) {
            return { action: 'PASS', reason: "No valid targets found." };
        }
        const targetField = validTargets[Math.floor(Math.random() * validTargets.length)];
        const isBaseAttack = targetField.type === 'PLAYER_BASE';
        let category: Category;
        let questionDifficulty: QuestionDifficulty = 'easy';

        if (isBaseAttack) {
            category = targetField.category!;
            questionDifficulty = 'medium';
        } else {
            let availableCategories = CATEGORIES.filter(c => !bot.usedAttackCategories.includes(c));
            if (availableCategories.length === 0) {
                availableCategories = [...CATEGORIES]; // Reset for selection
            }
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        }
        return { action: 'ATTACK', targetField, category, difficulty: questionDifficulty };
    }

    // --- Medium & Hard Bots: Scored, strategic logic ---
    const possibleActions: { score: number; action: 'HEAL' | 'ATTACK'; targetField: Field }[] = [];
    const botBase = gameState.board.find(f => f.ownerId === bot.id && f.type === 'PLAYER_BASE')!;

    // 1. Evaluate Healing
    if (botBase.hp < botBase.maxHp) {
        let healScore = (botBase.maxHp - botBase.hp) * 30; // 30 points per missing HP
        if (botBase.hp === 1) healScore += 70; // High priority to avoid elimination
        possibleActions.push({ score: healScore, action: 'HEAL', targetField: botBase });
    }

    // 2. Evaluate Attacking
    const potentialTargets = gameState.board.filter(f => f.ownerId !== null && f.ownerId !== bot.id);
    const highestScore = Math.max(...gameState.players.filter(p => !p.isEliminated).map(p => p.score));

    for (const targetField of potentialTargets) {
        let attackScore = 10;
        const targetPlayer = gameState.players.find(p => p.id === targetField.ownerId);

        if (targetField.type === 'PLAYER_BASE') {
            attackScore += 60;
            attackScore += (targetField.maxHp - targetField.hp) * 25; // Prioritize damaged bases heavily
        } else if (targetField.type === 'BLACK') {
            attackScore += 5; // Low priority
        } else { // Neutral field owned by a player
            attackScore += 15;
        }

        if (targetPlayer) {
            // Prioritize players with low scores (closer to elimination)
            attackScore += (highestScore - targetPlayer.score) / 50;
            // Prioritize players with fewer territories
            const territoryCount = gameState.board.filter(f => f.ownerId === targetPlayer.id).length;
            attackScore += (10 - territoryCount) * 3;
            // Slightly prioritize human player
            if (!targetPlayer.isBot) attackScore *= 1.1;
        }
        possibleActions.push({ score: attackScore, action: 'ATTACK', targetField });
    }

    if (possibleActions.length === 0) {
        return { action: 'PASS', reason: "No valid actions found." };
    }

    // Sort actions by score, descending
    possibleActions.sort((a, b) => b.score - a.score);

    let chosenAction = possibleActions[0];
    if (difficulty === 'medium' && Math.random() > 0.65) { // 35% chance to pick a random (but still valid) action
        chosenAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }

    // Determine category and question difficulty for the chosen action
    const { action, targetField } = chosenAction;
    let category: Category;
    let questionDifficulty: QuestionDifficulty;

    if (action === 'HEAL') {
        category = targetField.category!;
        questionDifficulty = 'medium';
    } else { // ATTACK
        if (targetField.type === 'PLAYER_BASE') {
            category = targetField.category!;
            questionDifficulty = 'hard';
        } else if (targetField.type === 'BLACK') {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            questionDifficulty = 'medium';
        } else {
            let availableCategories = CATEGORIES.filter(c => !bot.usedAttackCategories.includes(c));
            if (availableCategories.length === 0) {
                availableCategories = [...CATEGORIES]; // Conceptually reset for this turn's choice
            }
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
            questionDifficulty = 'easy';
        }
    }

    return { action, targetField, category, difficulty: questionDifficulty };
};


// --- Turn Resolution Logic ---

const handleHealAction = (state: GameState) => {
    const { attackerId, playerAnswers, question } = state.activeQuestion!;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.ownerId === attackerId && f.type === 'PLAYER_BASE')!;
    const isCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);

    if (isCorrect) {
        field.hp = Math.min(field.maxHp, field.hp + 1);
        attacker.score += POINTS.HEAL_SUCCESS;
        state.gameLog.push(`${attacker.name} si úspěšně opravil základnu.`);
    } else {
        attacker.score += POINTS.HEAL_FAIL_PENALTY;
        state.gameLog.push(`${attacker.name} neuspěl při opravě.`);
    }
    return state;
};

const handleAttackAction = (state: GameState) => {
    const { attackerId, defenderId, targetFieldId, playerAnswers, question, isBaseAttack } = state.activeQuestion!;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.id === targetFieldId)!;
    
    // Handle player vs player combat
    if (defenderId) {
        const defender = state.players.find(p => p.id === defenderId)!;
        const isAttackerCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
        const isDefenderCorrect = normalizeAnswer(playerAnswers[defenderId] || "") === normalizeAnswer(question.correctAnswer);
        
        // Resolve combat
        if (isAttackerCorrect && !isDefenderCorrect) { // Attacker wins
            field.hp -= 1;
            if (isBaseAttack) {
                attacker.score += POINTS.ATTACK_DAMAGE;
                state.gameLog.push(`${attacker.name} zasáhl základnu hráče ${defender.name}!`);
            } else {
                field.ownerId = attackerId;
                field.hp = field.maxHp;
                attacker.score += POINTS.ATTACK_WIN;
                defender.score += POINTS.ATTACK_LOSS_DEFENDER;
                state.gameLog.push(`${attacker.name} dobyl území od hráče ${defender.name}!`);
            }
        } else if (!isAttackerCorrect && isDefenderCorrect) { // Defender wins
            attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
            if (!isBaseAttack) defender.score += POINTS.ATTACK_WIN_DEFENDER;
            state.gameLog.push(`${defender.name} ubránil své území.`);
        } else if (isAttackerCorrect && isDefenderCorrect) { // Both correct (Tie)
            if(isBaseAttack) { // Base attacks don't have tie-breakers, defender wins
                 state.gameLog.push(`${defender.name} ubránil svou základnu v napínavém souboji!`);
            } else { // Successful defense, no points change unless it was a tie-breaker
                state.gameLog.push(`Souboj mezi ${attacker.name} a ${defender.name} skončil remízou! Území bylo ubráněno.`);
            }
        } else { // Both wrong
            attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
            state.gameLog.push(`Útok hráče ${attacker.name} se nezdařil, oba odpověděli špatně.`);
        }
    } else { // Handle attacking neutral/black field
        const isAttackerCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
        // FIX: Store field type before modifying it to prevent incorrect logic.
        const wasBlackField = field.type === FieldType.Black;
        if (isAttackerCorrect) {
            field.ownerId = attackerId;
            field.type = FieldType.Neutral;
            field.hp = field.maxHp;
            attacker.score += wasBlackField ? POINTS.BLACK_FIELD_CLAIM : POINTS.PHASE1_CLAIM;
            state.gameLog.push(`${attacker.name} zabral ${wasBlackField ? 'černé' : ''} území!`);
        } else {
            attacker.score += wasBlackField ? POINTS.BLACK_FIELD_FAIL : POINTS.ATTACK_LOSS_ATTACKER;
            state.gameLog.push(`${attacker.name} neuspěl na ${wasBlackField ? 'černém' : ''} území.`);
        }
    }
    return state;
};

const checkForEliminations = (state: GameState): GameState => {
    if (!state.activeQuestion) return state;
    const { attackerId, targetFieldId, isBaseAttack } = state.activeQuestion;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.id === targetFieldId)!;
    
    // Check for base destruction elimination
    if (isBaseAttack && field.hp <= 0) {
        const defender = state.players.find(p => p.id === field.ownerId)!;
        if (!defender.isEliminated) {
            attacker.score += POINTS.BASE_DESTROY_BONUS + Math.max(0, defender.score);
            attacker.coins += ELIMINATION_COIN_BONUS;
            defender.score = 0;
            defender.isEliminated = true;
            state.eliminationResult = { eliminatedPlayerName: defender.name, attackerName: attacker.name };
            state.gameLog.push(`${attacker.name} ZNIČIL základnu hráče ${defender.name}!`);
            state.board.forEach(f => { if (f.ownerId === defender.id) f.ownerId = attacker.id; });
        }
    }

    // Check for negative score elimination for all players
    state.players.forEach(p => {
        if (!p.isEliminated && p.score < 0) {
            p.isEliminated = true;
            state.eliminationResult = { eliminatedPlayerName: p.name, attackerName: 'Záporné skóre' };
            state.gameLog.push(`${p.name} byl vyřazen kvůli záporným bodům!`);
            state.board.forEach(f => {
                if (f.ownerId === p.id && f.type !== FieldType.PlayerBase) { f.ownerId = null; f.type = FieldType.Black; }
            });
        }
    });

    return state;
};

const advanceTurnAndRound = (state: GameState): GameState => {
    const activePlayers = state.players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
        state.gamePhase = GamePhase.GameOver;
        state.winners = activePlayers;
        if (activePlayers.length === 1 && !activePlayers[0].isBot) {
            state.matchStats[activePlayers[0].id].xpEarned += XP_FOR_WIN;
        }
        return state;
    }

    const currentAttackers = getAttackers(state.players);
    const currentAttacker = state.players[state.currentTurnPlayerIndex];
    const currentAttackerInListIndex = currentAttackers.findIndex(p => p.id === currentAttacker.id);

    // If the current player wasn't an attacker, or was the last one, advance the round
    if (currentAttackerInListIndex === -1 || currentAttackerInListIndex === currentAttackers.length - 1 || currentAttackers.length === 0) {
        state.round += 1;
        if (state.round > PHASE_DURATIONS.PHASE2_ROUNDS) {
            state.gamePhase = GamePhase.GameOver;
            const highestScore = Math.max(...activePlayers.map(p => p.score));
            const winners = activePlayers.filter(p => p.score === highestScore);
            state.winners = winners;
            const humanPlayer = state.players.find(p => !p.isBot);
            if (humanPlayer && winners.some(w => w.id === humanPlayer.id)) {
                state.matchStats[humanPlayer.id].xpEarned += XP_FOR_WIN;
            }
        } else {
            const nextRoundAttackers = getAttackers(state.players);
            if (nextRoundAttackers.length > 0) {
                state.currentTurnPlayerIndex = state.players.findIndex(p => p.id === nextRoundAttackers[0].id);
            } else { // No one can attack, game ends
                 state.gamePhase = GamePhase.GameOver;
                 state.winners = activePlayers;
            }
        }
    } else { // Move to the next attacker in the current list
        const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
        state.currentTurnPlayerIndex = state.players.findIndex(p => p.id === nextAttacker.id);
    }

    return state;
};


const resolveTurn = (state: GameState): GameState => {
    let newState = JSON.parse(JSON.stringify(state));
    if (!newState.activeQuestion) return newState;

    const { actionType } = newState.activeQuestion;
    
    if (actionType === 'HEAL') {
        newState = handleHealAction(newState);
    } else if (actionType === 'ATTACK') {
        newState = handleAttackAction(newState);
    }

    newState = checkForEliminations(newState);
    newState = advanceTurnAndRound(newState);
    
    newState.activeQuestion = null;

    return newState;
}

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    if (!state && action.type !== 'INITIALIZE_GAME') return null;

    switch (action.type) {
        case 'INITIALIZE_GAME':
            return createInitialGameState(action.payload.playerCount, action.payload.user, action.payload.isOnlineMode, action.payload.botDifficulty || 'medium');

        case 'SET_PHASE1_SELECTION': {
            if (!state) return null;
            const newState = {
                ...state,
                phase1Selections: { ...state.phase1Selections, [action.payload.playerId]: action.payload.fieldId }
            };

            const activePlayers = newState.players.filter(p => !p.isEliminated);
            const allPlayersSelected = activePlayers.every(p => newState.phase1Selections?.[p.id] != null);

            if (allPlayersSelected) {
                newState.gamePhase = GamePhase.Phase1_ShowQuestion;
            }

            return newState;
        }

        case 'SET_QUESTION': {
            if (!state) return null;
            const { attackerId, actionType, category, question, isBaseAttack } = action.payload!;
            
            const newState = JSON.parse(JSON.stringify(state));
            const attacker = newState.players.find((p: Player) => p.id === attackerId);

            // FAIRNESS FIX: Track used attack categories for ALL players and reset when full.
            if (attacker && actionType === 'ATTACK' && !isBaseAttack && category) {
                if (!attacker.usedAttackCategories.includes(category)) {
                    attacker.usedAttackCategories.push(category);
                }
                if (attacker.usedAttackCategories.length === CATEGORIES.length) {
                    attacker.usedAttackCategories = []; // Reset for next turn
                }
            }
            
            newState.questionHistory.push(question.question);
            newState.activeQuestion = action.payload;

            return newState;
        }

        case 'CLEAR_QUESTION':
            if (!state) return null;
            return { ...state, activeQuestion: null };
        
        case 'SUBMIT_ANSWER': {
            if (!state || !state.activeQuestion) return state;
            const { playerId, answer, category } = action.payload;
            const isCorrect = normalizeAnswer(answer) === normalizeAnswer(state.activeQuestion.question.correctAnswer);

            const updatedActiveQuestion = {
                ...state.activeQuestion,
                playerAnswers: { ...state.activeQuestion.playerAnswers, [playerId]: answer }
            };
            
            const player = state.players.find(p => p.id === playerId);
            if (!player) return state;

            const newMatchStats = JSON.parse(JSON.stringify(state.matchStats));
            const playerStats = newMatchStats[playerId];
            playerStats.total++;
            playerStats.categories[category].total++;
            
            if (isCorrect) {
                playerStats.correct++;
                playerStats.categories[category].correct++;
                if (!player.isBot) {
                     const difficultyMultiplier = XP_DIFFICULTY_MULTIPLIER[state.activeQuestion.question.difficulty] || 1;
                     playerStats.xpEarned += XP_PER_CORRECT_ANSWER * difficultyMultiplier;
                }
            }

            // FIX: Transition to the next sub-phase after an answer in Phase 1.
            let nextPhase = state.gamePhase;
            if (state.gamePhase === GamePhase.Phase1_ShowQuestion) {
                const allAnswered = Object.values(updatedActiveQuestion.playerAnswers).every(ans => ans !== null);
                if (allAnswered) {
                    nextPhase = GamePhase.Phase1_SelectionResolved;
                }
            }

            return {
                ...state,
                activeQuestion: updatedActiveQuestion,
                answerResult: { playerId, isCorrect, correctAnswer: state.activeQuestion.question.correctAnswer },
                matchStats: newMatchStats,
                gamePhase: nextPhase,
            };
        }

        case 'RESOLVE_PHASE1_ROUND': {
            if (!state) return null;
            let newState = JSON.parse(JSON.stringify(state));
            const humanPlayer = newState.players.find((p: Player) => !p.isBot)!;
            const fieldIndex = newState.board.findIndex((f: Field) => f.id === action.payload.fieldId);
        
            if (fieldIndex !== -1) {
                if (action.payload.humanActionResult === 'win') {
                    newState.board[fieldIndex].ownerId = humanPlayer.id;
                    humanPlayer.score += POINTS.PHASE1_CLAIM;
                    newState.gameLog.push(`${humanPlayer.name} jste zabral pole a získal ${POINTS.PHASE1_CLAIM} bodů.`);
                } else {
                    newState.board[fieldIndex].type = FieldType.Black;
                    newState.gameLog.push(`${humanPlayer.name} jste odpověděl špatně. Pole zčernalo.`);
                }
            }
        
            const botSelections = Object.entries(newState.phase1Selections || {}).filter(([playerId]) => playerId !== humanPlayer.id);
            
            for (const [botId, botFieldId] of botSelections) {
                if (botFieldId === null) continue;
                const botPlayer = newState.players.find((p: Player) => p.id === botId)!;
                const botFieldIndex = newState.board.findIndex((f: Field) => f.id === botFieldId);
                if (botFieldIndex !== -1 && newState.board[botFieldIndex].type === FieldType.Neutral && !newState.board[botFieldIndex].ownerId) {
                     if (Math.random() < 0.7) { // Bot success rate in Phase 1
                        newState.board[botFieldIndex].ownerId = botId;
                        botPlayer.score += POINTS.PHASE1_CLAIM;
                        newState.gameLog.push(`${botPlayer.name} odpověděl správně a zabral pole.`);
                     } else {
                        newState.board[botFieldIndex].type = FieldType.Black;
                        newState.gameLog.push(`${botPlayer.name} odpověděl špatně.`);
                     }
                }
            }
        
            newState.round += 1;
            if (newState.round > PHASE_DURATIONS.PHASE1_ROUNDS) {
                newState.gamePhase = GamePhase.Phase2_Attacks;
                newState.round = 1;
                const attackers = getAttackers(newState.players);
                if (attackers.length > 0) {
                    newState.currentTurnPlayerIndex = newState.players.findIndex((p:Player) => p.id === attackers[0].id);
                } else {
                    newState.gamePhase = GamePhase.GameOver;
                    newState.winners = newState.players.filter((p: Player) => !p.isEliminated);
                }
                newState.gameLog.push("--- Fáze 2: Útoky začaly! ---");
            } else {
                // FIX: Loop back to the start of the next Phase 1 round.
                newState.gamePhase = GamePhase.Phase1_PickField;
            }
        
            newState.activeQuestion = null;
            newState.answerResult = null;
            newState.phase1Selections = {};
            return newState;
        }

        case 'RESOLVE_TURN':
            if (!state) return null;
            return resolveTurn(state);
            
        case 'CLEAR_ANSWER_FEEDBACK':
            return state ? { ...state, answerResult: null } : null;
        
        case 'CLEAR_ELIMINATION_FEEDBACK':
            return state ? { ...state, eliminationResult: null } : null;

        case 'UPDATE_PLAYERS':
            return state ? { ...state, players: action.payload } : null;

        case 'PASS_BOT_TURN': {
            if (!state) return state;
            let newState = JSON.parse(JSON.stringify(state));
            const { botId, reason } = action.payload;
            const bot = newState.players.find((p: Player) => p.id === botId)!;
            newState.gameLog.push(`${bot.name} (Bot) přeskakuje tah: ${reason}`);
            
            newState = advanceTurnAndRound(newState);
            return newState;
        }
        
        // FIX: Implemented logic for auto-selecting a field on timeout.
        case 'AUTO_SELECT_FIELD': {
            if (!state || state.gamePhase !== GamePhase.Phase1_PickField) return state;
            const humanPlayer = state.players.find(p => !p.isBot);
            if (!humanPlayer || (state.phase1Selections && state.phase1Selections[humanPlayer.id] != null)) {
                return state;
            }

            const availableFields = state.board.filter(f => f.type === 'NEUTRAL' && !f.ownerId && !Object.values(state.phase1Selections || {}).includes(f.id));
            if (availableFields.length === 0) {
                return state;
            }
            
            const randomFieldIndex = Math.floor(Math.random() * availableFields.length);
            const selectedField = availableFields[randomFieldIndex];

            const newState = JSON.parse(JSON.stringify(state));
            newState.phase1Selections[humanPlayer.id] = selectedField.id;
            newState.gameLog.push(`${humanPlayer.name} did not select a field. One was chosen automatically.`);
            
            // Now handle bot selections immediately
            const remainingFields = availableFields.filter(f => f.id !== selectedField.id);
            newState.players.filter((p: Player) => p.isBot && !p.isEliminated).forEach((bot: Player) => {
                if (remainingFields.length > 0) {
                    const botFieldIndex = Math.floor(Math.random() * remainingFields.length);
                    const botField = remainingFields.splice(botFieldIndex, 1)[0];
                    newState.phase1Selections[bot.id] = botField.id;
                }
            });

            newState.gamePhase = GamePhase.Phase1_ShowQuestion;
            return newState;
        }

        case 'SET_STATE':
            if (!state) return null;
            if (action.payload.gamePhase === 'SETUP') return null; // Reset game
            return { ...state, ...action.payload };

        default:
            return state;
    }
};