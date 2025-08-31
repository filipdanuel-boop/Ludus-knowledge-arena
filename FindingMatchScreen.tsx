import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../App';
import { Spinner } from '../ui/Spinner';

export const FindingMatchScreen: React.FC<{ playerCount: number; onMatchFound: () => void; themeConfig: typeof themes[Theme] }> = ({ playerCount, onMatchFound, themeConfig }) => {
    const [elapsed, setElapsed] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        const matchTimer = setTimeout(onMatchFound, 5000); // Find match after 5s
        return () => {
            clearInterval(timer);
            clearTimeout(matchTimer);
        };
    }, [onMatchFound]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className={`text-4xl font-bold ${themeConfig.accentTextLight} mb-4`}>Vyhledávám zápas...</h1>
            <Spinner themeConfig={themeConfig} />
            <p className="text-xl mt-4 text-gray-400">Hledám {playerCount - 1} {playerCount - 1 > 1 ? 'soupeřů' : 'soupeře'}</p>
            <p className="text-lg mt-2 text-gray-500">Uplynulý čas: {elapsed}s</p>
        </div>
    );
};
