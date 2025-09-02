import * as React from 'react';
import { GameState, Theme } from '../../types';
import { themes } from '../../themes';
import { useTranslation } from '../../i18n/LanguageContext';

export const EliminationFeedbackModal: React.FC<{ result: GameState['eliminationResult']; themeConfig: typeof themes[Theme] }> = ({ result, themeConfig }) => {
    const { t } = useTranslation();
    
    // CRITICAL FIX: The internal timer was removed to prevent race conditions.
    // The parent GameScreen component now controls the lifecycle of this modal.

    if (!result) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-8 rounded-lg text-center w-full max-w-lg border-4 border-rose-600 bg-rose-900/50">
                <h2 className="text-5xl font-bold mb-4 text-rose-400 animate-text-focus-in">{t('eliminationTitle')}</h2>
                <p className="text-2xl text-gray-200">
                   {t('eliminationMessage', result.attackerName, result.eliminatedPlayerName)}
                </p>
            </div>
        </div>
    );
};