import * as React from 'react';
import { GameState, User, Theme, Category, GamePhase, Question } from '../../types';
import { themes } from '../../themes';
import { GameAction } from '../../types';
import { generateQuestion, generateOpenEndedQuestion } from '../../services/geminiService';
import { CATEGORIES, PHASE_DURATIONS, WIN_COINS_PER_PLAYER, BOT_SUCCESS_RATES } from '../../constants';
import { decideBotAction, getAttackers } from '../../services/gameLogic';
import { useTranslation } from '../../i18n/LanguageContext';
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
import { GameEventNotification } from '../ui/GameEventNotification';


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
    const [eventNotification, setEventNotification] = React.useState<{type: 'info' | 'success' | 'warning' | 'danger', message: string} | null>(null);
    
    // This is the single source of truth for the current player, derived from the game state.
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];

    // Main Game Timer
    React.useEffect(() => {
        const timer = setInterval(() => {
            if (gameState.gamePhase !== GamePhase.GameOver) {
                setGameTime(Date.now() - gameState.gameStartTime);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.gamePhase, gameState.gameStartTime]);

    // Cleanup for feedback modals
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
        
        if (gameState.gamePhase === GamePhase.Phase1_PickField) {
            if (field.type === 'NEUTRAL' && !field.ownerId) {
                dispatch({ type: 'SET_PHASE1_SELECTION', payload: { playerId: humanPlayer.id, fieldId }});
            }
        } else if (gameState.gamePhase === GamePhase.Phase2_Attacks) {
            if (currentPlayer.isBot || currentPlayer.id !== humanPlayer.id || !getAttackers(gameState.players).some(p => p.id === currentPlayer.id)) return;
    
            if (field.ownerId === currentPlayer.id && field.type === 'PLAYER_BASE' && field.hp < field.maxHp) {
                 setIsProcessingQuestion(true);
                 const question = await generateQuestion(field.category!, gameState.questionHistory, user.language, gameState.botDifficulty);
                 setIsProcessingQuestion(false);
                 if (question) {
                     dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayer.id, isBaseAttack: false, isTieBreaker: false, actionType: 'HEAL', playerAnswers: { [currentPlayer.id]: null }, startTime: Date.now(), category: field.category! } });
                 }
                 return;
            }
    
            if (field.type === 'BLACK' || (field.ownerId && field.ownerId !== currentPlayer.id)) {
                if(field.type === 'BLACK') {
                    setEventNotification({ type: 'success', message: t('blackFieldSuccess') });
                }
                setAttackTarget({ targetFieldId: fieldId, defenderId: field.ownerId || undefined, isBaseAttack: field.type === 'PLAYER_BASE' });
            }
        }
    };
    
    const handleCategorySelect = async (category: Category) => {
        if (!attackTarget) return;
        
        setAttackTarget(null);
        setIsProcessingQuestion(true);
        const question = await generateQuestion(category, gameState.questionHistory, user.language, gameState.botDifficulty);
        setIsProcessingQuestion(false);
    
        if (question) {
            const { targetFieldId, defenderId, isBaseAttack } = attackTarget;
            const playerAnswers: Record<string, null> = { [currentPlayer.id]: null };
            if (defenderId) playerAnswers[defenderId] = null;
    
            dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId, attackerId: currentPlayer.id, defenderId, isBaseAttack, isTieBreaker: false, playerAnswers, startTime: Date.now(), actionType: 'ATTACK', category: category } });
        }
    };

    const handleAnswer = (answer: string) => {
        if (!gameState.activeQuestion) return;
        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: humanPlayer.id, answer, category: gameState.activeQuestion.category } });
    };

    // This is the CENTRAL GAME LOOP effect. It reacts to state changes from the reducer.
    React.useEffect(() => {
        const { gamePhase, activeQuestion } = gameState;

        // Phase 1: If it's time to show the question, this logic runs.
        if (gamePhase === GamePhase.Phase1_ShowQuestion && !activeQuestion && !isProcessingQuestion) {
            const humanPlayer = gameState.players.find(p => !p.isBot)!;
            const fieldId = gameState.phase1Selections![humanPlayer.id]!;
            const field = gameState.board.find(f => f.id === fieldId)!;
            
            (async () => {
                setIsProcessingQuestion(true);
                const question = await generateQuestion(field.category!, gameState.questionHistory, user.language, 'easy');
                setIsProcessingQuestion(false);
                if (question) {
                    const allPlayerAnswers = gameState.players.reduce((acc, p) => {
                        if (!p.isEliminated) acc[p.id] = null;
                        return acc;
                    }, {} as Record<string, null>);
                    
                    dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: 'system', isBaseAttack: false, isTieBreaker: false, playerAnswers: allPlayerAnswers, startTime: Date.now(), actionType: 'ATTACK', category: field.category! } });

                    // Bots answer immediately after question is set
                    gameState.players.forEach(p => {
                        if (p.isBot && !p.isEliminated) {
                             dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: p.id, answer: Math.random() < BOT_SUCCESS_RATES.easy ? question.correctAnswer : 'wrong', category: field.category! } });
                        }
                    });
                }
            })();
        }
        
        // Phase 1 & 2: Combat Resolution
        if (gamePhase === GamePhase.Phase2_CombatResolve || gamePhase === GamePhase.Phase1_ResolveRound) {
            const timer = setTimeout(() => dispatch({ type: 'RESOLVE_COMBAT' }), 1500);
            return () => clearTimeout(timer);
        }

        // Phase 2: Bot turn logic
        if (gamePhase === GamePhase.Phase2_Attacks && !activeQuestion && !isProcessingQuestion && currentPlayer?.isBot && getAttackers(gameState.players).some(p => p.id === currentPlayer.id)) {
            const timer = setTimeout(async () => {
                const decision = decideBotAction(gameState);
                if (decision.action === 'PASS') {
                    dispatch({ type: 'PASS_BOT_TURN', payload: { botId: currentPlayer.id, reason: decision.reason! }});
                    return;
                }

                const { action, targetField, category, difficulty } = decision;
                const question = await generateQuestion(category!, gameState.questionHistory, 'cs', difficulty!);
                
                if (question) {
                    const defender = action === 'ATTACK' ? gameState.players.find(p => p.id === targetField!.ownerId) : undefined;
                    const playerAnswers: Record<string, string | null> = { [currentPlayer.id]: null };
                    
                    if (defender) {
                        playerAnswers[defender.id] = null;
                        if (!defender.isBot && targetField?.type === 'PLAYER_BASE') {
                            setEventNotification({type: 'danger', message: t('baseUnderAttackWarning')});
                        }
                    }

                    dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: targetField!.id, attackerId: currentPlayer.id, defenderId: defender?.id, isBaseAttack: targetField!.type === 'PLAYER_BASE', isTieBreaker: false, playerAnswers, startTime: Date.now(), actionType: action as 'ATTACK' | 'HEAL', category: category! }});

                    // Bots submit their answers immediately after the question is set
                    dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: currentPlayer.id, answer: Math.random() < BOT_SUCCESS_RATES[gameState.botDifficulty] ? question.correctAnswer : "wrong", category: category! } });
                    if (defender?.isBot) {
                         dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: defender.id, answer: Math.random() < BOT_SUCCESS_RATES[gameState.botDifficulty] ? question.correctAnswer : "wrong_2", category: category! } });
                    }
                } else {
                     dispatch({ type: 'PASS_BOT_TURN', payload: { botId: currentPlayer.id, reason: "Chyba při generování otázky." }});
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
        
        // Phase 2: Tiebreaker question generation
        if (gamePhase === GamePhase.Phase2_Tiebreaker && !activeQuestion) {
            setEventNotification({ type: 'info', message: t('tieBreaker') });
            const timer = setTimeout(async () => {
                 const tieBreakerQuestion = await generateOpenEndedQuestion(Category.Sport, gameState.questionHistory, user.language, 'hard');
                 if (tieBreakerQuestion) {
                    dispatch({ type: 'SET_TIEBREAKER_QUESTION', payload: { question: tieBreakerQuestion } });
                 } else {
                    dispatch({ type: 'RESOLVE_COMBAT' }); // Resolve as a draw if no question can be generated
                 }
            }, 1500);
            return () => clearTimeout(timer);
        }

        // Phase Transitions
        if (gamePhase === GamePhase.TransitionToPhase1 || gamePhase === GamePhase.TransitionToPhase2) {
            const nextPhase = gamePhase === GamePhase.TransitionToPhase1 ? GamePhase.Phase1_PickField : GamePhase.Phase2_Attacks;
            const timer = setTimeout(() => {
                if (nextPhase === GamePhase.Phase1_PickField) {
                     dispatch({ type: 'SET_STATE', payload: { gamePhase: nextPhase, phaseStartTime: Date.now() } });
                } else {
                     dispatch({ type: 'SET_STATE', payload: { gamePhase: nextPhase } });
                }
            }, 3000); // 3-second transition screen
            return () => clearTimeout(timer);
        }
    }, [gameState, dispatch, user.language, isProcessingQuestion, t, currentPlayer]);

    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    const isHumanAnswering = gameState.activeQuestion?.playerAnswers.hasOwnProperty(humanPlayer.id);
    const isHumanTurnToAttack = gameState.gamePhase === GamePhase.Phase2_Attacks && getAttackers(gameState.players).some(p => p.id === humanPlayer.id) && currentPlayer.id === humanPlayer.id;

    const getHeaderText = () => {
        if (gameState.answerResult) return t('evaluating');
        if (isProcessingQuestion) return t('loading');
        if (gameState.activeQuestion) {
            if (isHumanAnswering && gameState.activeQuestion.playerAnswers[humanPlayer.id] === null) return t('answerTheQuestion');
            return t('opponentTurn');
        }
        if (gameState.gamePhase === GamePhase.Phase1_PickField) {
            if (gameState.phase1Selections?.[humanPlayer.id]) return t('waitingForPlayers');
            return t('phase1SelectTerritory', gameState.round, PHASE_DURATIONS.PHASE1_ROUNDS);
        }
        if (isHumanTurnToAttack) {
            return t('yourTurnToAttack');
        }
        return <>{t('turnOfPrefix')}<span className={`font-bold text-${currentPlayer?.color}-400`}>{currentPlayer?.name}</span></>;
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const phaseNameMapping: Record<string, string> = {
        [GamePhase.Phase1_PickField]: t('phaseLandGrab'),
        [GamePhase.Phase1_ShowQuestion]: t('phaseLandGrab'),
        [GamePhase.Phase1_ResolveRound]: t('phaseLandGrab'),
        [GamePhase.Phase2_Attacks]: t('phaseAttacks'),
        [GamePhase.Phase2_CombatResolve]: t('phaseAttacks'),
        [GamePhase.Phase2_Tiebreaker]: t('phaseAttacks'),
        [GamePhase.GameOver]: t('phaseGameOver'),
    };
    const phaseName = phaseNameMapping[gameState.gamePhase] || gameState.gamePhase.replace(/_/g, ' ');

    return (
        <div className="min-h-screen flex flex-col">
            {gameState.gamePhase === GamePhase.GameOver && <GameOverScreen gameState={gameState} onBackToLobby={onBackToLobby} themeConfig={themeConfig} />}
            
            {gameState.gamePhase === GamePhase.TransitionToPhase1 && <PhaseTransitionScreen phaseNumber={1} phaseName={t('phaseLandGrab')} themeConfig={themeConfig} />}
            {gameState.gamePhase === GamePhase.TransitionToPhase2 && <PhaseTransitionScreen phaseNumber={2} phaseName={t('phaseAttacks')} themeConfig={themeConfig} />}

            {(gameState.gamePhase === GamePhase.Phase1_PickField || gameState.gamePhase === GamePhase.Phase1_ShowQuestion) && gameState.phaseStartTime && (
                <PhaseTimerUI 
                    phase={gameState.gamePhase} 
                    startTime={gameState.phaseStartTime}
                    duration={10}
                    themeConfig={themeConfig}
                />
            )}

            {eventNotification && <GameEventNotification {...eventNotification} onDismiss={() => setEventNotification(null)} />}

            <header className={`bg-gray-800/50 p-4 border-b ${themeConfig.accentBorder}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-2xl font-bold ${themeConfig.accentText} capitalize`}>{t('phase')}: {phaseName}</h1>
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
            
            {(isProcessingQuestion || (gameState.activeQuestion && isHumanAnswering)) && (
                 <QuestionModal 
                    activeQuestion={gameState.activeQuestion} 
                    onAnswer={handleAnswer} 
                    onTimeout={() => handleAnswer('timeout_wrong_answer')} 
                    loading={isProcessingQuestion} 
                    humanPlayer={humanPlayer} 
                    themeConfig={themeConfig} 
                 />
            )}
            {gameState.activeQuestion && !isHumanAnswering && <SpectatorQuestionModal activeQuestion={gameState.activeQuestion} themeConfig={themeConfig} />}
            {attackTarget && (
                <CategorySelectionModal 
                    isOpen={true}
                    availableCategories={gameState.allowedCategories.filter(c => !currentPlayer?.usedAttackCategories.includes(c))}
                    isBaseAttack={attackTarget.isBaseAttack}
                    onSelect={async (category) => {
                        if(attackTarget.isBaseAttack) await handleCategorySelect(gameState.board.find(f => f.id === attackTarget.targetFieldId)!.category!);
                        else await handleCategorySelect(category);
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
