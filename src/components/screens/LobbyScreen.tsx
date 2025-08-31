import * as React from 'react';
import { User, Language, Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { OnlinePlayerCounter } from '../ui/OnlinePlayerCounter';
import { LuduCoin } from '../ui/LuduCoin';
import { generateLobbyIntro } from '../../services/geminiService';
import { LANGUAGES, DAILY_REWARD_COINS, WEEKLY_REWARD_COINS } from '../../constants';
import * as userService from '../../services/userService';
import { RewardNotification } from '../ui/RewardNotification';

export const LobbyScreen: React.FC<{ 
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    onNavigate: (screen: string) => void; 
    onGetFreeCoins: () => void; 
    onOpenThemeSelector: () => void;
    onLogout: () => void;
    appMetadata: { name: string, description: string } | null;
    themeConfig: typeof themes[Theme];
}> = ({ user, setUser, onNavigate, onGetFreeCoins, onOpenThemeSelector, onLogout, appMetadata, themeConfig }) => {
    const [introText, setIntroText] = React.useState<string | null>(null);
    const [reward, setReward] = React.useState<number | null>(null);

    React.useEffect(() => {
        const userName = user.email.split('@')[0];
        const defaultIntro = `Vítej v aréně, ${userName}! Dokaž své znalosti a dobyj území.`;
        if (appMetadata) {
            generateLobbyIntro(appMetadata.name, appMetadata.description, userName)
                .then(text => setIntroText(text || defaultIntro))
                .catch(() => setIntroText(defaultIntro));
        } else {
            setIntroText(defaultIntro);
        }
    }, [appMetadata, user.email]);
    
    React.useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (user.lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const newStreak = user.lastLoginDate === yesterdayStr ? user.loginStreak + 1 : 1;
            const rewardAmount = newStreak % 7 === 0 ? WEEKLY_REWARD_COINS : DAILY_REWARD_COINS;

            const updatedUser: User = {
                ...user,
                luduCoins: user.luduCoins + rewardAmount,
                lastLoginDate: today,
                loginStreak: newStreak,
            };
            userService.saveUserData(updatedUser);
            setUser(updatedUser);
            setReward(rewardAmount);
        }
    }, [user, setUser]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as Language;
        const updatedUser = {...user, language: newLang };
        setUser(updatedUser);
        userService.saveUserData(updatedUser);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {reward && <RewardNotification amount={reward} onDismiss={() => setReward(null)} />}
            <div className="absolute top-4 left-4">
                <button 
                    onClick={onOpenThemeSelector} 
                    className={`p-3 rounded-lg ${themeConfig.accentBorder} bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700 transition-colors`}
                    aria-label="Změnit téma"
                    title="Změnit téma"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                </button>
            </div>
            <div className={`absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} p-3 rounded-lg flex items-center gap-4`}>
                 <button onClick={() => onNavigate('PROFILE')} className="flex flex-col text-right hover:bg-gray-700/50 p-2 rounded-md transition-colors">
                    <p className={`${themeConfig.accentText} font-bold`}>{user.email}</p>
                    <div className="flex items-center gap-2 justify-end">
                        <LuduCoin themeConfig={themeConfig} className='w-5 h-5'/>
                        <p className="text-yellow-400 text-lg font-bold">{user.luduCoins.toLocaleString()}</p>
                    </div>
                </button>
                <select value={user.language} onChange={handleLanguageChange} className={`bg-gray-700 border ${themeConfig.accentBorder} text-white p-2 rounded focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}>
                    {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
                 <button 
                    onClick={onLogout} 
                    className={`p-2 rounded-lg ${themeConfig.accentBorder} bg-gray-700 text-white hover:bg-rose-600/50 transition-colors`}
                    aria-label="Odhlásit se"
                    title="Odhlásit se"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
                <OnlinePlayerCounter themeConfig={themeConfig}/>
            </div>
            <h1 className={`text-6xl font-bold ${themeConfig.accentText} mb-4 ${themeConfig.pulseAnimation}`}>Hlavní Lobby</h1>
            {introText ? (
                <p className="text-center text-xl text-gray-300 mb-8 max-w-2xl animate-fade-in">{introText}</p>
            ) : (
                <div className="h-8 bg-gray-700/50 rounded w-3/4 md:w-1/2 mx-auto mb-8 animate-pulse"></div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                <div className="flex flex-col items-center">
                    <NeonButton onClick={() => onNavigate('GAME_SETUP')} themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        Hrát Lokálně
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Hrajte proti botům na jednom zařízení.</p>
                </div>
                <div className="flex flex-col items-center">
                    <NeonButton onClick={() => onNavigate('ONLINE_LOBBY')} themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        Hrát Online <span className="text-xs bg-rose-500 text-white px-2 py-1 rounded-full">BETA</span>
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Vyzvěte ostatní hráče z celého světa.</p>
                </div>
                <div className="flex flex-col items-center">
                    <NeonButton onClick={onGetFreeCoins} variant="secondary" themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        Získat Coiny Zdarma
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Sledujte reklamu a získejte odměnu.</p>
                </div>
                <div className="flex flex-col items-center">
                    <NeonButton onClick={() => onNavigate('RULES')} variant="secondary" themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        Pravidla
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Naučte se, jak se stát šampionem.</p>
                </div>
            </div>
        </div>
    );
};
