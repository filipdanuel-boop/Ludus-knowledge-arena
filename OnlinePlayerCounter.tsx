import * as React from 'react';
import { Theme } from '../../types.ts';
import { themes } from '../../App.tsx';

export const OnlinePlayerCounter: React.FC<{ themeConfig: typeof themes[Theme] }> = ({ themeConfig }) => {
    const [count, setCount] = React.useState(Math.floor(Math.random() * (1200 - 800 + 1)) + 800);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => {
                const change = Math.floor(Math.random() * 51) - 25; // -25 to +25
                return Math.max(500, prevCount + change);
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg`}>
            <div className="relative flex items-center justify-center h-2.5 w-2.5">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></div>
            </div>
            <p className="text-white font-semibold text-sm">{count.toLocaleString()} <span className="text-gray-400 font-normal">Online</span></p>
        </div>
    );
};