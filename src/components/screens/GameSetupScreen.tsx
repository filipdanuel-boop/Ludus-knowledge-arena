import * as React from 'react';
import { Theme, QuestionDifficulty } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { PLAYER_COLOR_HEX } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext';

export const GameSetupScreen: React.FC<{ onStartGame: (playerCount: number, botDifficulty: QuestionDifficulty) => void; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onStartGame, onBack, themeConfig }) => {
    const { t } = useTranslation();
    const [playerCount, setPlayerCount] = React.useState<number>(2);
    const [botDifficulty, setBotDifficulty] = React.useState<QuestionDifficulty>('medium');

    const difficultyOptions: { level: QuestionDifficulty; descKey: string; colors: string }[] = [
        { level: 'easy', descKey: 'difficultyEasyDesc', colors: 'border-lime-400 bg-lime-500/20 text-lime-300' },
        { level: 'medium', descKey: 'difficultyMediumDesc', colors: 'border-amber-400 bg-amber-500/20 text-amber-300' },
        { level: 'hard', descKey: 'difficultyHardDesc', colors: 'border-rose-400 bg-rose-500/20 text-rose-300' },
    ];

    const selectedDifficulty = difficultyOptions.find(opt => opt.level === botDifficulty);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
             <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>{t('createLocalGame')}</h1>
             <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-md`}>
                 <div className="mb-6">
                     <label className="block text-xl text-gray-300 mb-3">{t('gameModeFFA')}</label>
                     <p className="text-gray-500">{t('teamModesSoon')}</p>
                 </div>
                 <div className="mb-8">
                     <label htmlFor="playerCount" className="block text-xl text-gray-300 mb-3">{t('playerCount')}</label>
                     <select id="playerCount" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))} className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}>
                         <option value="2">{t('playerCountOption', 2)}</option>
                         <option value="4">{t('playerCountOption', 4)}</option>
                     </select>
                 </div>
                 <div className="mb-8">
                     <label className="block text-xl text-gray-300 mb-3">{t('botDifficulty')}</label>
                     <div className="grid grid-cols-3 gap-3">
                         {difficultyOptions.map(({ level, colors }) => {
                             const isActive = botDifficulty === level;
                             return (
                                 <button
                                     key={level}
                                     onClick={() => setBotDifficulty(level)}
                                     className={`p-3 rounded-lg border font-bold transition-all text-center text-lg ${isActive ? colors : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 text-white'}`}
                                 >
                                     {t(`difficulty${level.charAt(0).toUpperCase() + level.slice(1)}`)}
                                 </button>
                             );
                         })}
                     </div>
                     {selectedDifficulty && (
                         <div className="text-gray-400 mt-3 text-center text-sm min-h-[60px] bg-gray-900/50 p-2 rounded-md flex items-center justify-center">
                             <p className="animate-fade-in">{t(selectedDifficulty.descKey)}</p>
                         </div>
                     )}
                 </div>
                 <div className="flex justify-between items-center">
                    <NeonButton variant="secondary" onClick={onBack} themeConfig={themeConfig}>{t('backToLobby')}</NeonButton>
                    <NeonButton onClick={() => onStartGame(playerCount, botDifficulty)} themeConfig={themeConfig}>{t('startGame')}</NeonButton>
                 </div>
             </div>
        </div>
    );
};