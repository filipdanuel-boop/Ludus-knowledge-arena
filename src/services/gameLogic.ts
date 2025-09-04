
import { GameState, GameAction, Player, Field, GamePhase, FieldType, Category, User, Question, QuestionDifficulty } from '../types';
import { CATEGORIES, PLAYER_COLORS, BASE_HP, FIELD_HP, BOT_NAMES, POINTS, PHASE_DURATIONS, ELIMINATION_COIN_BONUS, BOT_SUCCESS_RATES, XP_PER_CORRECT_ANSWER, XP_DIFFICULTY_MULTIPLIER } from '../constants';
import { normalizeAnswer } from '../utils';

// FIX: Updated function signature and logic to match new `INITIALIZE_GAME` payload.
export const createInitialGameState = ({ players: initialPlayers, user, botDifficulty, allowedCategories }: { players: Player[]; user: User; botDifficulty: QuestionDifficulty; allowedCategories: Category[] }): GameState => {
    const playerCount = initialPlayers.length;
    
    const players: Player[] = initialPlayers.map((p, i) => ({
        ...p, // a-d
        id: p.id,
        name: p.name,
        isBot: p.isBot,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        score: 0,
        coins: p.isBot ? 1000 : user.luduCoins,
        mainBaseCategory: CATEGORIES[i % CATEGORIES.length],
        usedAttackCategories: [],
        finalPoints: 0,
        isEliminated: false,
    }));
    
    // For 2 players, expand from radius 3 to 4.
    // For 3-4 players, expand from radius 4 to 5. This ensures enough neutral fields for selection.
    const radius = playerCount <= 2 ? 4 : 5;
    let board: Field[] = [];
    let fieldIdCounter = 0;

    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
          board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
      }
    }
    
    // Reposition bases to be further apart on the larger map, ensuring they are not on the edge to provide more starting options.
    const basePositions = playerCount <= 2
      ? [{ q: 3, r: -4 }, { q: -3, r: 4 }] // Repositioned for new radius 4 map
      : [{ q: 4, r: 0 }, { q: -4, r: 0 }, { q: 2, r: -5 }, { q: -2, r: 5 }]; // New balanced positions for 4 players on radius 5 map.

    const assignedBaseCoords = new Set<string>();

    players.forEach((player, i) => {
        const pos = basePositions[i % basePositions.length]; // Use modulo for 3 players
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
    
    const shuffledCategories = [...allowedCategories].sort(() => 0.5 - Math.random());

    neutralFields.forEach((field, i) => {
        field.type = FieldType.Neutral;
        field.category = shuffledCategories[i % shuffledCategories.length];
        field.hp = FIELD_HP;
        field.maxHp = FIELD_HP;
    });
    
    // FIX: Initialize `matchStats` for the new GameState structure.
    const matchStats = players.reduce((acc, player) => {
        acc[player.id] = {
            xpEarned: 0,
            correct: 0,
            total: 0,
            categories: allowedCategories.reduce((catAcc, cat) => {
                catAcc[cat] = { correct: 0, total: 0 };
                return catAcc;
            }, {} as Record<Category, { correct: number; total: number }>)
        };
        return acc;
    }, {} as GameState['matchStats']);
    
    return {
        players,
        board: board.filter(f => f.type !== FieldType.Empty),
        gamePhase: GamePhase.Phase1_LandGrab,
        currentTurnPlayerIndex: 0,
        round: 1,
        gameLog: [`Hra začala s ${playerCount} hráči.`],
        activeQuestion: null,
        winners: null,
        phase1Selections: {},
        gameStartTime: Date.now(),
        answerResult: null,
        eliminationResult: null,
        // FIX: Use `user.stats.answeredQuestions` instead of the removed `user.questionHistory`.
        questionHistory: [...user.stats.answeredQuestions],
        // FIX: Add missing properties to the returned GameState object.
        botDifficulty,
        allowedCategories,
        matchStats,
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
export const decideBotAction = (gameState: GameState): { action: 'HEAL' | 'ATTACK' | 'PASS', targetField?: Field, category?: Category, reason?: string } => {
    const bot = gameState.players[gameState.currentTurnPlayerIndex];
    const botBase = gameState.board.find(f => f.ownerId === bot.id && f.type === 'PLAYER_BASE');

    // Heal decision
    if (botBase && botBase.hp < botBase.maxHp && (botBase.hp === 1 || Math.random() < 0.5)) {
        return { action: 'HEAL', targetField: botBase, category: botBase.category! };
    }
    
    // Attack decision
    const validTargets = gameState.board.filter(f => f.ownerId && f.ownerId !== bot.id && !gameState.players.find(p => p.id === f.ownerId)?.isBot);
    if (validTargets.length === 0) {
        return { action: 'PASS', reason: "Nebyly nalezeny žádné platné cíle." };
    }

    const targetField = validTargets[Math.floor(Math.random() * validTargets.length)];
    const isBaseAttack = targetField.type === 'PLAYER_BASE';
    let category: Category;

    if (isBaseAttack) {
        category = targetField.category!;
    } else if (targetField.type === 'BLACK') {
        category = gameState.allowedCategories[Math.floor(Math.random() * gameState.allowedCategories.length)];
    } else {
        const availableCategories = gameState.allowedCategories.filter(c => !bot.usedAttackCategories.includes(c));
        if (availableCategories.length === 0) { 
            bot.usedAttackCategories = [];
            const refreshedCategories = gameState.allowedCategories.filter(c => !bot.usedAttackCategories.includes(c));
            if(refreshedCategories.length === 0) return { action: 'PASS', reason: "Vyčerpány kategorie." };
            category = refreshedCategories[Math.floor(Math.random() * refreshedCategories.length)];
        } else {
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        }
    }

    return { action: 'ATTACK', targetField, category };
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

// FIX: Removed `tieBreakerQuestion` payload and updated logic to handle draws as defender wins.
const handleAttackAction = (state: GameState): GameState => {
    const { attackerId, defenderId, targetFieldId, playerAnswers, question, isBaseAttack, isTieBreaker } = state.activeQuestion!;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.id === targetFieldId)!;
    
    // Handle player vs player combat
    if (defenderId) {
        const defender = state.players.find(p => p.id === defenderId)!;
        const isAttackerCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
        const isDefenderCorrect = normalizeAnswer(playerAnswers[defenderId] || "") === normalizeAnswer(question.correctAnswer);

        if ((isAttackerCorrect && !isDefenderCorrect) || (isTieBreaker && isAttackerCorrect && isDefenderCorrect)) { // Attacker wins
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
        } else if (isDefenderCorrect) { // Defender wins (or it's a non-tiebreaker draw)
            attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
            if (!isBaseAttack) defender.score += POINTS.ATTACK_WIN_DEFENDER;
            state.gameLog.push(`${defender.name} ubránil své území.`);
        } else { // Both wrong
            attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
            state.gameLog.push(`Útok hráče ${attacker.name} se nezdařil, oba odpověděli špatně.`);
        }
    } else { // Handle attacking neutral/black field
        const isAttackerCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
        if (isAttackerCorrect) {
            field.ownerId = attackerId;
            field.type = FieldType.Neutral;
            field.hp = field.maxHp;
            attacker.score += POINTS.BLACK_FIELD_CLAIM;
            state.gameLog.push(`${attacker.name} zabral černé území!`);
        } else {
            attacker.score += POINTS.BLACK_FIELD_FAIL;
            state.gameLog.push(`${attacker.name} neuspěl na černém území.`);
        }
    }
    return state;
};

// FIX: Removed negative score elimination to align with new rules.
const checkForEliminations = (state: GameState): GameState => {
    if (!state.activeQuestion) return state;

    const { attackerId, targetFieldId, isBaseAttack } = state.activeQuestion;
    
    if (isBaseAttack) {
        const field = state.board.find(f => f.id === targetFieldId)!;
        if (field.hp <= 0) {
            const attacker = state.players.find(p => p.id === attackerId)!;
            const defender = state.players.find(p => p.id === field.ownerId)!;
            attacker.score += POINTS.BASE_DESTROY_BONUS;
            attacker.coins += ELIMINATION_COIN_BONUS;
            defender.isEliminated = true;
            state.eliminationResult = { eliminatedPlayerName: defender.name, attackerName: attacker.name };
            state.gameLog.push(`${attacker.name} ZNIČIL základnu hráče ${defender.name}!`);
            state.board.forEach(f => { if (f.ownerId === defender.id) f.ownerId = attacker.id; });
        }
    }
    return state;
};

const advanceTurnAndRound = (state: GameState): GameState => {
    const activePlayers = state.players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
        state.gamePhase = GamePhase.GameOver;
        state.winners = activePlayers;
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
            state.winners = activePlayers.filter(p => p.score === highestScore);
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

    return state;
};

// FIX: New unified combat resolution function.
const resolveCombat = (state: GameState): GameState => {
    let newState = JSON.parse(JSON.stringify(state));

    if (newState.gamePhase === GamePhase.Phase1_ResolveRound) {
        const { playerAnswers, question } = newState.activeQuestion!;
        
        Object.entries(newState.phase1Selections).forEach(([playerId, fieldId]) => {
            if(fieldId === null) return;
            const player = newState.players.find((p: Player) => p.id === playerId)!;
            const field = newState.board.find((f: Field) => f.id === fieldId)!;
            const isCorrect = normalizeAnswer(playerAnswers[playerId] || '') === normalizeAnswer(question.correctAnswer);
            
            if (field.ownerId) return;

            if (isCorrect) {
                field.ownerId = playerId;
                player.score += POINTS.PHASE1_CLAIM;
                newState.gameLog.push(`${player.name} zabral pole.`);
            } else {
                field.type = FieldType.Black;
                newState.gameLog.push(`${player.name} neuspěl, pole zčernalo.`);
            }
        });

        newState.round += 1;
        if (newState.round > PHASE_DURATIONS.PHASE1_ROUNDS) {
            newState.gamePhase = GamePhase.Phase2_Attacks;
            newState.round = 1;
            const attackers = getAttackers(newState.players);
            if (attackers.length > 0) {
                newState.currentTurnPlayerIndex = newState.players.findIndex((p:Player) => p.id === attackers[0].id);
            }
            newState.gameLog.push("--- Fáze 2: Útoky začaly! ---");
        } else {
            newState.gamePhase = GamePhase.Phase1_LandGrab;
        }

        newState.activeQuestion = null;
        newState.phase1Selections = {};
        newState.answerResult = null;
        return newState;
    }

    if (newState.gamePhase === GamePhase.Phase2_CombatResolve || newState.gamePhase === GamePhase.Phase2_Tiebreaker) {
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
        newState.answerResult = null;
        newState.gamePhase = GamePhase.Phase2_Attacks;
        return newState;
    }

    return newState;
}

// FIX: Entire reducer refactored to match new actions and game flow.
export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    if (!state && action.type !== 'INITIALIZE_GAME') return null;

    switch (action.type) {
        case 'INITIALIZE_GAME':
            return createInitialGameState(action.payload);

        case 'SET_PHASE1_SELECTION': {
            if (!state || state.gamePhase !== GamePhase.Phase1_LandGrab) return state;
            const newState = {
                ...state,
                phase1Selections: { ...state.phase1Selections, [action.payload.playerId]: action.payload.fieldId }
            };
            const allPlayersSelected = newState.players.every(p => p.isEliminated || newState.phase1Selections?.[p.id] != null);
            if (allPlayersSelected) {
                newState.gamePhase = GamePhase.Phase1_ShowQuestion;
            }
            return newState;
        }

        case 'SET_QUESTION':
            if (!state) return null;
            return {
                ...state,
                questionHistory: [...state.questionHistory, action.payload!.question.question],
                activeQuestion: action.payload
            };
        
        case 'SET_TIEBREAKER_QUESTION': {
             if (!state || !state.activeQuestion || !state.activeQuestion.defenderId) return state;
             const attacker = state.players.find(p => p.id === state.activeQuestion!.attackerId);
             const defender = state.players.find(p => p.id === state.activeQuestion!.defenderId);
             return {
                ...state,
                gamePhase: GamePhase.Phase2_Attacks,
                activeQuestion: {
                    ...state.activeQuestion,
                    question: action.payload.question,
                    questionType: 'OPEN_ENDED',
                    isTieBreaker: true,
                    playerAnswers: { [state.activeQuestion.attackerId]: null, [state.activeQuestion.defenderId]: null },
                    startTime: Date.now(),
                },
                questionHistory: [...state.questionHistory, action.payload.question.question],
                gameLog: [...state.gameLog, `ROZSTŘEL mezi ${attacker?.name} a ${defender?.name}!`],
            };
        }

        case 'CLEAR_QUESTION':
            if (!state) return null;
            return { ...state, activeQuestion: null };
        
        case 'SUBMIT_ANSWER': {
            if (!state || !state.activeQuestion) return state;
            const { playerId, answer } = action.payload;
            const { question, attackerId, defenderId } = state.activeQuestion;
            const isCorrect = normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer);

            const statPlayer = state.matchStats[playerId];
            if(statPlayer){
                statPlayer.total++;
                if(isCorrect) {
                    statPlayer.correct++;
                    statPlayer.xpEarned += XP_PER_CORRECT_ANSWER * XP_DIFFICULTY_MULTIPLIER[question.difficulty];
                }
            }

            const newState: GameState = {
                ...state,
                activeQuestion: {
                    ...state.activeQuestion,
                    playerAnswers: { ...state.activeQuestion.playerAnswers, [playerId]: answer }
                },
                answerResult: { playerId, isCorrect, correctAnswer: state.activeQuestion.question.correctAnswer }
            };

            const allPlayersAnswered = Object.values(newState.activeQuestion.playerAnswers).every(ans => ans !== null);

            if (allPlayersAnswered) {
                 if (state.gamePhase === GamePhase.Phase1_ShowQuestion) {
                    newState.gamePhase = GamePhase.Phase1_ResolveRound;
                } else {
                    const attackerAnswer = newState.activeQuestion.playerAnswers[attackerId];
                    const defenderAnswer = defenderId ? newState.activeQuestion.playerAnswers[defenderId] : null;
                    const isAttackerCorrect = normalizeAnswer(attackerAnswer || "") === normalizeAnswer(question.correctAnswer);
                    const isDefenderCorrect = defenderId ? normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer) : false;

                    if (isAttackerCorrect && isDefenderCorrect && !newState.activeQuestion.isTieBreaker) {
                         newState.gamePhase = GamePhase.Phase2_Tiebreaker;
                    } else {
                         newState.gamePhase = GamePhase.Phase2_CombatResolve;
                    }
                }
            }
            return newState;
        }

        case 'RESOLVE_COMBAT':
            if (!state) return null;
            return resolveCombat(state);
            
        case 'SET_ANSWER_FEEDBACK':
            return state ? { ...state, answerResult: action.payload } : null;

        case 'CLEAR_ANSWER_FEEDBACK':
            return state ? { ...state, answerResult: null } : null;
        
        case 'SET_ELIMINATION_FEEDBACK':
            return state ? { ...state, eliminationResult: action.payload } : null;

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

        case 'SET_STATE':
            if (!state) return null;
            if (action.payload.gamePhase === 'SETUP') return null; // Reset game
            return { ...state, ...action.payload };

        default:
            return state;
    }
};