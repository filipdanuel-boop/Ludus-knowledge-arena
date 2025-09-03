import * as React from 'react';
import { GameState, Theme } from '../../types';
import { themes } from '../../themes';
import { useTranslation } from '../../i18n/LanguageContext';

export const AnswerFeedbackModal: React.FC<{ result: GameState['answerResult']; themeConfig: typeof themes[Theme] }> = ({ result, themeConfig }) => {
    const { t } = useTranslation();

    if (!result) return null;
    
    const { isCorrect } = result;
    const animationClass = isCorrect ? 'animate-flash-green' : 'animate-shake';
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in`}>
            <div className={`p-8 rounded-lg text-center w-full max-w-md border-4 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'} ${animationClass}`}>
                <h2 className={`text-5xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? t('correct') : t('incorrect')}
                </h2>
            </div>
        </div>
    );
};