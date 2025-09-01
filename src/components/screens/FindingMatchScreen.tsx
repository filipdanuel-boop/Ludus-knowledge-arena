import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { Spinner } from '../ui/Spinner';
import { useTranslation } from '../../i18n/LanguageContext';

export const FindingMatchScreen: React.FC<{ playerCount: number; onMatchFound: () => void; themeConfig: typeof themes[Theme] }> = ({ playerCount, onMatchFound, themeConfig }) => {
    const { t } = useTranslation();
    const [elapsed, setElapsed] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        const matchTimer = setTimeout(onMatchFound, 5000); // Find match after 5s
        return () => {
            clearInterval(timer);
            clearTimeout(matchTimer);
        };
    }, [onMatchFound]);

    const opponentsCount = playerCount - 1;
    const opponentsText = opponentsCount > 1 ? t('opponent_other') : t('opponent_one');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className={`text-4xl font-bold ${themeConfig.accentTextLight} mb-4`}>{t('findingMatch')}</h1>
            <Spinner themeConfig={themeConfig} />
            <p className="text-xl mt-4 text-gray-400">{t('searchingForOpponents', opponentsCount, opponentsText)}</p>
            <p className="text-lg mt-2 text-gray-500">{t('elapsedTime', elapsed)}</p>
        </div>
    );
};