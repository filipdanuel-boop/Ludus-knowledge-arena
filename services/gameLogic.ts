import { GameState, GameAction, Player, Field, GamePhase, FieldType, Category, User, Question } from '../types';
import { CATEGORIES, PLAYER_COLORS, BASE_HP, FIELD_HP, BOT_NAMES, POINTS, PHASE_DURATIONS, ELIMINATION_COIN_BONUS } from '../constants';
import { normalizeAnswer } from '../utils';

export const createInitialGameState = (playerCount: number, user: User, isOnlineMode: boolean = false): GameState => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
        const isBot = i !== 0;
        return {
            id: `player-${i+1}`,
            name: isBot ? (isOnlineMode ? BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] : `Bot ${i}`) : 'Vy',
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
    
    const radius = playerCount <= 2 ? 3 : 4;
    let board: Field[] = [];
    let fieldIdCounter = 0;

    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
          board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
      }
    }

    const basePositions = playerCount <= 2
      ? [{ q: 3, r: -3 }, { q: -3, r: 3 }]
      : [{ q: 4, r: 0 }, { q: -4, r: 0 }, { q: 0, r: 4 }, { q: 0, r: -4 }];

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
        questionHistory: user.questionHistory || []
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
    const validTargets = gameState.board.filter(f => f.ownerId !== bot.id && f.type !== 'NEUTRAL');
    if (validTargets.length === 0) {
        return { action: 'PASS', reason: "Nebyly nalezeny žádné platné cíle." };
    }

    const targetField = validTargets[Math.floor(Math.random() * validTargets.length)];
    const isBaseAttack = targetField.type === 'PLAYER_BASE';
    let category: Category;

    if (isBaseAttack) {
        category = targetField.category!;
    } else if (targetField.type === 'BLACK') {
        category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    } else {
        const availableCategories = CATEGORIES.filter(c => !bot.usedAttackCategories.includes(c));
        if (availableCategories.length === 0) { 
            return { action: 'PASS', reason: "Vyčerpány kategorie." }; 
        }
        category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
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

const handleAttackAction = (state: GameState, tieBreakerQuestion?: Question) => {
    const { attackerId, defenderId, targetFieldId, playerAnswers, question, isBaseAttack } = state.activeQuestion!;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.id === targetFieldId)!;
    
    // Handle player vs player combat
    if (defenderId) {
        const defender = state.players.find(p => p.id === defenderId)!;
        const isAttackerCorrect = normalizeAnswer(playerAnswers[attackerId] || "") === normalizeAnswer(question.correctAnswer);
        const isDefenderCorrect = normalizeAnswer(playerAnswers[defenderId] || "") === normalizeAnswer(question.correctAnswer);

        // Check for Tie-Breaker condition
        if (isAttackerCorrect && isDefenderCorrect && !isBaseAttack && !state.activeQuestion!.isTieBreaker) {
            if (tieBreakerQuestion) {
                 state.activeQuestion = {
                    ...state.activeQuestion!,
                    question: tieBreakerQuestion,
                    questionType: 'OPEN_ENDED',
                    isTieBreaker: true,
                    playerAnswers: { [attackerId]: null, [defenderId]: null },
                    startTime: Date.now(),
                 };
                 state.questionHistory.push(tieBreakerQuestion.question);
                 state.gameLog.push(`ROZSTŘEL mezi ${attacker.name} a ${defender.name}!`);
                 return state; // Return early, don't resolve turn yet
            } else {
                // If no tie-breaker, it's a successful defense
                state.gameLog.push(`${defender.name} ubránil své území v napínavém souboji!`);
            }
        }
        
        // Resolve combat
        else if (isAttackerCorrect) { // Attacker wins (covers defender wrong, or base attacks)
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
        } else if (isDefenderCorrect) { // Defender wins
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

const checkForEliminations = (state: GameState): GameState => {
    const { attackerId, targetFieldId, isBaseAttack } = state.activeQuestion!;
    const attacker = state.players.find(p => p.id === attackerId)!;
    const field = state.board.find(f => f.id === targetFieldId)!;
    
    // Check for base destruction elimination
    if (isBaseAttack && field.hp <= 0) {
        const defender = state.players.find(p => p.id === field.ownerId)!;
        attacker.score += POINTS.BASE_DESTROY_BONUS + Math.max(0, defender.score);
        attacker.coins += ELIMINATION_COIN_BONUS;
        defender.score = 0;
        defender.isEliminated = true;
        state.eliminationResult = { eliminatedPlayerName: defender.name, attackerName: attacker.name };
        state.gameLog.push(`${attacker.name} ZNIČIL základnu hráče ${defender.name}!`);
        state.board.forEach(f => { if (f.ownerId === defender.id) f.ownerId = attacker.id; });
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
            state.winners = activePlayers.filter(p => p.score === highestScore);
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


const resolveTurn = (state: GameState, tieBreakerQuestion?: Question): GameState => {
    let newState = JSON.parse(JSON.stringify(state));
    if (!newState.activeQuestion) return newState;

    const { actionType } = newState.activeQuestion;
    
    if (actionType === 'HEAL') {
        newState = handleHealAction(newState);
    } else if (actionType === 'ATTACK') {
        newState = handleAttackAction(newState, tieBreakerQuestion);
        // If a tie-breaker was set, return early without advancing the turn
        if(newState.activeQuestion?.isTieBreaker) return newState;
    }

    newState = checkForEliminations(newState);
    newState = advanceTurnAndRound(newState);
    
    newState.activeQuestion = null;
    newState.answerResult = null;

    return newState;
}

export const gameReducer = (state: GameState | null, action: GameAction): GameState | null => {
    if (!state && action.type !== 'INITIALIZE_GAME') return null;

    switch (action.type) {
        case 'INITIALIZE_GAME':
            return createInitialGameState(action.payload.playerCount, action.payload.user, action.payload.isOnlineMode);

        case 'SET_PHASE1_SELECTION':
            if (!state) return null;
            return {
                ...state,
                phase1Selections: { ...state.phase1Selections, [action.payload.playerId]: action.payload.fieldId }
            };

        case 'SET_QUESTION':
            if (!state) return null;
            return {
                ...state,
                questionHistory: [...state.questionHistory, action.payload!.question.question],
                activeQuestion: action.payload
            };

        case 'CLEAR_QUESTION':
            if (!state) return null;
            return { ...state, activeQuestion: null };
        
        case 'SUBMIT_ANSWER': {
            if (!state || !state.activeQuestion) return state;
            const { playerId, answer } = action.payload;
            const isCorrect = normalizeAnswer(answer) === normalizeAnswer(state.activeQuestion.question.correctAnswer);

            const updatedActiveQuestion = {
                ...state.activeQuestion,
                playerAnswers: { ...state.activeQuestion.playerAnswers, [playerId]: answer }
            };

            return {
                ...state,
                activeQuestion: updatedActiveQuestion,
                answerResult: { playerId, isCorrect, correctAnswer: state.activeQuestion.question.correctAnswer }
            };
        }

        case 'RESOLVE_PHASE1_ROUND': {
            if (!state) return null;
            let newState = JSON.parse(JSON.stringify(state));
            const humanPlayer = newState.players.find((p: Player) => !p.isBot)!;
            const fieldIndex = newState.board.findIndex((f: Field) => f.id === action.payload.fieldId);
        
            if (action.payload.humanActionResult === 'win') {
                newState.board[fieldIndex].ownerId = humanPlayer.id;
                humanPlayer.score += POINTS.PHASE1_CLAIM;
                newState.gameLog.push(`${humanPlayer.name} jste zabral pole a získal ${POINTS.PHASE1_CLAIM} bodů.`);
            } else {
                newState.board[fieldIndex].type = FieldType.Black;
                newState.gameLog.push(`${humanPlayer.name} jste odpověděl špatně. Pole zčernalo.`);
            }
        
            const botSelections = Object.entries(newState.phase1Selections || {}).filter(([playerId]) => playerId !== humanPlayer.id);
            
            for (const [botId, botFieldId] of botSelections) {
                if (botFieldId === null) continue;
                const botPlayer = newState.players.find((p: Player) => p.id === botId)!;
                const botFieldIndex = newState.board.findIndex((f: Field) => f.id === botFieldId);
                if (botFieldIndex !== -1 && newState.board[botFieldIndex].type === FieldType.Neutral && !newState.board[botFieldIndex].ownerId) {
                     if (Math.random() < 0.7) {
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
                }
                newState.gameLog.push("--- Fáze 2: Útoky začaly! ---");
            }
        
            newState.activeQuestion = null;
            newState.phase1Selections = {};
            return newState;
        }

        case 'RESOLVE_TURN':
            if (!state) return null;
            return resolveTurn(state, action.payload?.tieBreakerQuestion);
            
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

        case 'SET_STATE':
            if (!state) return null;
            if (action.payload.gamePhase === 'SETUP') return null; // Reset game
            return { ...state, ...action.payload };

        default:
            return state;
    }
};