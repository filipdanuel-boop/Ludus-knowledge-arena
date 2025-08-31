
import * as React from 'react';
import { GameState, Theme } from '../../types';
import { themes } from '../../themes';

export const EliminationFeedbackModal: React.FC<{ result: GameState['eliminationResult']; onClear: () => void; themeConfig: typeof themes[Theme] }> = ({ result, onClear, themeConfig }) => {
    
    React.useEffect(() => {
        const timer = setTimeout(onClear, 2000);
        return () => clearTimeout(timer);
    }, [onClear]);

    if (!result) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-8 rounded-lg text-center w-full max-w-lg border-4 border-rose-600 bg-rose-900/50">
                <h2 className="text-5xl font-bold mb-4 text-rose-400 animate-text-focus-in">VYŘAZEN!</h2>
                <p className="text-2xl text-gray-200">
                    <span className={`font-bold ${themeConfig.accentText}`}>{result.attackerName}</span> vyřadil hráče <span className="font-bold text-red-500">{result.eliminatedPlayerName}</span>!
                </p>
            </div>
        </div>
    );
};
