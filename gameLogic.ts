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
    
    const radius = playerCount <= 2 ? 1 : 2;
    let board: Field[] = [];
    let fieldIdCounter = 0;

    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
          board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
      }
    }

    const basePositions = playerCount <= 2
      ? [{ q: 1, r: -1 }, { q: -1, r: 1 }]
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

const getAttackers = (players: Player[]): Player[] => {
    const activePlayers = players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) return [];
    
    const sortedPlayers = [...activePlayers].sort((a, b) => a.score - b.score);
    const attackerCount = Math.max(1, Math.floor(sortedPlayers.length / 2));
    
    return sortedPlayers.slice(0, attackerCount);
};

const resolveTurn = (state: GameState, tieBreakerQuestion?: Question): GameState => {
    let newState = JSON.parse(JSON.stringify(state));
    if (!newState.activeQuestion) return newState;

    const { attackerId, defenderId, targetFieldId, playerAnswers, question, actionType, isBaseAttack } = newState.activeQuestion;
    
    const attacker = newState.players.find((p: Player) => p.id === attackerId);
    const field = newState.board.find((f: Field) => f.id === targetFieldId);
    let elimination: { eliminatedPlayerName: string, attackerName: string } | null = null;
    
    const attackerAnswer = playerAnswers[attackerId];
    const isAttackerCorrect = normalizeAnswer(attackerAnswer || "") === normalizeAnswer(question.correctAnswer);
    
    if (defenderId) {
        const defenderAnswer = playerAnswers[defenderId];
        const isDefenderCorrect = normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer);
        
        if (isAttackerCorrect && isDefenderCorrect && !isBaseAttack && !newState.activeQuestion.isTieBreaker) {
            if (tieBreakerQuestion) {
                 newState.activeQuestion = {
                    ...newState.activeQuestion,
                    question: tieBreakerQuestion,
                    questionType: 'OPEN_ENDED',
                    isTieBreaker: true,
                    playerAnswers: { [attackerId]: null, [defenderId]: null },
                    startTime: Date.now(),
                 };
                 newState.questionHistory.push(tieBreakerQuestion.question);
                 newState.gameLog.push(`ROZSTŘEL mezi ${attacker.name} a ${newState.players.find((p:Player) => p.id === defenderId).name}!`);
                 return newState;
            } else {
                 newState.gameLog.push("Chyba při generování rozstřelu, kolo končí remízou.");
            }
        }
    }
    
    if (actionType === 'HEAL') {
        if (isAttackerCorrect) {
            field.hp = Math.min(field.maxHp, field.hp + 1);
            attacker.score += POINTS.HEAL_SUCCESS;
            newState.gameLog.push(`${attacker.name} si úspěšně opravil základnu.`);
        } else {
            attacker.score += POINTS.HEAL_FAIL_PENALTY;
            newState.gameLog.push(`${attacker.name} neuspěl při opravě.`);
        }
    } else if (actionType === 'ATTACK') {
         if (defenderId) {
            const defender = newState.players.find((p: Player) => p.id === defenderId);
            const defenderAnswer = playerAnswers[defenderId];
            const isDefenderCorrect = normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer);
            
            if (isAttackerCorrect && (!isDefenderCorrect || isBaseAttack)) {
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
            } else {
                attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                newState.gameLog.push(`Útok hráče ${attacker.name} se nezdařil.`);
            }
            
            if (field.hp <= 0) {
                field.ownerId = attackerId;
                field.hp = field.maxHp;
                if (isBaseAttack) {
                    attacker.score += POINTS.BASE_DESTROY_BONUS + Math.max(0, defender.score);
                    attacker.coins += ELIMINATION_COIN_BONUS;
                    defender.score = 0;
                    defender.isEliminated = true;
                    elimination = { eliminatedPlayerName: defender.name, attackerName: attacker.name };
                    newState.gameLog.push(`${attacker.name} ZNIČIL základnu hráče ${defender.name}!`);
                    newState.board.forEach((f: Field) => { if (f.ownerId === defender.id) f.ownerId = attacker.id; });
                }
            }
        } else { // Attacking black field
            if (isAttackerCorrect) {
                field.ownerId = attackerId;
                field.type = FieldType.Neutral;
                field.hp = field.maxHp;
                attacker.score += POINTS.BLACK_FIELD_CLAIM;
                newState.gameLog.push(`${attacker.name} zabral černé území!`);
            } else {
                attacker.score += POINTS.BLACK_FIELD_FAIL;
                newState.gameLog.push(`${attacker.name} neuspěl na černém území.`);
            }
        }
    }
    
    newState.players.forEach((p: Player) => {
        if (p.score < 0 && !state.players.find(op => op.id === p.id)!.isEliminated) {
            p.isEliminated = true;
            elimination = { eliminatedPlayerName: p.name, attackerName: 'Záporné skóre' };
            newState.gameLog.push(`${p.name} byl vyřazen kvůli záporným bodům!`);
            newState.board.forEach((f: Field) => {
                if (f.ownerId === p.id && f.type !== FieldType.PlayerBase) { f.ownerId = null; f.type = FieldType.Black; }
            });
        }
    });

    const activePlayers = newState.players.filter((p: Player) => !p.isEliminated);
    if (activePlayers.length <= 1) {
        newState.gamePhase = GamePhase.GameOver;
        newState.winners = activePlayers;
    } else {
        const currentAttackers = getAttackers(newState.players);
        const currentAttackerInListIndex = currentAttackers.findIndex(p => p.id === attackerId);
        
        if (currentAttackerInListIndex === -1 || currentAttackerInListIndex === currentAttackers.length - 1 || currentAttackers.length === 0) {
            newState.round += 1;
            if (newState.round > PHASE_DURATIONS.PHASE2_ROUNDS) {
                newState.gamePhase = GamePhase.GameOver;
                const highestScore = Math.max(...activePlayers.map(p => p.score));
                newState.winners = activePlayers.filter(p => p.score === highestScore);
            } else {
                const nextRoundAttackers = getAttackers(newState.players);
                if (nextRoundAttackers.length > 0) {
                    newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextRoundAttackers[0].id);
                } else {
                     newState.gamePhase = GamePhase.GameOver;
                     newState.winners = activePlayers;
                }
            }
        } else {
            const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
            newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextAttacker.id);
        }
    }
    
    newState.activeQuestion = null;
    newState.answerResult = null;
    if (elimination) newState.eliminationResult = elimination;

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
            const bot = newState.players.find((p: Player) => p.id === botId);
            newState.gameLog.push(`${bot.name} (Bot) přeskakuje tah: ${reason}`);
            
            const currentAttackers = getAttackers(newState.players);
            const currentAttackerInListIndex = currentAttackers.findIndex(p => p.id === botId);
            if (currentAttackerInListIndex === -1 || currentAttackerInListIndex === currentAttackers.length - 1 || currentAttackers.length === 0) {
                newState.round += 1;
                const nextRoundAttackers = getAttackers(newState.players);
                if(nextRoundAttackers.length > 0) newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextRoundAttackers[0].id);
            } else {
                 const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
                newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextAttacker.id);
            }
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
