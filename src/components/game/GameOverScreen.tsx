import * as React from 'react';
import { GameState, Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';
import { NeonButton } from '../ui/NeonButton';
import { LuduCoin } from '../ui/LuduCoin';
import { WIN_COINS_PER_PLAYER } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext';

export const GameOverScreen: React.FC<{ gameState: GameState; onBackToLobby: () => void; themeConfig: typeof themes[Theme] }> = ({ gameState, onBackToLobby, themeConfig }) => {
    const { t } = useTranslation();
    const { winners } = gameState;
    const humanPlayer = gameState.players.find(p => !p.isBot);
    const humanIsWinner = humanPlayer && winners?.some(w => w.id === humanPlayer.id);
    const winBonus = humanIsWinner ? (gameState.players.length - 1) * WIN_COINS_PER_PLAYER : 0;

    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            <div className="text-center">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-4 animate-text-focus-in`}>{t('gameOver')}</h1>
                {winners && winners.length > 0 ? (
                    <>
                        <h2 className="text-3xl text-yellow-400 mb-2">{t('winner', winners.map(w => w.name).join(', '))}</h2>
                        <p className="text-xl text-gray-300 mb-6">{t('finalScore', winners[0].score.toLocaleString())}</p>
                    </>
                ) : (
                    <p className="text-2xl text-gray-400 mb-6">{t('tieGame')}</p>
                )}
                
                {humanIsWinner && (
                    <div className="my-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg inline-block">
                        <p className="text-yellow-300 font-bold text-lg">{t('victoryBonus', winBonus.toLocaleString())} <LuduCoin className="w-6 h-6 inline-block" themeConfig={themeConfig} /></p>
                    </div>
                )}
                
                <h3 className={`text-xl ${themeConfig.accentTextLight} mb-3 border-t border-gray-700 pt-4`}>{t('finalStandings')}</h3>
                <div className="space-y-2 max-w-sm mx-auto">
                    {[...gameState.players].sort((a,b) => b.score - a.score).map((p, index) => (
                         <div key={p.id} className={`flex justify-between p-2 rounded ${winners?.some(w => w.id === p.id) ? 'bg-yellow-500/20' : 'bg-gray-700/50'}`}>
                            <span className={`font-bold text-${p.color}-400`}>{index + 1}. {p.name}</span>
                            <span className="text-white">{p.score.toLocaleString()} {t('points')}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <NeonButton onClick={onBackToLobby} themeConfig={themeConfig}>{t('backToLobby')}</NeonButton>
                </div>
            </div>
        </Modal>
    );
};