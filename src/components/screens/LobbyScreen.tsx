
import * as React from 'react';
import { User, Language, Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { OnlinePlayerCounter } from '../ui/OnlinePlayerCounter';
import { LuduCoin } from '../ui/LuduCoin';
import { generateLobbyIntro } from '../../services/geminiService';
import { LANGUAGES } from '../../constants';

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

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value as Language;
        setUser(u => u ? { ...u, language: newLang } : null);
        localStorage.setItem('ludus_language', newLang);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
                 <div className="flex flex-col text-right">
                    <p className={`${themeConfig.accentText} font-bold`}>{user.email}</p>
                    <div className="flex items-center gap-2 justify-end">
                        <LuduCoin themeConfig={themeConfig} className='w-5 h-5'/>
                        <p className="text-yellow-400 text-lg font-bold">{user.luduCoins.toLocaleString()}</p>
                    </div>
                </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Hrát Lokálně
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Hrajte proti botům na jednom zařízení.</p>
                </div>
                <div className="flex flex-col items-center">
                    <NeonButton onClick={() => onNavigate('ONLINE_LOBBY')} themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293a1 1 0 010 1.414L5.414 8l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L18.586 8l-2.293-2.293a1 1 0 010-1.414z" /></svg>
                        Hrát Online <span className="text-xs bg-rose-500 text-white px-2 py-1 rounded-full">BETA</span>
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Vyzvěte ostatní hráče z celého světa.</p>
                </div>
                <div className="flex flex-col items-center">
                    <NeonButton onClick={onGetFreeCoins} variant="secondary" themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Získat Coiny Zdarma
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Sledujte reklamu a získejte odměnu.</p>
                </div>
                <div className="flex flex-col items-center">
                    <NeonButton onClick={() => onNavigate('RULES')} variant="secondary" themeConfig={themeConfig} className="w-full h-24 text-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Pravidla
                    </NeonButton>
                    <p className="text-gray-400 mt-2 text-center">Naučte se, jak se stát šampionem.</p>
                </div>
            </div>
        </div>
    );
};