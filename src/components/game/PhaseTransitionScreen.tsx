import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { useTranslation } from '../../i18n/LanguageContext';

interface PhaseTransitionScreenProps {
    phaseNumber: number;
    phaseName: string;
    themeConfig: typeof themes[Theme];
}

export const PhaseTransitionScreen: React.FC<PhaseTransitionScreenProps> = ({ phaseNumber, phaseName, themeConfig }) => {
    const { t } = useTranslation();
    
    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
            <h1 className={`text-4xl ${themeConfig.accentTextLight} font-semibold animate-text-focus-in`}>{t('phase')} {phaseNumber}</h1>
            <h2 className="text-8xl text-white font-bold animate-text-focus-in" style={{ animationDelay: '0.5s' }}>
                {phaseName}
            </h2>
        </div>
    );
};