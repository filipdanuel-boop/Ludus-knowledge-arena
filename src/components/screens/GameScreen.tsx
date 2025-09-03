import * as React from 'react';
import { GameState, User, Theme, Player, Category, GamePhase } from '../../types';
import { themes } from '../../themes';
import { GameAction } from '../../types';
import { generateQuestion, generateOpenEndedQuestion } from '../../services/geminiService';
import { CATEGORIES, PHASE_DURATIONS, WIN_COINS_PER_PLAYER, BOT_SUCCESS_RATES } from '../../constants';
import { normalizeAnswer } from '../../utils';
import { decideBotAction, getAttackers } from '../../services/gameLogic';
import { useTranslation } from '../../i18n/LanguageContext';
import { GameEventNotification } from '../ui/GameEventNotification';
import * as userService from '../../services/userService';


// Import Game Components
import { GameOverScreen } from '../game/GameOverScreen';
import { HexagonalGameBoard } from '../game/HexagonalGameBoard';
import { PlayerStatusUI } from '../game/PlayerStatusUI';
import { AttackOrderUI } from '../game/AttackOrderUI';
import { QuestionModal } from '../game/QuestionModal';
import { SpectatorQuestionModal } from '../game/SpectatorQuestionModal';
import { CategorySelectionModal } from '../game/CategorySelectionModal';
import { AnswerFeedbackModal } from '../game/AnswerFeedbackModal';
import { EliminationFeedbackModal } from '../game/EliminationFeedbackModal';
import { Spinner } from '../ui/Spinner';
import { PhaseTimerUI } from '../game/PhaseTimerUI';
import { PhaseTransitionScreen } from '../game/PhaseTransitionScreen';

interface GameScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    onBackToLobby: () => void;
    themeConfig: typeof themes[Theme];
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameState, dispatch, user, setUser, onBackToLobby, themeConfig }) => {
    const { t } = useTranslation();
    const [isProcessingQuestion, setIsProcessingQuestion] = React.useState(false);
    const [attackTarget, setAttackTarget] = React.useState<{ targetFieldId: number; defenderId?: string; isBaseAttack: boolean; } | null>(null);
    const [gameTime, setGameTime] = React.useState(0);
    const [boardRotation, setBoardRotation] = React.useState(0);
    const [eventNotification, setEventNotification] = React.useState<{ type: 'info' | 'success' | 'warning' | 'danger', message: string } | null>(null);
    
    const botTurnTimeoutRef = React.useRef<number | null>(null);
    const logicTimeoutRef = React.useRef<number | null>(null);
    const phaseTimerRef = React.useRef<number | null>(null);

    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    if (!currentPlayer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner themeConfig={themeConfig} />
            </div>
        );
    }
    
    React.useEffect(() => {
        const timer = setInterval(() => {
            if (gameState.gamePhase !== GamePhase.GameOver) {
                setGameTime(Date.now() - gameState.gameStartTime);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.gamePhase, gameState.gameStartTime]);

    React.useEffect(() => {
        if (eventNotification) {
            const timer = setTimeout(() => setEventNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [eventNotification]);

    React.useEffect(() => {
        let timer: number;
        if (gameState.answerResult) {
            timer = window.setTimeout(() => dispatch({ type: 'CLEAR_ANSWER_FEEDBACK' }), 1500);
        }
        if (gameState.eliminationResult) {
             timer = window.setTimeout(() => dispatch({ type: 'CLEAR_ELIMINATION_FEEDBACK' }), 2000);
        }
        return () => clearTimeout(timer);
    }, [gameState.answerResult, gameState.eliminationResult, dispatch]);


    const handleRotateBoard = (direction: 'left' | 'right') => {
        const angle = direction === 'left' ? 60 : -60;
        setBoardRotation(prev => (prev + angle + 360) % 360);
    };

    const handleFieldClick = async (fieldId: number) => {
        if (isProcessingQuestion || gameState.activeQuestion) return;
        
        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        const field = gameState.board.find(f => f.id === fieldId)!;
        
        if (gameState.gamePhase === 'Phase1_PickField') {
            if (field.type === 'NEUTRAL' && !field.ownerId) {
                if(phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
                dispatch({ type: 'SET_PHASE1_SELECTION', payload: { playerId: humanPlayer.id, fieldId }});
            }
        } else if (gameState.gamePhase === GamePhase.Phase2_Attacks) {
            const currentPlayerFromState = gameState.players[gameState.currentTurnPlayerIndex];
            if (currentPlayerFromState.isBot || currentPlayerFromState.id !== humanPlayer.id || !getAttackers(gameState.players).some(p => p.id === currentPlayerFromState.id)) return;
    
            if (field.ownerId === currentPlayerFromState.id && field.type === 'PLAYER_BASE' && field.hp < field.maxHp) {
                 setIsProcessingQuestion(true);
                 const question = await generateQuestion(field.category!, gameState.questionHistory, user.language, gameState.botDifficulty);
                 setIsProcessingQuestion(false);
                 if (question) {
                     dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayerFromState.id, isBaseAttack: false, isTieBreaker: false, actionType: 'HEAL', playerAnswers: { [currentPlayerFromState.id]: null }, startTime: Date.now(), category: field.category! } });
                 }
                 return;
            }
    
            if (field.type === 'BLACK') {
                setAttackTarget({ targetFieldId: fieldId, defenderId: undefined, isBaseAttack: false });
            } else if (field.ownerId && field.ownerId !== currentPlayerFromState.id) {
                setAttackTarget({ targetFieldId: fieldId, defenderId: field.ownerId, isBaseAttack: field.type === 'PLAYER_BASE' });
            }
        }
    };
    
    const handleCategorySelect = async (category: Category) => {
        if (!attackTarget) return;
        const currentPlayerFromState = gameState.players[gameState.currentTurnPlayerIndex];
        
        setAttackTarget(null);
        setIsProcessingQuestion(true);
        const question = await generateQuestion(category, gameState.questionHistory, user.language, gameState.botDifficulty);
        setIsProcessingQuestion(false);
    
        if (question) {
            const { targetFieldId, defenderId, isBaseAttack } = attackTarget;
            const playerAnswers: Record<string, null> = { [currentPlayerFromState.id]: null };
            if (defenderId) playerAnswers[defenderId] = null;
    
            dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId, attackerId: currentPlayerFromState.id, defenderId, isBaseAttack, isTieBreaker: false, playerAnswers, startTime: Date.now(), actionType: 'ATTACK', category: category } });
        }
    };

    const handleAnswer = (answer: string) => {
        if (!gameState.activeQuestion) return;
        
        if(logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current);

        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: humanPlayer.id, answer, category: gameState.activeQuestion.category } });
    };

    const handleUseHint = () => {
        if (!gameState.activeQuestion) return;
        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        if (humanPlayer.coins >= 500) {
            dispatch({ type: 'UPDATE_PLAYERS', payload: gameState.players.map(p => p.id === humanPlayer.id ? {...p, coins: p.coins - 500} : p) });
            handleAnswer(gameState.activeQuestion.question.correctAnswer);
        }
    };

    const handleBotAttackTurn = React.useCallback(async () => {
        const bot = gameState.players[gameState.currentTurnPlayerIndex];
        const decision = decideBotAction(gameState);
        const humanPlayer = gameState.players.find(p => !p.isBot)!;

        if (decision.action === 'PASS') {
            dispatch({ type: 'PASS_BOT_TURN', payload: { botId: bot.id, reason: decision.reason! }});
            return;
        }

        if (decision.action === 'ATTACK' && decision.targetField?.ownerId === humanPlayer.id && decision.targetField?.type === 'PLAYER_BASE') {
            setEventNotification({ type: 'danger', message: t('baseUnderAttackWarning') });
        }

        const { action, targetField, category, difficulty } = decision;
        const question = await generateQuestion(category!, gameState.questionHistory, 'cs', difficulty!);
        
        if (!question) {
            dispatch({ type: 'PASS_BOT_TURN', payload: { botId: bot.id, reason: "Chyba při generování otázky." }});
            return;
        }

        const defender = action === 'ATTACK' ? gameState.players.find(p => p.id === targetField!.ownerId) : undefined;
        const playerAnswers: Record<string, string | null> = { [bot.id]: null };
        if (defender) playerAnswers[defender.id] = null;

        dispatch({ type: 'SET_QUESTION', payload: {
            question,
            questionType: 'MULTIPLE_CHOICE',
            targetFieldId: targetField!.id,
            attackerId: bot.id,
            defenderId: defender?.id,
            isBaseAttack: targetField!.type === 'PLAYER_BASE',
            isTieBreaker: false,
            playerAnswers,
            startTime: Date.now(),
            actionType: action as 'ATTACK' | 'HEAL',
            category: category!
        }});

        dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: bot.id, answer: Math.random() < BOT_SUCCESS_RATES[gameState.botDifficulty] ? question.correctAnswer : "wrong", category: category! } });

        if (defender && !defender.isBot) {
        } else {
            if (defender && defender.isBot) {
                 dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: defender.id, answer: Math.random() < BOT_SUCCESS_RATES[gameState.botDifficulty] ? question.correctAnswer : "wrong_2", category: category! } });
            }
        }
    }, [gameState, dispatch, t]);

    React.useEffect(() => {
        if (gameState.gamePhase === 'Phase1_SelectionResolved' && gameState.answerResult) {
            const humanPlayer = gameState.players.find(p => !p.isBot)!;
            if (gameState.answerResult.playerId === humanPlayer.id && gameState.activeQuestion) {
                const fieldId = gameState.activeQuestion.targetFieldId;
                const result = gameState.answerResult.isCorrect ? 'win' : 'loss';
                
                const timeoutId = setTimeout(() => {
                    dispatch({ type: 'RESOLVE_PHASE1_ROUND', payload: { humanActionResult: result, fieldId } });
                }, 1500);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [gameState.gamePhase, gameState.answerResult, gameState.activeQuestion, gameState.players, dispatch]);
    
    React.useEffect(() => {
        if (logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current);
    
        const allPlayersAnswered = gameState.activeQuestion && Object.values(gameState.activeQuestion.playerAnswers).every(ans => ans !== null);
    
        if (allPlayersAnswered) {
            const { attackerId, defenderId, question, isBaseAttack } = gameState.activeQuestion!;
            const isAttackerCorrect = normalizeAnswer(gameState.activeQuestion!.playerAnswers[attackerId] || '') === normalizeAnswer(question.correctAnswer);
            const isDefenderCorrect = defenderId ? normalizeAnswer(gameState.activeQuestion!.playerAnswers[defenderId] || '') === normalizeAnswer(question.correctAnswer) : false;
    
            if (isAttackerCorrect && isDefenderCorrect && !isBaseAttack) {
                logicTimeoutRef.current = window.setTimeout(async () => {
                    const langForTiebreaker = gameState.players.find(p => p.id === defenderId)?.isBot ? 'cs' : user.language;
                    const tieBreakerQuestion = await generateOpenEndedQuestion(gameState.activeQuestion!.category, gameState.questionHistory, langForTiebreaker, 'hard');
                    setEventNotification({ type: 'warning', message: t('tieBreaker') });
                    dispatch({ type: 'RESOLVE_TURN', payload: { tieBreakerQuestion: tieBreakerQuestion || undefined } });
                }, 1500);
            } else {
                logicTimeoutRef.current = window.setTimeout(() => {
                    dispatch({ type: 'RESOLVE_TURN' });
                }, 1500);
            }
        }
    
        return () => { if (logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current); };
    }, [gameState.activeQuestion, user.language, gameState.questionHistory, dispatch, t]);


    React.useEffect(() => {
        if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
        if (gameState.gamePhase === GamePhase.Phase2_Attacks && !gameState.activeQuestion && !isProcessingQuestion && !gameState.answerResult && !gameState.eliminationResult) {
            const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            if (currentPlayer?.isBot && getAttackers(gameState.players).some(p => p.id === currentPlayer.id)) {
                botTurnTimeoutRef.current = window.setTimeout(handleBotAttackTurn, 2000);
            }
        }
        return () => { if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current); };
    }, [gameState, isProcessingQuestion, handleBotAttackTurn]);

    React.useEffect(() => {
        if (gameState.gamePhase === GamePhase.GameOver) {
            const humanPlayer = gameState.players.find(p => !p.isBot);
            if (!humanPlayer) return;
            const isWinner = gameState.winners?.some(w => w.id === humanPlayer.id) ?? false;
            let finalCoins = humanPlayer.coins;
            if (isWinner) finalCoins += (gameState.players.length - 1) * WIN_COINS_PER_PLAYER;
            
            const userOnServer = userService.loadUserData(user.email);
            if(userOnServer) {
                userOnServer.luduCoins = finalCoins;
                userService.saveUserData(userOnServer);
                setUser(userOnServer);
            }
        }
    }, [gameState.gamePhase, gameState.players, gameState.winners, setUser, user.email]);
    
    React.useEffect(() => {
        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
        
        if (gameState.gamePhase === 'Phase1_PickField') {
            phaseTimerRef.current = window.setTimeout(() => {
                dispatch({ type: 'AUTO_SELECT_FIELD' });
            }, 5000);
        } else if (gameState.gamePhase === 'Phase1_ShowQuestion') {
            const humanPlayer = gameState.players.find(p => !p.isBot)!;
            phaseTimerRef.current = window.setTimeout(async () => {
                const fieldId = gameState.phase1Selections![humanPlayer.id]!;
                const field = gameState.board.find(f => f.id === fieldId)!;
                setIsProcessingQuestion(true);
                const question = await generateQuestion(field.category!, gameState.questionHistory, user.language, 'easy');
                setIsProcessingQuestion(false);
                if (question) {
                    const allPlayerAnswers = gameState.players.reduce((acc, p) => {
                        if (!p.isEliminated) acc[p.id] = null;
                        return acc;
                    }, {} as Record<string, null>);
                    
                    dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: 'system', isBaseAttack: false, isTieBreaker: false, playerAnswers: allPlayerAnswers, startTime: Date.now(), actionType: 'ATTACK', category: field.category! } });

                    gameState.players.forEach(p => {
                        if (p.isBot && !p.isEliminated) {
                             dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: p.id, answer: Math.random() < BOT_SUCCESS_RATES[gameState.botDifficulty] ? question.correctAnswer : 'wrong_bot_p1', category: field.category! } });
                        }
                    });
                }
            }, 5000);
        }

        return () => { if(phaseTimerRef.current) clearTimeout(phaseTimerRef.current); };
    }, [gameState.gamePhase, gameState.phase1Selections, gameState.board, gameState.players, gameState.questionHistory, user.language, dispatch]);
    
     React.useEffect(() => {
        if (gameState.gamePhase === GamePhase.TransitionToPhase1) {
            const timer = setTimeout(() => {
                dispatch({ type: 'SET_STATE', payload: { gamePhase: GamePhase.Phase1_PickField, phaseStartTime: Date.now() }});
            }, 3000);
            return () => clearTimeout(timer);
        }
        if (gameState.gamePhase === GamePhase.TransitionToPhase2) {
            const timer = setTimeout(() => {
                 const attackers = getAttackers(gameState.players);
                 const nextPlayerIndex = attackers.length > 0 ? gameState.players.findIndex(p => p.id === attackers[0].id) : 0;
                 dispatch({ type: 'SET_STATE', payload: { gamePhase: GamePhase.Phase2_Attacks, currentTurnPlayerIndex: nextPlayerIndex, gameLog: [...gameState.gameLog, t('phase2StartLog')] }});
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState.gamePhase, gameState.players, gameState.gameLog, dispatch, t]);

    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    const isHumanAnswering = gameState.activeQuestion?.playerAnswers.hasOwnProperty(humanPlayer.id);

    const getHeaderText = () => {
        if (gameState.answerResult) return t('evaluating');
        if (isProcessingQuestion) return t('loading');
        if (gameState.activeQuestion) {
             if (isHumanAnswering && gameState.activeQuestion.playerAnswers[humanPlayer.id] === null) return t('answerTheQuestion');
             return t('opponentTurn');
        }
        if (gameState.gamePhase.startsWith('Phase1')) {
             if (gameState.phase1Selections?.[humanPlayer.id]) return t('waitingForPlayers');
             return t('phase1SelectTerritory', gameState.round, PHASE_DURATIONS.PHASE1_ROUNDS);
        }
        if (gameState.gamePhase === GamePhase.Phase2_Attacks && getAttackers(gameState.players).some(p => p.id === humanPlayer.id) && currentPlayer.id === humanPlayer.id) {
            return t('yourTurnToAttack');
        }
        return `${t('turnOfPrefix')}${currentPlayer?.name}`;
    };
    
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const phaseName = () => {
        switch(gameState.gamePhase) {
            case GamePhase.TransitionToPhase1:
            case GamePhase.Phase1_PickField:
            case GamePhase.Phase1_ShowQuestion:
            case GamePhase.Phase1_SelectionResolved:
            case GamePhase.Phase1_RoundEnd:
                return t('phaseLandGrab');
            case GamePhase.TransitionToPhase2:
            case GamePhase.Phase2_Attacks:
                return t('phaseAttacks');
            case GamePhase.GameOver:
                 return t('phaseGameOver');
            default: return '';
        }
    }
    
    const { gamePhase } = gameState;
    if (gamePhase === GamePhase.TransitionToPhase1 || gamePhase === GamePhase.TransitionToPhase2) {
        const phaseInfo = {
            [GamePhase.TransitionToPhase1]: { number: 1, name: t('phaseLandGrab') },
            [GamePhase.TransitionToPhase2]: { number: 2, name: t('phaseAttacks') }
        }[gamePhase];
        return <PhaseTransitionScreen phaseNumber={phaseInfo.number} phaseName={phaseInfo.name} themeConfig={themeConfig} />;
    }


    return (
        <div className="min-h-screen flex flex-col">
            {eventNotification && <GameEventNotification type={eventNotification.type} message={eventNotification.message} />}
            {gameState.gamePhase === GamePhase.GameOver && <GameOverScreen gameState={gameState} onBackToLobby={onBackToLobby} themeConfig={themeConfig} />}
            <header className={`bg-gray-800/50 p-4 border-b ${themeConfig.accentBorder}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-2xl font-bold ${themeConfig.accentText} capitalize`}>{t('phase')}: {phaseName()}</h1>
                        <p className="text-gray-400">{t('round')}: {gameState.round}</p>
                    </div>
                    <div className={`text-2xl font-mono ${themeConfig.accentTextLight}`}>{formatTime(gameTime)}</div>
                    <div className="text-right"><h2 className="text-xl">{getHeaderText()}</h2></div>
                </div>
            </header>
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="flex-grow md:w-2/3 lg:w-3/4 order-2 md:order-1 relative">
                    <HexagonalGameBoard 
                        gameState={gameState} onFieldClick={handleFieldClick} 
                        rotation={boardRotation} onRotate={handleRotateBoard} themeConfig={themeConfig}
                    />
                </div>
                <aside className={`md:w-1/3 lg:w-1/4 bg-gray-900/50 p-4 border-t md:border-t-0 md:border-l ${themeConfig.accentBorder} order-1 md:order-2 overflow-y-auto`}>
                    <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4`}>{t('players')}</h2>
                    <PlayerStatusUI players={gameState.players} currentPlayerId={currentPlayer?.id} board={gameState.board} themeConfig={themeConfig} />
                    {gameState.gamePhase === GamePhase.Phase2_Attacks && <AttackOrderUI attackers={getAttackers(gameState.players)} currentPlayerId={currentPlayer?.id} themeConfig={themeConfig} />}
                    <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4 mt-6`}>{t('gameLog')}</h2>
                    <div className="h-64 overflow-y-auto bg-gray-800 p-2 rounded-md">
                        {gameState.gameLog.slice().reverse().map((log, i) => <p key={i} className="text-sm text-gray-400 mb-1">{log}</p>)}
                    </div>
                </aside>
            </main>
            
            {(gameState.gamePhase === 'Phase1_PickField' || gameState.gamePhase === 'Phase1_ShowQuestion') && gameState.phaseStartTime && (
                <PhaseTimerUI phase={gameState.gamePhase} startTime={gameState.phaseStartTime} duration={5} themeConfig={themeConfig} />
            )}

            {(isProcessingQuestion || (gameState.activeQuestion && isHumanAnswering)) && (
                 <QuestionModal 
                    activeQuestion={gameState.activeQuestion} 
                    onAnswer={handleAnswer} 
                    onTimeout={() => handleAnswer('timeout_wrong_answer')} 
                    loading={isProcessingQuestion} 
                    onUseHint={handleUseHint} 
                    humanPlayer={humanPlayer} 
                    themeConfig={themeConfig} 
                 />
            )}
            {gameState.activeQuestion && !isHumanAnswering && <SpectatorQuestionModal activeQuestion={gameState.activeQuestion} themeConfig={themeConfig} />}
            {attackTarget && (
                <CategorySelectionModal 
                    isOpen={true}
                    availableCategories={CATEGORIES.filter(c => !currentPlayer?.usedAttackCategories.includes(c))}
                    isBaseAttack={attackTarget.isBaseAttack}
                    onSelect={async (category) => {
                         if (attackTarget.isBaseAttack) {
                           await handleCategorySelect(gameState.board.find(f => f.id === attackTarget.targetFieldId)!.category!);
                         } else if (attackTarget.defenderId === undefined) { // It's a black field
                           await handleCategorySelect(category);
                         } else {
                           await handleCategorySelect(category);
                         }
                    }}
                    onClose={() => setAttackTarget(null)}
                    themeConfig={themeConfig}
                />
            )}
            {gameState.answerResult && <AnswerFeedbackModal result={gameState.answerResult} themeConfig={themeConfig} />}
            {gameState.eliminationResult && <EliminationFeedbackModal result={gameState.eliminationResult} themeConfig={themeConfig} />}
        </div>
    );
};