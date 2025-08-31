
import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';
import { NeonButton } from '../ui/NeonButton';
import { LuduCoin } from '../ui/LuduCoin';
import { AD_REWARD_COINS } from '../../constants';


export const AdRewardModal: React.FC<{ onClaim: () => void; themeConfig: typeof themes[Theme] }> = ({ onClaim, themeConfig }) => (
    <Modal isOpen={true} themeConfig={themeConfig}>
        <div className="text-center">
            <h2 className={`text-3xl font-bold ${themeConfig.accentTextLight} mb-4`}>Sledujete Reklamu</h2>
            <div className="bg-gray-700 h-48 flex items-center justify-center rounded-lg mb-6">
                <p className="text-gray-400">Video se přehrává...</p>
            </div>
            <NeonButton onClick={onClaim} themeConfig={themeConfig}>
                Získat <span className="font-bold text-yellow-300">{AD_REWARD_COINS}</span> <LuduCoin className="w-8 h-8" themeConfig={themeConfig}/>
            </NeonButton>
        </div>
    </Modal>
);