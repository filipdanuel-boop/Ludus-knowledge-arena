import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';
import { NeonButton } from '../ui/NeonButton';
import { LuduCoin } from '../ui/LuduCoin';
// FIX: Replaced the non-existent constant AD_REWARD_COINS with DAILY_REWARD_COINS to fix the build error.
import { DAILY_REWARD_COINS } from '../../constants';
import { useTranslation } from '../../i18n/LanguageContext';


export const AdRewardModal: React.FC<{ onClaim: () => void; themeConfig: typeof themes[Theme] }> = ({ onClaim, themeConfig }) => {
    const { t } = useTranslation();
    return (
    <Modal isOpen={true} themeConfig={themeConfig}>
        <div className="text-center">
            <h2 className={`text-3xl font-bold ${themeConfig.accentTextLight} mb-4`}>{t('adWatching')}</h2>
            <div className="bg-gray-700 h-48 flex items-center justify-center rounded-lg mb-6">
                <p className="text-gray-400">{t('videoPlaying')}</p>
            </div>
            <NeonButton onClick={onClaim} themeConfig={themeConfig}>
                {t('getCoins')} <span className="font-bold text-yellow-300">{DAILY_REWARD_COINS}</span> <LuduCoin className="w-8 h-8" themeConfig={themeConfig}/>
            </NeonButton>
        </div>
    </Modal>
    );
};