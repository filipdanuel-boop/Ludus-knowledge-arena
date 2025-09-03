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
    
    const radius = 3;
    let board: Field[] = [];
    let fieldIdCounter = 0;

    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
          board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
      }
    }

    const basePositions = playerCount <= 2
      ? [{ q: 3, r: 0 }, { q: -3, r: 0 }]
      : [{ q: 3, r: 0 }, { q: -3, r: 0 }, { q: 0, r: 3 }, { q: 0, r: -3 }];

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
        gamePhase: GamePhase.TransitionToPhase1,
        currentTurnPlayerIndex: 0,
        round: 1,
        gameLog: [`Hra začala s ${playerCount} hráči.`],
        activeQuestion: null,
        winners: null,
        phase1Selections: {},
        gameStartTime: Date.now(),
        phaseStartTime: Date.now(),
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

    // --- EASY BOT ---
    if (difficulty === 'easy') {
        const botBase = gameState.board.find(f => f.ownerId === bot.id && f.type === 'PLAYER_BASE');
        if (botBase && botBase.hp < botBase.maxHp && Math.random() < 0.25) {
            return { action: 'HEAL', targetField: botBase, category: botBase.category!, difficulty: 'easy' };
        }
        const validTargets = gameState.board.filter(f => (f.ownerId !== null && f.ownerId !== bot.id) || f.type === 'BLACK');
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
                availableCategories = [...CATEGORIES];
            }
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        }
        return { action: 'ATTACK', targetField, category, difficulty: questionDifficulty };
    }

    // --- MEDIUM & HARD BOTS ---
    const possibleActions: { score: number; action: 'HEAL' | 'ATTACK'; targetField: Field }[] = [];
    const botBase = gameState.board.find(f => f.ownerId === bot.id && f.type === 'PLAYER_BASE')!;

    // 1. Calculate score for healing
    if (botBase.hp < botBase.maxHp) {
        let healScore = (botBase.maxHp - botBase.hp) * 30; // e.g., 1 missing HP = 30 points
        if (botBase.hp === 1) healScore += 70; // high priority if base is at 1 HP
        possibleActions.push({ score: healScore, action: 'HEAL', targetField: botBase });
    }

    // 2. Calculate scores for all possible attack targets
    const potentialTargets = gameState.board.filter(f => (f.ownerId !== null && f.ownerId !== bot.id) || f.type === 'BLACK');
    const highestScore = Math.max(...gameState.players.filter(p => !p.isEliminated).map(p => p.score));

    for (const targetField of potentialTargets) {
        let attackScore = 10; // base score for any attack
        const targetPlayer = gameState.players.find(p => p.id === targetField.ownerId);

        if (targetField.type === 'PLAYER_BASE') {
            attackScore += 60; // high priority for base attack
            attackScore += (targetField.maxHp - targetField.hp) * 25; // prioritize damaged bases
        } else if (targetField.type === 'BLACK') {
            attackScore += 5; // low priority for black fields
        } else { // Normal player-owned field
            attackScore += 15;
        }

        if (targetPlayer) {
            attackScore += (highestScore - targetPlayer.score) / 50;
            const territoryCount = gameState.board.filter(f => f.ownerId === targetPlayer.id).length;
            attackScore += (10 - territoryCount) * 3;
            if (!targetPlayer.isBot) attackScore *= 1.1; // Prioritize human player
        }
        possibleActions.push({ score: attackScore, action: 'ATTACK', targetField });
    }

    // 3. Choose action based on scores and difficulty
    if (possibleActions.length === 0) {
        return { action: 'PASS', reason: "No valid actions found." };
    }

    possibleActions.sort((a, b) => b.score - a.score); // sort descending by score

    let chosenAction = possibleActions[0]; // Default to best action for hard bot
    if (difficulty === 'medium' && Math.random() > 0.65) { // 35% chance for medium bot to not pick the best action
        chosenAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }

    // 4. Determine category and question difficulty for chosen action
    const { action, targetField } = chosenAction;
    let category: Category;
    let questionDifficulty: QuestionDifficulty;

    if (action === 'HEAL') {
        category = targetField.category!;
        questionDifficulty = 'medium';
    } else { // ATTACK
        let availableCategories = CATEGORIES.filter(c => !bot.usedAttackCategories.includes(c));
        if (availableCategories.length === 0) {
            availableCategories = [...CATEGORIES];
        }

        if (targetField.type === 'PLAYER_BASE') {
            category = targetField.category!;
            questionDifficulty = 'hard';
        } else if (targetField.type === 'BLACK') {
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
            questionDifficulty = 'medium';
        } else { // Normal field
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
            questionDifficulty = 'easy';
        }
    }

    return { action, targetField, category, difficulty: questionDifficulty };
};


// --- Game State Machine ---

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
            } else {
                 state.gamePhase = GamePhase.GameOver;
                 state.winners = activePlayers;
            }
        }
    } else {
        const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
        state.currentTurnPlayerIndex = state.players.findIndex(p => p.id === nextAttacker.id);
    }

    state.gamePhase = GamePhase.Phase2_Attacks;
    return state;
};

const checkForEliminations = (state: GameState): GameState => {
    if (!state.activeQuestion) return state;
    const { attackerId, targetFieldId, isBaseAttack } = state.activeQuestion;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.id === targetFieldId)!;
    
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
    return state;
};


export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    if (!state && action.type !== 'INITIALIZE_GAME') return null;

    switch (action.type) {
        case 'INITIALIZE_GAME':
            return createInitialGameState(action.payload.playerCount, action.payload.user, action.payload.isOnlineMode, action.payload.botDifficulty || 'medium');

        case 'SET_PHASE1_SELECTION': {
            if (!state) return null;
            const updatedSelections = { ...state.phase1Selections, [action.payload.playerId]: action.payload.fieldId };
            
            const activePlayers = state.players.filter(p => !p.isEliminated);
            const allPlayersSelected = activePlayers.every(p => updatedSelections[p.id] != null);

            if (allPlayersSelected) {
                return { ...state, phase1Selections: updatedSelections, gamePhase: GamePhase.Phase1_ShowQuestion, phaseStartTime: Date.now() };
            }
            return { ...state, phase1Selections: updatedSelections };
        }

        case 'SET_QUESTION': {
            if (!state) return state;
            const { attackerId, actionType, category, question, isBaseAttack } = action.payload!;
            const newState = JSON.parse(JSON.stringify(state));
            const attacker = newState.players.find((p: Player) => p.id === attackerId);

            // CRITICAL FIX for category usage cycle.
            if (attacker && actionType === 'ATTACK' && !isBaseAttack) {
                let used = [...attacker.usedAttackCategories];
                // If a new cycle starts (player chose from a full list of options), reset their used list first.
                if (used.length === CATEGORIES.length) {
                    used = [];
                }
                if (!used.includes(category)) {
                    used.push(category);
                }
                attacker.usedAttackCategories = used;
            }
            
            newState.questionHistory.push(question.question);
            newState.activeQuestion = action.payload;
            return newState;
        }

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
            
            let nextPhase = state.gamePhase;
            const allAnswered = Object.values(updatedActiveQuestion.playerAnswers).every(ans => ans !== null);
            if (allAnswered) {
                if(state.gamePhase === GamePhase.Phase1_ShowQuestion) {
                    nextPhase = GamePhase.Phase1_ResolveRound;
                } else {
                    nextPhase = GamePhase.Phase2_CombatResolve;
                }
            }

            return {
                ...state,
                activeQuestion: updatedActiveQuestion,
                answerResult: { playerId, isCorrect },
                matchStats: newMatchStats,
                gamePhase: nextPhase,
            };
        }

        case 'RESOLVE_COMBAT': {
            if (!state) return state;
            let newState = JSON.parse(JSON.stringify(state));
            if (!newState.activeQuestion) return newState;

            const { actionType, attackerId, defenderId, isBaseAttack, isTieBreaker, playerAnswers, question, targetFieldId } = newState.activeQuestion;
            const attacker = newState.players.find((p: Player) => p.id === attackerId)!;
            const field = newState.board.find((f: Field) => f.id === targetFieldId)!;

            if (actionType === 'HEAL') {
                const isCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
                if (isCorrect) {
                    field.hp = Math.min(field.maxHp, field.hp + 1);
                    attacker.score += POINTS.HEAL_SUCCESS;
                    newState.gameLog.push(`${attacker.name} si úspěšně opravil základnu.`);
                } else {
                    attacker.score += POINTS.HEAL_FAIL_PENALTY;
                    newState.gameLog.push(`${attacker.name} neuspěl při opravě.`);
                }
            } else if (actionType === 'ATTACK') {
                const isAttackerCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
                if (defenderId) {
                    const defender = newState.players.find((p: Player) => p.id === defenderId)!;
                    const isDefenderCorrect = normalizeAnswer(playerAnswers[defenderId] || "") === normalizeAnswer(question.correctAnswer);
                    
                    if (isAttackerCorrect && isDefenderCorrect && !isBaseAttack && !isTieBreaker) {
                        newState.gamePhase = GamePhase.Phase2_Tiebreaker;
                        newState.gameLog.push(`ROZSTŘEL mezi ${attacker.name} a ${defender.name}!`);
                        return newState;
                    }
                    
                    if (isAttackerCorrect && !isDefenderCorrect) {
                        field.hp -= 1;
                        if (isBaseAttack) {
                            attacker.score += POINTS.ATTACK_DAMAGE;
                            newState.gameLog.push(`${attacker.name} zasáhl základnu hráče ${defender.name}!`);
                        } else {
                            field.ownerId = attackerId;
                            field.hp = field.maxHp;
                            attacker.score += POINTS.ATTACK_WIN;
                            defender.score += POINTS.ATTACK_LOSS_DEFENDER;
                            newState.gameLog.push(`${attacker.name} dobyl území od hráče ${defender.name}!`);
                        }
                    } else if (!isAttackerCorrect && isDefenderCorrect) {
                        attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                        if (!isBaseAttack) defender.score += POINTS.ATTACK_WIN_DEFENDER;
                        newState.gameLog.push(`${defender.name} ubránil své území.`);
                    } else if (isAttackerCorrect && isDefenderCorrect) {
                        newState.gameLog.push(`Souboj mezi ${attacker.name} a ${defender.name} skončil remízou!`);
                    } else {
                        attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                        newState.gameLog.push(`Útok hráče ${attacker.name} se nezdařil, oba odpověděli špatně.`);
                    }
                } else { // This handles Phase 1 land grab
                    newState.players.forEach((player: Player) => {
                         const fieldToUpdateId = newState.phase1Selections[player.id];
                         if (fieldToUpdateId === null || fieldToUpdateId === undefined) return;

                         const fieldToUpdate = newState.board.find((f: Field) => f.id === fieldToUpdateId)!;
                         const playerAnswer = playerAnswers[player.id];
                         const wasCorrect = normalizeAnswer(playerAnswer || '') === normalizeAnswer(question.correctAnswer);

                         if (wasCorrect) {
                             fieldToUpdate.ownerId = player.id;
                             player.score += POINTS.PHASE1_CLAIM;
                             newState.gameLog.push(`${player.name} zabral pole.`);
                         } else {
                             fieldToUpdate.type = FieldType.Black;
                             newState.gameLog.push(`${player.name} neuspěl, pole zčernalo.`);
                         }
                    });
                }
            }

            newState = checkForEliminations(newState);
            newState.activeQuestion = null;

            if (newState.gamePhase === GamePhase.Phase1_ResolveRound) {
                newState.round++;
                if (newState.round > PHASE_DURATIONS.PHASE1_ROUNDS) {
                    newState.gamePhase = GamePhase.TransitionToPhase2;
                    newState.round = 1;
                    newState.gameLog.push("--- Fáze 1 skončila! ---");
                } else {
                    newState.gamePhase = GamePhase.Phase1_PickField;
                    newState.phaseStartTime = Date.now();
                }
                newState.phase1Selections = {};
            } else {
                newState = advanceTurnAndRound(newState);
            }
            
            return newState;
        }

        case 'SET_TIEBREAKER_QUESTION': {
            if (!state || !state.activeQuestion) return state;
            const { attackerId, defenderId } = state.activeQuestion;
            return {
                ...state,
                questionHistory: [...state.questionHistory, action.payload.question.question],
                activeQuestion: {
                    ...state.activeQuestion,
                    question: action.payload.question,
                    questionType: 'OPEN_ENDED',
                    isTieBreaker: true,
                    playerAnswers: { [attackerId]: null, [defenderId!]: null },
                    startTime: Date.now()
                }
            };
        }

        case 'CLEAR_ANSWER_FEEDBACK':
            return state ? { ...state, answerResult: null } : null;
        
        case 'CLEAR_ELIMINATION_FEEDBACK':
            return state ? { ...state, eliminationResult: null } : null;

        case 'PASS_BOT_TURN': {
            if (!state) return state;
            let newState = JSON.parse(JSON.stringify(state));
            const { botId, reason } = action.payload;
            const bot = newState.players.find((p: Player) => p.id === botId)!;
            newState.gameLog.push(`${bot.name} (Bot) přeskakuje tah: ${reason}`);
            newState = advanceTurnAndRound(newState);
            return newState;
        }
        
        case 'AUTO_SELECT_FIELD': {
            if (!state || state.gamePhase !== GamePhase.Phase1_PickField) return state;
            const humanPlayer = state.players.find(p => !p.isBot)!;
            const selections = { ...(state.phase1Selections || {}) };

            if (selections[humanPlayer.id] == null) {
                const availableFields = state.board.filter(f => f.type === 'NEUTRAL' && !f.ownerId && !Object.values(selections).includes(f.id));
                if (availableFields.length > 0) {
                    selections[humanPlayer.id] = availableFields.splice(Math.floor(Math.random() * availableFields.length), 1)[0].id;
                }
            }
            
            state.players.filter(p => p.isBot && !p.isEliminated).forEach(bot => {
                if (selections[bot.id] == null) {
                    const availableFields = state.board.filter(f => f.type === 'NEUTRAL' && !f.ownerId && !Object.values(selections).includes(f.id));
                     if (availableFields.length > 0) {
                        selections[bot.id] = availableFields.splice(Math.floor(Math.random() * availableFields.length), 1)[0].id;
                    }
                }
            });

            return {
                ...state,
                phase1Selections: selections,
                gamePhase: GamePhase.Phase1_ShowQuestion,
                phaseStartTime: Date.now(),
            };
        }

        case 'SET_STATE':
            if (!state) return null;
            if (action.payload.gamePhase === 'SETUP') return null;
            return { ...state, ...action.payload };

        default:
            return state;
    }
};