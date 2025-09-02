import * as React from 'react';
import { User, Theme, LeaderboardEntry } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { Spinner } from '../ui/Spinner';
import * as userService from '../../services/userService';
import { useTranslation } from '../../i18n/LanguageContext';

export const LeaderboardScreen: React.FC<{ user: User; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ user, onBack, themeConfig }) => {
    const { t } = useTranslation();
    const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const fetchData = () => {
            const data = userService.getLeaderboardData(user.email);
            setLeaderboardData(data);
            setLoading(false);
        };
        // Simulate a network request
        const timer = setTimeout(fetchData, 500);
        return () => clearTimeout(timer);
    }, [user.email]);
    
    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8 text-center`}>{t('leaderboardTitle')}</h1>
                
                <div className={`bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder} min-h-[400px]`}>
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner themeConfig={themeConfig} />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-center p-2 text-gray-400 font-bold border-b border-gray-700">
                                <div className="w-1/6 text-center">{t('rankHeader')}</div>
                                <div className="w-3/6">{t('playerHeader')}</div>
                                <div className="w-1/6 text-center">{t('levelHeader')}</div>
                                <div className="w-1/6 text-right">{t('xpHeader')}</div>
                            </div>
                            {/* Body */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {leaderboardData.map(entry => (
                                    <div 
                                        key={entry.rank}
                                        className={`flex items-center p-3 rounded-md transition-colors ${entry.isCurrentUser ? `bg-${themeConfig.accentText.split('-')[1]}-500/20` : 'hover:bg-gray-700/50'}`}
                                    >
                                        <div className="w-1/6 text-center text-xl font-bold">{entry.rank}</div>
                                        <div className="w-3/6 flex items-center gap-3">
                                            <span className="truncate">{entry.name}</span>
                                            {entry.isCurrentUser && <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-${themeConfig.accentText.split('-')[1]}-500 text-gray-900`}>{t('youBadge')}</span>}
                                        </div>
                                        <div className="w-1/6 text-center text-lg">{entry.level}</div>
                                        <div className="w-1/6 text-right font-semibold">{entry.xp.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <NeonButton onClick={onBack} themeConfig={themeConfig}>{t('backToLobby')}</NeonButton>
                </div>
            </div>
        </div>
    );
};