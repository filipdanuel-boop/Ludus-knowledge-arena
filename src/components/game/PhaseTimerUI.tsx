import * as React from 'react';
import { GamePhase, Theme } from '../../types';
import { themes } from '../../themes';
import { useTranslation } from '../../i18n/LanguageContext';

interface PhaseTimerUIProps {
    phase: GamePhase;
    startTime: number;
    duration: number; // in seconds
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
            case GamePhase.Phase1_PickField:
                return t('phase1TimerPickField');
            case GamePhase.Phase1_ShowQuestion:
                return t('phase1TimerShowQuestion');
            default:
                return '';
        }
    };

    if (timeLeft === 0) return null;

    const allowClicksThrough = phase === GamePhase.Phase1_PickField;

    return (
        // Wrapper positions content but does not interact with mouse events itself.
        <div className="fixed inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
            {/* Background overlay. Its interactivity is explicitly controlled. */}
            <div 
                className={`absolute inset-0 bg-black/70 animate-fade-in ${allowClicksThrough ? 'pointer-events-none' : 'pointer-events-auto'}`} 
            />

            {/* Content is rendered on top of the background, but within the non-interactive wrapper. */}
            <div className="relative animate-fade-in text-center">
                <p className={`text-3xl mb-4 font-semibold ${themeConfig.accentTextLight}`}>{getTextForPhase()}</p>
                <div className="text-8xl font-bold text-white">
                    {Math.ceil(timeLeft)}
                </div>
                {timeLeft <= 3 && timeLeft > 0 && <p className="text-xl mt-4 font-semibold text-red-500 animate-pulse">{t('timeUp')}</p>}
            </div>
        </div>
    );
};
