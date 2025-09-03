import * as React from 'react';
import { GameState, User, Theme, Player, Category, GamePhase } from '../../types';
import { themes } from '../../themes';
import { GameAction } from '../../types';
import { generateQuestion, generateOpenEndedQuestion } from '../../services/geminiService';
// FIX: Import BOT_SUCCESS_RATES to resolve reference errors.
import { CATEGORIES, PHASE_DURATIONS, WIN_COINS_PER_PLAYER, BOT_SUCCESS_RATES } from '../../constants';
import { normalizeAnswer } from '../../utils';
import { decideBotAction, getAttackers } from '../../services/gameLogic';
import { useTranslation } from '../../i18n/LanguageContext';


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
    
    const botTurnTimeoutRef = React.useRef<number | null>(null);
    const logicTimeoutRef = React.useRef<number | null>(null);

    // CRITICAL FIX: Check for transient invalid state to prevent render crash.
    // This can happen for a single frame when a player is eliminated.
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    if (!currentPlayer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner themeConfig={themeConfig} />
            </div>
        );
    }
    
    // Game Timer Effect
    React.useEffect(() => {
        const timer = setInterval(() => {
            if (gameState.gamePhase !== GamePhase.GameOver) {
                setGameTime(Date.now() - gameState.gameStartTime);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.gamePhase, gameState.gameStartTime]);

    // CRITICAL FIX: Effect to automatically clear feedback modals after a delay.
    // This centralizes control and prevents race conditions from child components.
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
        
        if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
            if (gameState.phase1Selections?.[humanPlayer.id] != null || Object.values(gameState.phase1Selections || {}).includes(fieldId)) return;
            if (field.type === 'NEUTRAL' && !field.ownerId) {
                dispatch({ type: 'SET_PHASE1_SELECTION', payload: { playerId: humanPlayer.id, fieldId }});
                setIsProcessingQuestion(true);
                const question = await generateQuestion(field.category!, gameState.questionHistory, user.language, 'easy');
                setIsProcessingQuestion(false);
                if (question) {
                    dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: humanPlayer.id, isBaseAttack: false, isTieBreaker: false, playerAnswers: { [humanPlayer.id]: null }, startTime: Date.now(), actionType: 'ATTACK', category: field.category! } });
                }
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
                setIsProcessingQuestion(true);
                const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
                const question = await generateQuestion(randomCategory, gameState.questionHistory, user.language, gameState.botDifficulty);
                setIsProcessingQuestion(false);
                if (question) {
                     dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayerFromState.id, isBaseAttack: false, isTieBreaker: false, actionType: 'ATTACK', playerAnswers: { [currentPlayerFromState.id]: null }, startTime: Date.now(), category: randomCategory } });
                }
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

    // --- BOT LOGIC ---
    const handleBotAttackTurn = React.useCallback(async () => {
        const bot = gameState.players[gameState.currentTurnPlayerIndex];
        const decision = decideBotAction(gameState);

        if (decision.action === 'PASS') {
            dispatch({ type: 'PASS_BOT_TURN', payload: { botId: bot.id, reason: decision.reason! }});
            return;
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
            // Human will answer via UI, which will trigger turn resolution
        } else {
            if (defender && defender.isBot) {
                 dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: defender.id, answer: Math.random() < BOT_SUCCESS_RATES[gameState.botDifficulty] ? question.correctAnswer : "wrong_2", category: category! } });
            }
            // Turn resolution will be triggered by the useEffect below
        }
    }, [gameState, dispatch]);


    // --- GAME FLOW EFFECTS ---
    React.useEffect(() => {
        if (gameState.gamePhase === GamePhase.Phase1_LandGrab && gameState.answerResult) {
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
        if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
            const humanPlayer = gameState.players.find(p => !p.isBot)!;
            const humanSelection = gameState.phase1Selections?.[humanPlayer.id];
            
            if (humanSelection && Object.keys(gameState.phase1Selections || {}).length < gameState.players.length) {
                const availableFields = gameState.board.filter(f => f.type === 'NEUTRAL' && !f.ownerId && !Object.values(gameState.phase1Selections || {}).includes(f.id));
                gameState.players.filter(p => p.isBot).forEach(bot => {
                    if (availableFields.length > 0 && !gameState.phase1Selections?.[bot.id]) {
                        const randomIndex = Math.floor(Math.random() * availableFields.length);
                        const field = availableFields.splice(randomIndex, 1)[0];
                        dispatch({ type: 'SET_PHASE1_SELECTION', payload: { playerId: bot.id, fieldId: field.id } });
                    }
                });
            }
        }
    }, [gameState.gamePhase, gameState.phase1Selections, gameState.players, dispatch]);

    // Effect for handling turn resolution and tie-breakers
    React.useEffect(() => {
        if (logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current);

        const handleTurnResolution = async () => {
            if (!gameState.activeQuestion) return;
            
            // Tie-breaker condition check
            const { attackerId, defenderId, question, isBaseAttack, isTieBreaker, category } = gameState.activeQuestion;
            if (defenderId && !isBaseAttack && !isTieBreaker) {
                const isAttackerCorrect = normalizeAnswer(gameState.activeQuestion.playerAnswers[attackerId] || '') === normalizeAnswer(question.correctAnswer);
                const isDefenderCorrect = normalizeAnswer(gameState.activeQuestion.playerAnswers[defenderId] || '') === normalizeAnswer(question.correctAnswer);

                if (isAttackerCorrect && isDefenderCorrect) {
                    setIsProcessingQuestion(true);
                    const tieBreakerQuestion = await generateOpenEndedQuestion(category, gameState.questionHistory, user.language, 'hard');
                    setIsProcessingQuestion(false);
                    
                    if (tieBreakerQuestion) {
                        dispatch({
                            type: 'SET_QUESTION',
                            payload: {
                                ...gameState.activeQuestion,
                                question: tieBreakerQuestion,
                                questionType: 'OPEN_ENDED',
                                isTieBreaker: true,
                                playerAnswers: { [attackerId]: null, [defenderId]: null },
                                startTime: Date.now(),
                            }
                        });
                    } else {
                        dispatch({ type: 'RESOLVE_TURN' }); // Fallback if question generation fails
                    }
                    return; // End execution here, don't proceed to normal resolution
                }
            }
            // If not a tie-breaker, resolve normally
            dispatch({ type: 'RESOLVE_TURN' });
        };

        if (gameState.activeQuestion && Object.values(gameState.activeQuestion.playerAnswers).every(ans => ans !== null)) {
            logicTimeoutRef.current = window.setTimeout(handleTurnResolution, 1500);
        }
        
        return () => {
            if (logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current);
        }
    }, [gameState.activeQuestion, gameState.questionHistory, user.language, dispatch]);


    React.useEffect(() => {
        if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
        if (gameState.gamePhase === GamePhase.Phase2_Attacks && !gameState.activeQuestion && !isProcessingQuestion && !gameState.answerResult && !gameState.eliminationResult) {
            const currentPlayerFromState = gameState.players[gameState.currentTurnPlayerIndex];
            if (currentPlayerFromState?.isBot && getAttackers(gameState.players).some(p => p.id === currentPlayerFromState.id)) {
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
            setUser(u => u ? { ...u, luduCoins: finalCoins } : u);
        }
    }, [gameState.gamePhase, gameState.players, gameState.winners, setUser]);

    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    const isHumanAnswering = gameState.activeQuestion?.playerAnswers.hasOwnProperty(humanPlayer.id);

    // ROBUSTNESS FIX: Ensure all return paths are valid JSX to prevent React Error #31.
    const getHeaderText = () => {
        if (gameState.answerResult) return <>{t('evaluating')}</>;
        if (isProcessingQuestion) return <>{t('loading')}</>;
        if (gameState.activeQuestion) {
             if (isHumanAnswering && gameState.activeQuestion.playerAnswers[humanPlayer.id] === null) return <>{t('answerTheQuestion')}</>;
             return <>{t('opponentTurn')}</>;
        }
        if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
             if (gameState.phase1Selections?.[humanPlayer.id]) return <>{t('waitingForPlayers')}</>;
             return <>{t('phase1SelectTerritory', gameState.round, PHASE_DURATIONS.PHASE1_ROUNDS)}</>;
        }
        if (gameState.gamePhase === GamePhase.Phase2_Attacks && getAttackers(gameState.players).some(p => p.id === humanPlayer.id) && currentPlayer.id === humanPlayer.id) {
            return <>{t('yourTurnToAttack')}</>;
        }
        return <>{t('turnOfPrefix')}<span className={`font-bold text-${currentPlayer.color}-400`}>{currentPlayer.name}</span></>;
    };
    
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const getPhaseName = (phase: GamePhase) => {
        switch(phase) {
            case GamePhase.Phase1_LandGrab: return t('phaseLandGrab');
            case GamePhase.Phase2_Attacks: return t('phaseAttacks');
            case GamePhase.GameOver: return t('phaseGameOver');
            default: return phase;
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {gameState.gamePhase === GamePhase.GameOver && <GameOverScreen gameState={gameState} onBackToLobby={onBackToLobby} themeConfig={themeConfig} />}
            <header className={`bg-gray-800/50 p-4 border-b ${themeConfig.accentBorder}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-2xl font-bold ${themeConfig.accentText}`}>{t('phase')}: {getPhaseName(gameState.gamePhase)}</h1>
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