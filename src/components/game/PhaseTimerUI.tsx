
import * as React from 'react';
import { GamePhase, Theme } from '../../types';
import { themes } from '../../themes';
import { useTranslation } from '../../i18n/LanguageContext';

interface PhaseTimerUIProps {
    phase: GamePhase;
    startTime: number;
    duration: number;
    themeConfig: typeof themes[Theme];
}

export const PhaseTimerUI: React.FC<PhaseTimerUIProps> = ({ phase, startTime, duration, themeConfig }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = React.useState(duration);

    React.useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);
        }, 100);

        return () => clearInterval(interval);
    }, [startTime, duration]);

    const getTextForPhase = () => {
        switch (phase) {
            // FIX: Replaced Phase1_PickField with Phase1_LandGrab
            case GamePhase.Phase1_LandGrab:
                return t('phase1TimerPickField');
            case GamePhase.Phase1_ShowQuestion:
                return t('phase1TimerShowQuestion');
            default:
                return '';
        }
    };

    if (timeLeft === 0) return null;
    // FIX: Replaced Phase1_PickField with Phase1_LandGrab
    const shouldBlockClicks = phase !== GamePhase.Phase1_LandGrab;

    return (
        // Root container is a non-interactive positioning layer that allows clicks through.
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
            
            {/* This overlay is rendered only when needed and explicitly blocks clicks. */}
            {shouldBlockClicks && <div className="absolute inset-0 bg-black/70 animate-fade-in pointer-events-auto"></div>}

            {/* The text content itself. pointer-events-auto makes it "re-appear" from its parent,
                but since it has no background, it doesn't block clicks on elements beneath it. */}
            <div className="relative animate-fade-in text-center pointer-events-auto">
                <p className={`text-3xl mb-4 font-semibold ${themeConfig.accentTextLight}`} style={{ textShadow: '0 0 10px rgba(0,0,0,0.7)' }}>{getTextForPhase()}</p>
                <div className="text-8xl font-bold text-white" style={{ textShadow: '0 0 15px rgba(0,0,0,0.7)' }}>
                    {Math.ceil(timeLeft)}
                </div>
                {timeLeft <= 3 && timeLeft > 0 && <p className="text-xl mt-4 font-semibold text-red-500 animate-pulse">{t('timeUp')}</p>}
            </div>
        </div>
    );
};
