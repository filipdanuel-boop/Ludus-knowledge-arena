import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { Spinner } from '../ui/Spinner';
import { useTranslation } from '../../i18n/LanguageContext';
import { BOT_NAMES } from '../../constants';

export const FindingMatchScreen: React.FC<{ playerCount: number; onMatchFound: () => void; themeConfig: typeof themes[Theme] }> = ({ playerCount, onMatchFound, themeConfig }) => {
    const { t } = useTranslation();
    const [foundOpponents, setFoundOpponents] = React.useState<string[]>([]);
    const opponentsToFind = playerCount - 1;

    React.useEffect(() => {
        // Create a shuffled, unique list of bot names for this match
        const availableBotNames = [...BOT_NAMES].sort(() => 0.5 - Math.random());

        // If all opponents are found, wait a bit then start the match
        if (foundOpponents.length >= opponentsToFind) {
            const finalTimer = setTimeout(onMatchFound, 1500);
            return () => clearTimeout(finalTimer);
        }

        // Set a timer to find the next opponent
        const timer = setTimeout(() => {
            setFoundOpponents(prev => [...prev, availableBotNames[prev.length]]);
        }, 1000 + Math.random() * 1500); // Random delay between 1s and 2.5s

        return () => clearTimeout(timer);
    }, [foundOpponents, opponentsToFind, onMatchFound]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className={`text-4xl font-bold ${themeConfig.accentTextLight} mb-4`}>{t('findingMatch')}</h1>
            <Spinner themeConfig={themeConfig} />
            <p className="text-xl mt-4 text-gray-400">
                {t('playersFoundOf', foundOpponents.length, opponentsToFind)}
            </p>
            <div className="mt-8 w-full max-w-md">
                {foundOpponents.map((name, index) => (
                     <div key={index} className="bg-gray-800/50 p-3 rounded-md mb-2 animate-fade-in text-center">
                        <p className="text-lg text-white font-semibold">{name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
