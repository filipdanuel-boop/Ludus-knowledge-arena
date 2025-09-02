import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { PLAYER_COLOR_HEX } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext';

export const OnlineLobbyScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onStartGame, onBack, themeConfig }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>{t('onlineArena')}</h1>
            <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-md space-y-4`}>
                <NeonButton onClick={() => onStartGame(2)} className="w-full h-16" themeConfig={themeConfig}>{t('quickGame1v1')}</NeonButton>
                <NeonButton onClick={() => onStartGame(4)} className="w-full h-16" themeConfig={themeConfig}>{t('createGame1v1v1v1')}</NeonButton>
                <NeonButton variant="secondary" onClick={onBack} className="w-full mt-4" themeConfig={themeConfig}>{t('back')}</NeonButton>
            </div>
        </div>
    );
};
