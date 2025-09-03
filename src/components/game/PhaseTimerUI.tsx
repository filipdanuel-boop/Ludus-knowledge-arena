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

    return (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-40 animate-fade-in">
            <p className={`text-3xl mb-4 font-semibold ${themeConfig.accentTextLight}`}>{getTextForPhase()}</p>
            <div className="text-8xl font-bold text-white">
                {Math.ceil(timeLeft)}
            </div>
             {timeLeft <= 3 && timeLeft > 0 && <p className="text-xl mt-4 font-semibold text-red-500 animate-pulse">{t('timeUp')}</p>}
        </div>
    );
};
