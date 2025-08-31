import * as React from 'react';
import { GameState, Theme } from '../../types.ts';
import { themes } from '../../App.tsx';

export const AnswerFeedbackModal: React.FC<{ result: GameState['answerResult']; onClear: () => void; themeConfig: typeof themes[Theme] }> = ({ result, onClear, themeConfig }) => {
    
    React.useEffect(() => {
        const timer = setTimeout(onClear, 2000);
        return () => clearTimeout(timer);
    }, [onClear]);

    if (!result) return null;
    
    const { isCorrect, correctAnswer } = result;
    const animationClass = isCorrect ? 'animate-flash-green' : 'animate-shake';
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in`}>
            <div className={`p-8 rounded-lg text-center w-full max-w-md border-4 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'} ${animationClass}`}>
                <h2 className={`text-5xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? "Správně!" : "Špatně!"}
                </h2>
                {!isCorrect && (
                    <p className="text-xl text-gray-300">Správná odpověď byla: <span className={`font-bold ${themeConfig.accentTextLight}`}>{correctAnswer}</span></p>
                )}
            </div>
        </div>
    );
};