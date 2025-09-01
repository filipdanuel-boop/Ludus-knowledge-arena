import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { PLAYER_COLOR_HEX } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext';

export const RulesScreen: React.FC<{ onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onBack, themeConfig }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8 text-center`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>{t('rulesTitle')}</h1>
                <div className={`space-y-6 bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder}`}>
                    <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>{t('rulesDuelsTitle')}</h2>
                        <p className="text-gray-400">{t('rulesDuelsDesc')}</p>
                    </div>
                     <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>{t('rulesHpTitle')}</h2>
                        <p className="text-gray-400">{t('rulesHpDesc')}</p>
                    </div>
                    <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>{t('rulesPhase1Title')}</h2>
                        <p className="text-gray-400">{t('rulesPhase1Desc')}</p>
                    </div>
                     <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>{t('rulesEliminationTitle')}</h2>
                        <p className="text-gray-400">{t('rulesEliminationDesc')}</p>
                    </div>
                </div>
                 <div className="text-center mt-8">
                    <NeonButton onClick={onBack} themeConfig={themeConfig}>{t('backToLobby')}</NeonButton>
                 </div>
            </div>
        </div>
    );
};