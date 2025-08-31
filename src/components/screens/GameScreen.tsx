
import * as React from 'react';
import { GameState, User, Theme, Player, Category, GamePhase } from '../../types';
import { themes } from '../../themes';
import { GameAction } from '../../types';
import { generateQuestion, generateOpenEndedQuestion } from '../../services/geminiService';
import { CATEGORIES, PHASE_DURATIONS, WIN_COINS_PER_PLAYER } from '../../constants';
import { normalizeAnswer } from '../../utils';
import { decideBotAction, getAttackers } from '../../services/gameLogic';


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

interface GameScreenProps {
    gameState: GameState;
    dispatch: React.Dispatch<GameAction>;
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    onBackToLobby: () => void;
    themeConfig: typeof themes[Theme];
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameState, dispatch, user, setUser, onBackToLobby, themeConfig }) => {
    const [isProcessingQuestion, setIsProcessingQuestion] = React.useState(false);
    const [attackTarget, setAttackTarget] = React.useState<{ targetFieldId: number; defenderId?: string; isBaseAttack: boolean; } | null>(null);
    const [gameTime, setGameTime] = React.useState(0);
    const [boardRotation, setBoardRotation] = React.useState(0);
    
    const botTurnTimeoutRef = React.useRef<number | null>(null);
    const logicTimeoutRef = React.useRef<number | null>(null);
    
    // Game Timer Effect
    React.useEffect(() => {
        const timer = setInterval(() => {
            if (gameState.gamePhase !== GamePhase.GameOver) {
                setGameTime(Date.now() - gameState.gameStartTime);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.gamePhase, gameState.gameStartTime]);

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
                const question = await generateQuestion(field.category!, gameState.questionHistory, user.language);
                setIsProcessingQuestion(false);
                if (question) {
                    dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: humanPlayer.id, isBaseAttack: false, isTieBreaker: false, playerAnswers: { [humanPlayer.id]: null }, startTime: Date.now(), actionType: 'ATTACK' } });
                }
            }
        } else if (gameState.gamePhase === GamePhase.Phase2_Attacks) {
            const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            if (currentPlayer.isBot || currentPlayer.id !== humanPlayer.id || !getAttackers(gameState.players).some(p => p.id === currentPlayer.id)) return;
    
            if (field.ownerId === currentPlayer.id && field.type === 'PLAYER_BASE' && field.hp < field.maxHp) {
                 setIsProcessingQuestion(true);
                 const question = await generateQuestion(field.category!, gameState.questionHistory, user.language);
                 setIsProcessingQuestion(false);
                 if (question) {
                     dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayer.id, isBaseAttack: false, isTieBreaker: false, actionType: 'HEAL', playerAnswers: { [currentPlayer.id]: null }, startTime: Date.now() } });
                 }
                 return;
            }
    
            if (field.type === 'BLACK') {
                setIsProcessingQuestion(true);
                const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
                const question = await generateQuestion(randomCategory, gameState.questionHistory, user.language);
                setIsProcessingQuestion(false);
                if (question) {
                     dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayer.id, isBaseAttack: false, isTieBreaker: false, actionType: 'ATTACK', playerAnswers: { [currentPlayer.id]: null }, startTime: Date.now() } });
                }
            } else if (field.ownerId && field.ownerId !== currentPlayer.id) {
                setAttackTarget({ targetFieldId: fieldId, defenderId: field.ownerId, isBaseAttack: field.type === 'PLAYER_BASE' });
            }
        }
    };
    
    const handleCategorySelect = async (category: Category) => {
        if (!attackTarget) return;
        const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
        
        setAttackTarget(null);
        setIsProcessingQuestion(true);
        const question = await generateQuestion(category, gameState.questionHistory, user.language);
        setIsProcessingQuestion(false);
    
        if (question) {
            const { targetFieldId, defenderId, isBaseAttack } = attackTarget;
            const playerAnswers: Record<string, null> = { [currentPlayer.id]: null };
            if (defenderId) playerAnswers[defenderId] = null;
    
            dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId, attackerId: currentPlayer.id, defenderId, isBaseAttack, isTieBreaker: false, playerAnswers, startTime: Date.now(), actionType: 'ATTACK' } });
        }
    };

    const handleAnswer = (answer: string) => {
        if (!gameState.activeQuestion) return;
        
        if(logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current);

        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: humanPlayer.id, answer } });

        const updatedActiveQuestion = { ...gameState.activeQuestion, playerAnswers: { ...gameState.activeQuestion.playerAnswers, [humanPlayer.id]: answer } };
        const allPlayersAnswered = Object.values(updatedActiveQuestion.playerAnswers).every(ans => ans !== null);

        if (allPlayersAnswered) {
            logicTimeoutRef.current = window.setTimeout(() => {
                dispatch({ type: 'RESOLVE_TURN' });
            }, 2000);
        }
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

        const { action, targetField, category } = decision;
        const question = await generateQuestion(category!, gameState.questionHistory, 'cs');
        
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
            actionType: action as 'ATTACK' | 'HEAL'
        }});

        // Bot submits its answer immediately
        dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: bot.id, answer: Math.random() < 0.7 ? question.correctAnswer : "wrong" } });

        // If defender is human, wait for their answer. Otherwise, resolve immediately.
        if (defender && !defender.isBot) {
            // Human will answer via UI, which will trigger RESOLVE_TURN
        } else {
            if (defender && defender.isBot) {
                 dispatch({ type: 'SUBMIT_ANSWER', payload: { playerId: defender.id, answer: Math.random() < 0.6 ? question.correctAnswer : "wrong_2" } });
            }
            // Use timeout to give a feeling of action
            setTimeout(() => dispatch({ type: 'RESOLVE_TURN' }), 2000);
        }
    }, [gameState, dispatch]);


    // --- GAME FLOW EFFECTS ---
    
    // Effect to handle resolving Phase 1 after human player answers
    React.useEffect(() => {
        if (gameState.gamePhase === GamePhase.Phase1_LandGrab && gameState.answerResult) {
            const humanPlayer = gameState.players.find(p => !p.isBot)!;
            // Check if it's the human player's result we're seeing
            if (gameState.answerResult.playerId === humanPlayer.id && gameState.activeQuestion) {
                const fieldId = gameState.activeQuestion.targetFieldId;
                const result = gameState.answerResult.isCorrect ? 'win' : 'loss';
                
                // Use a short timeout to allow the feedback modal to show
                const timeoutId = setTimeout(() => {
                    dispatch({ type: 'RESOLVE_PHASE1_ROUND', payload: { humanActionResult: result, fieldId } });
                }, 2000); 

                return () => clearTimeout(timeoutId);
            }
        }
    }, [gameState.gamePhase, gameState.answerResult, gameState.activeQuestion, gameState.players, dispatch]);


    // Effect to handle Phase 1 bot selections
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

    // Effect for tie-breakers
    React.useEffect(() => {
        if(logicTimeoutRef.current) clearTimeout(logicTimeoutRef.current);

        const triggerTiebreaker = async () => {
            if (gameState.activeQuestion?.isTieBreaker === false && gameState.activeQuestion.defenderId) {
                const { attackerId, defenderId, question } = gameState.activeQuestion;
                const attacker = gameState.players.find(p => p.id === attackerId)!;
                const defender = gameState.players.find(p => p.id === defenderId)!;
                const isAttackerCorrect = normalizeAnswer(gameState.activeQuestion.playerAnswers[attackerId] || '') === normalizeAnswer(question.correctAnswer);
                const isDefenderCorrect = normalizeAnswer(gameState.activeQuestion.playerAnswers[defenderId] || '') === normalizeAnswer(question.correctAnswer);
                
                if (isAttackerCorrect && isDefenderCorrect) {
                     setIsProcessingQuestion(true);
                     const langForTiebreaker = defender.isBot ? 'cs' : user.language;
                     const tieBreakerQuestion = await generateOpenEndedQuestion(gameState.board.find(f => f.id === gameState.activeQuestion!.targetFieldId)!.category!, gameState.questionHistory, langForTiebreaker);
                     setIsProcessingQuestion(false);
                     dispatch({ type: 'RESOLVE_TURN', payload: { tieBreakerQuestion }});
                } else {
                     dispatch({ type: 'RESOLVE_TURN' });
                }
            }
        };

        if (gameState.activeQuestion && Object.values(gameState.activeQuestion.playerAnswers).every(ans => ans !== null)) {
            logicTimeoutRef.current = window.setTimeout(triggerTiebreaker, 2000);
        }

    }, [gameState.activeQuestion, gameState.players, user.language, dispatch]);

    // Effect for bot turn logic
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

    // Effect to update user coins at game end
    React.useEffect(() => {
        if (gameState.gamePhase === GamePhase.GameOver) {
            const humanPlayer = gameState.players.find(p => !p.isBot);
            if (!humanPlayer) return;
            const isWinner = gameState.winners?.some(w => w.id === humanPlayer.id) ?? false;
            let finalCoins = humanPlayer.coins;
            if (isWinner) finalCoins += (gameState.players.length - 1) * WIN_COINS_PER_PLAYER;
            
            const finalUser = { ...user, luduCoins: finalCoins };
            setUser(finalUser);
            // Save coins to localStorage for persistence
            localStorage.setItem(`ludus_coins_${user.email}`, String(finalCoins));
        }
    }, [gameState.gamePhase, gameState.players, gameState.winners, setUser, user]);

    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    const isHumanAnswering = gameState.activeQuestion?.playerAnswers.hasOwnProperty(humanPlayer.id);

    const getHeaderText = () => {
        if (gameState.answerResult) return 'Vyhodnocuji...';
        if (isProcessingQuestion) return 'Načítám...';
        if (gameState.activeQuestion) {
             if (isHumanAnswering && gameState.activeQuestion.playerAnswers[humanPlayer.id] === null) return 'Odpovězte na otázku!';
             return 'Soupeř je na tahu...';
        }
        if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
             if (gameState.phase1Selections?.[humanPlayer.id]) return 'Čekání na ostatní hráče...';
             return `Kolo ${gameState.round}/${PHASE_DURATIONS.PHASE1_ROUNDS}: Vyberte si území`;
        }
        if (gameState.gamePhase === GamePhase.Phase2_Attacks && getAttackers(gameState.players).some(p => p.id === humanPlayer.id) && currentPlayer.id === humanPlayer.id) {
            return 'Jste na řadě s útokem!';
        }
        return <>Na tahu: <span className={`font-bold text-${currentPlayer?.color}-400`}>{currentPlayer?.name}</span></>;
    };
    
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const phaseName = gameState.gamePhase.replace(/PHASE_\d+_/,'').replace(/_/g, ' ');

    return (
        <div className="min-h-screen flex flex-col">
            {gameState.gamePhase === GamePhase.GameOver && <GameOverScreen gameState={gameState} onBackToLobby={onBackToLobby} themeConfig={themeConfig} />}
            <header className={`bg-gray-800/50 p-4 border-b ${themeConfig.accentBorder}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className={`text-2xl font-bold ${themeConfig.accentText} capitalize`}>Fáze: {phaseName.toLowerCase()}</h1>
                        <p className="text-gray-400">Kolo: {gameState.round}</p>
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
                    <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4`}>Hráči</h2>
                    <PlayerStatusUI players={gameState.players} currentPlayerId={currentPlayer?.id} board={gameState.board} themeConfig={themeConfig} />
                    {gameState.gamePhase === GamePhase.Phase2_Attacks && <AttackOrderUI attackers={getAttackers(gameState.players)} currentPlayerId={currentPlayer?.id} themeConfig={themeConfig} />}
                    <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4 mt-6`}>Záznam Hry</h2>
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
            {gameState.answerResult && <AnswerFeedbackModal result={gameState.answerResult} themeConfig={themeConfig} onClear={() => dispatch({type: 'CLEAR_ANSWER_FEEDBACK'})} />}
            {gameState.eliminationResult && <EliminationFeedbackModal result={gameState.eliminationResult} themeConfig={themeConfig} onClear={() => dispatch({type: 'CLEAR_ELIMINATION_FEEDBACK'})} />}
        </div>
    );
};