import * as React from 'react';
import { Language } from '../../types';
import { LANGUAGES } from '../../constants';
import { themes } from '../../themes';
import { useTranslation } from '../../i18n/LanguageContext';
import { NeonButton } from '../ui/NeonButton';

export const LanguageSelectionScreen: React.FC<{ onSelect: (language: Language) => void }> = ({ onSelect }) => {
    const themeConfig = themes['default']; // Use a default theme for this screen

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-10">
                <h1 className={`text-7xl font-bold ${themeConfig.accentText} tracking-widest ${themeConfig.pulseAnimation}`}>LUDUS</h1>
                <p className="text-gray-400 text-xl mt-2">Choose your language / Vyberte si jazyk</p>
            </div>
            <div className={`w-full max-w-sm bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} shadow-2xl ${themeConfig.accentShadow} space-y-4`}>
                {LANGUAGES.map(lang => (
                    <NeonButton
                        key={lang.code}
                        onClick={() => onSelect(lang.code)}
                        className="w-full"
                        themeConfig={themeConfig}
                    >
                        {lang.name}
                    </NeonButton>
                ))}
            </div>
        </div>
    );
};