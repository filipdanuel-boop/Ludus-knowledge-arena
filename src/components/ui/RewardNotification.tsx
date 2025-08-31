import * as React from 'react';
import { LuduCoin } from './LuduCoin';
import { themes } from '../../themes';

export const RewardNotification: React.FC<{ amount: number; onDismiss: () => void; }> = ({ amount, onDismiss }) => {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 500); // Wait for fade out animation
        }, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const themeConfig = themes['default']; // Notification has a fixed theme

    return (
        <div 
            className={`fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 border ${themeConfig.accentBorder} p-4 rounded-lg shadow-2xl flex items-center gap-4 z-50 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
        >
            <LuduCoin themeConfig={themeConfig} className="w-8 h-8"/>
            <div>
                <p className={`${themeConfig.accentTextLight} font-bold`}>Denní odměna!</p>
                <p className="text-white">Získal jsi +{amount} mincí!</p>
            </div>
        </div>
    );
};
