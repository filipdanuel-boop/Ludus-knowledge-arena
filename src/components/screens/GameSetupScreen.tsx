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
                     <label htmlFor="botDifficulty" className="block text-xl text-gray-300 mb-3">{t('botDifficulty')}</label>
                     <select id="botDifficulty" value={botDifficulty} onChange={e => setBotDifficulty(e.target.value as QuestionDifficulty)} className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}>
                         <option value="easy">{t('difficultyEasy')}</option>
                         <option value="medium">{t('difficultyMedium')}</option>
                         <option value="hard">{t('difficultyHard')}</option>
                     </select>
                 </div>
                 <div className="flex justify-between items-center">
                    <NeonButton variant="secondary" onClick={onBack} themeConfig={themeConfig}>{t('backToLobby')}</NeonButton>
                    <NeonButton onClick={() => onStartGame(playerCount, botDifficulty)} themeConfig={themeConfig}>{t('startGame')}</NeonButton>
                 </div>
             </div>
        </div>
    );
};