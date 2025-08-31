import * as React from 'react';
import { Theme } from '../../types.ts';
import { themes } from '../../App.tsx';
import { NeonButton } from '../ui/NeonButton.tsx';
import { PLAYER_COLOR_HEX } from '../../constants.ts';

export const OnlineLobbyScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onStartGame, onBack, themeConfig }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>Online Aréna</h1>
        <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-md space-y-4`}>
            <NeonButton onClick={() => onStartGame(2)} className="w-full h-16" themeConfig={themeConfig}>Rychlá Hra (1v1)</NeonButton>
            <NeonButton onClick={() => onStartGame(4)} className="w-full h-16" themeConfig={themeConfig}>Vytvořit Hru (1v1v1v1)</NeonButton>
            <NeonButton variant="secondary" onClick={onBack} className="w-full mt-4" themeConfig={themeConfig}>Zpět</NeonButton>
        </div>
    </div>
);