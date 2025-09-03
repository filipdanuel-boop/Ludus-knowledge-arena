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
    
    // Game Timer Effect
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

    // CRITICAL FIX: Effect to automatically clear feedback modals after a delay.
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
                setIsProcessingQuestion(true);
                const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
                const question = await generateQuestion(randomCategory, gameState.questionHistory, user.language, gameState.botDifficulty);
                setIsProcessingQuestion(false);
                if (question) {
                     dispatch({ type: 'SET_QUESTION', payload: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayerFromState.id, isBaseAttack: false, isTieBreaker: false, actionType: 'ATTACK', playerAnswers: { [currentPlayerFromState.id]: null }, startTime: Date.now(), category: randomCategory } });
                     setEventNotification({ type: 'success', message: t('blackFieldSuccess') });
                }
            } else if (field.ownerId && field.ownerId !== currentPlayerFromState.id) {
                if (field.type === 'PLAYER_BASE') {
                    setEventNotification({ type: 'danger', message: t('baseUnderAttackWarning') });
                }
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
        if (gameState.gamePhase === 'Phase1_RoundEnd') {
            const didPhaseEnd = gameState.round > PHASE_DURATIONS.PHASE1_ROUNDS;
            if (didPhaseEnd)