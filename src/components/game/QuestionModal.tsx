import * as React from 'react';
import { GameState, Player, Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { NeonButton } from '../ui/NeonButton';
import { LuduCoin } from '../ui/LuduCoin';
import { TimerUI } from './TimerUI';
import { HINT_COSTS } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext';

const ANSWER_TIME_LIMIT = 15;

export const QuestionModal: React.FC<{
    activeQuestion: GameState['activeQuestion'];
    onAnswer: (answer: string) => void;
    onUseHint: () => void;
    onTimeout: () => void;
    loading: boolean;
    humanPlayer: Player;
    themeConfig: typeof themes[Theme];
}> = ({ activeQuestion, onAnswer, onUseHint, onTimeout, loading, humanPlayer, themeConfig }) => {
    const { t } = useTranslation();
    const [writtenAnswer, setWrittenAnswer] = React.useState("");
    
    React.useEffect(() => {
        setWrittenAnswer(""); // Reset on new question
    }, [activeQuestion?.question.question]);

    const canAffordHint = humanPlayer.coins >= HINT_COSTS.AUTO_ANSWER;
    const isAnswering = activeQuestion && activeQuestion.playerAnswers[humanPlayer.id] === null;
    const isHealing = activeQuestion?.actionType === 'HEAL';
    const isTieBreaker = activeQuestion?.isTieBreaker;
    const questionType = activeQuestion?.questionType;

    const handleSubmitWrittenAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (writtenAnswer.trim()) {
            onAnswer(writtenAnswer.trim());
        }
    };

    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Spinner themeConfig={themeConfig} />
                    <p className={`mt-4 text-xl ${themeConfig.accentTextLight}`}>{t('loading')}</p>
                </div>
            ) : activeQuestion && (
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`${themeConfig.accentText} text-sm mb-2`}>{isTieBreaker ? t('tiebreaker') : (isHealing ? t('repairingBase') : t('question'))}</p>
                            <h2 className="text-2xl font-bold">{activeQuestion.question.question}</h2>
                        </div>
                        {isAnswering && <TimerUI startTime={activeQuestion.startTime} timeLimit={ANSWER_TIME_LIMIT} onTimeout={onTimeout} themeConfig={themeConfig} />}
                    </div>
                    {questionType === 'MULTIPLE_CHOICE' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeQuestion.question.options?.map(option => (
                                <button
                                    key={option}
                                    onClick={() => onAnswer(option)}
                                    disabled={!isAnswering}
                                    className={`p-4 bg-gray-700 rounded-md text-left text-lg hover:bg-cyan-600 transition-colors duration-200 border border-transparent hover:${themeConfig.accentBorderOpaque} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                    {questionType === 'OPEN_ENDED' && (
                        <form onSubmit={handleSubmitWrittenAnswer}>
                            <input
                                type="text"
                                value={writtenAnswer}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                disabled={!isAnswering}
                                autoFocus
                                className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-lg focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                                placeholder={t('yourAnswer')}
                            />
                             <div className="text-right mt-4">
                                <NeonButton type="submit" disabled={!isAnswering || !writtenAnswer.trim()} themeConfig={themeConfig}>{t('submit')}</NeonButton>
                             </div>
                        </form>
                    )}
                     {isAnswering && questionType === 'MULTIPLE_CHOICE' && (
                        <div className="mt-6 border-t border-gray-700 pt-4 flex justify-end">
                            <NeonButton 
                                variant="secondary" 
                                onClick={onUseHint}
                                disabled={!canAffordHint}
                                title={!canAffordHint ? t('insufficientCoins') : ""}
                                themeConfig={themeConfig}
                            >
                                {t('hint', HINT_COSTS.AUTO_ANSWER)} <LuduCoin className="w-5 h-5" themeConfig={themeConfig}/>
                            </NeonButton>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};