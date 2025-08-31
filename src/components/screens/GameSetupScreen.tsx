
import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { PLAYER_COLOR_HEX } from '../../constants';

export const GameSetupScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onStartGame, onBack, themeConfig }) => {
    const [playerCount, setPlayerCount] = React.useState<number>(2);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
             <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>Vytvořit Lokální Hru</h1>
             <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-md`}>
                 <div className="mb-6">
                     <label className="block text-xl text-gray-300 mb-3">Herní Mód: Všichni proti všem</label>
                     <p className="text-gray-500">Týmové módy již brzy!</p>
                 </div>
                 <div className="mb-8">
                     <label htmlFor="playerCount" className="block text-xl text-gray-300 mb-3">Počet Hráčů</label>
                     <select id="playerCount" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))} className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}>
                         <option value="2">2 Hráči</option>
                         <option value="4">4 Hráči</option>
                     </select>
                 </div>
                 <div className="flex justify-between items-center">
                    <NeonButton variant="secondary" onClick={onBack} themeConfig={themeConfig}>Zpět do Lobby</NeonButton>
                    <NeonButton onClick={() => onStartGame(playerCount)} themeConfig={themeConfig}>Začít Hru</NeonButton>
                 </div>
             </div>
        </div>
    );
};