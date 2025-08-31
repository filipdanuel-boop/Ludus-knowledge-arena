import * as React from 'react';
import { Theme } from '../../types.ts';
import { themes } from '../../App.tsx';

export const LuduCoin: React.FC<{ className?: string; themeConfig: typeof themes[Theme] }> = ({ className = "w-6 h-6", themeConfig }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="url(#grad)" stroke={themeConfig.luduCoinGradient.stopColor2} strokeWidth="1.5"/>
        <path d="M10.5 8L10.5 16L14.5 16" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: themeConfig.luduCoinGradient.stopColor1, stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: themeConfig.luduCoinGradient.stopColor2, stopOpacity:1}} />
            </radialGradient>
        </defs>
    </svg>
);