import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Category, Field, FieldType, GamePhase, GameState, Player, Question, User, QuestionType, Theme, Language } from './types';
import { CATEGORIES, PLAYER_COLORS, INITIAL_COINS, POINTS, PHASE_DURATIONS, HINT_COSTS, PLAYER_COLOR_HEX, BASE_HP, FIELD_HP, AD_REWARD_COINS, BOT_NAMES, ELIMINATION_COIN_BONUS, WIN_COINS_PER_PLAYER, EMAIL_VERIFICATION_BONUS, LANGUAGES } from './constants';
import { generateQuestion, generateOpenEndedQuestion, generateLobbyIntro } from './services/geminiService';

const ANSWER_TIME_LIMIT = 15; // 15 sekund na odpověď

const themes: Record<Theme, {
    name: string;
    background: string;
    accentText: string;
    accentTextLight: string;
    accentBorder: string;
    accentBorderOpaque: string;
    accentBorderSecondary: string;
    accentShadow: string;
    accentRing: string;
    neonButtonPrimary: string;
    neonButtonSecondary: string;
    spinnerBorder: string;
    pulseAnimation: string;
    luduCoinGradient: { stopColor1: string, stopColor2: string};
}> = {
    default: {
        name: 'Kyberpunk',
        background: 'bg-gray-900',
        accentText: 'text-cyan-400',
        accentTextLight: 'text-cyan-300',
        accentBorder: 'border-cyan-500/50',
        accentBorderOpaque: 'border-cyan-500',
        accentBorderSecondary: 'border-cyan-600',
        accentShadow: 'shadow-cyan-500/10',
        accentRing: 'focus:ring-cyan-500',
        neonButtonPrimary: "bg-cyan-500 text-gray-900 hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.7)] hover:shadow-[0_0_20px_rgba(6,182,212,0.9)] focus:ring-cyan-500",
        neonButtonSecondary: "bg-gray-700 text-cyan-300 border border-cyan-600 hover:bg-gray-600 hover:text-cyan-200 focus:ring-cyan-600",
        spinnerBorder: 'border-cyan-400',
        pulseAnimation: 'animate-pulse-bright',
        luduCoinGradient: { stopColor1: '#e0f2fe', stopColor2: '#7dd3fc'},
    },
    forest: {
        name: 'Les',
        background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-green-900 to-black',
        accentText: 'text-lime-400',
        accentTextLight: 'text-lime-300',
        accentBorder: 'border-lime-500/50',
        accentBorderOpaque: 'border-lime-500',
        accentBorderSecondary: 'border-lime-600',
        accentShadow: 'shadow-lime-500/10',
        accentRing: 'focus:ring-lime-500',
        neonButtonPrimary: "bg-lime-500 text-gray-900 hover:bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.7)] hover:shadow-[0_0_20px_rgba(132,204,22,0.9)] focus:ring-lime-500",
        neonButtonSecondary: "bg-gray-700 text-lime-300 border border-lime-600 hover:bg-gray-600 hover:text-lime-200 focus:ring-lime-600",
        spinnerBorder: 'border-lime-400',
        pulseAnimation: 'animate-pulse-bright-lime',
        luduCoinGradient: { stopColor1: '#f7fee7', stopColor2: '#d9f99d'},
    },
    ocean: {
        name: 'Oceán',
        background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-blue-900 to-black',
        accentText: 'text-sky-400',
        accentTextLight: 'text-sky-300',
        accentBorder: 'border-sky-500/50',
        accentBorderOpaque: 'border-sky-500',
        accentBorderSecondary: 'border-sky-600',
        accentShadow: 'shadow-sky-500/10',
        accentRing: 'focus:ring-sky-500',
        neonButtonPrimary: "bg-sky-500 text-gray-900 hover:bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)] hover:shadow-[0_0_20px_rgba(56,189,248,0.9)] focus:ring-sky-500",
        neonButtonSecondary: "bg-gray-700 text-sky-300 border border-sky-600 hover:bg-gray-600 hover:text-sky-200 focus:ring-sky-600",
        spinnerBorder: 'border-sky-400',
        pulseAnimation: 'animate-pulse-bright-sky',
        luduCoinGradient: { stopColor1: '#e0f2fe', stopColor2: '#bae6fd'},
    },
    inferno: {
        name: 'Peklo',
        background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-red-900 to-black',
        accentText: 'text-amber-400',
        accentTextLight: 'text-amber-300',
        accentBorder: 'border-amber-500/50',
        accentBorderOpaque: 'border-amber-500',
        accentBorderSecondary: 'border-amber-600',
        accentShadow: 'shadow-amber-500/10',
        accentRing: 'focus:ring-amber-500',
        neonButtonPrimary: "bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)] hover:shadow-[0_0_20px_rgba(251,191,36,0.9)] focus:ring-amber-500",
        neonButtonSecondary: "bg-gray-700 text-amber-300 border border-amber-600 hover:bg-gray-600 hover:text-amber-200 focus:ring-amber-600",
        spinnerBorder: 'border-amber-400',
        pulseAnimation: 'animate-pulse-bright-amber',
        luduCoinGradient: { stopColor1: '#fefce8', stopColor2: '#fde047'},
    }
};

// --- POMOCNÉ & UI KOMPONENTY ---

const Spinner: React.FC<{ themeConfig: typeof themes[Theme] }> = ({ themeConfig }) => (
  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.spinnerBorder}`}></div>
);

const LuduCoin: React.FC<{ className?: string; themeConfig: typeof themes[Theme] }> = ({ className = "w-6 h-6", themeConfig }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="url(#grad)" stroke={themeConfig.luduCoinGradient.stopColor2} strokeWidth="1.5"/>
        <path d="M10.5 8L10.5 16L14.5 16" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: themeConfig.luduCoinGradient.stopColor1, stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: themeConfig.luduCoinGradient.stopColor2, stopOpacity:1}} />
            </radialGradient>
        </defs>
    </svg>
);

const Modal: React.FC<{ children: React.ReactNode; isOpen: boolean; themeConfig: typeof themes[Theme] }> = ({ children, isOpen, themeConfig }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-gray-800 border ${themeConfig.accentBorder} rounded-lg shadow-xl ${themeConfig.accentShadow} p-6 w-full max-w-2xl text-white`}>
        {children}
      </div>
    </div>
  );
};

const NeonButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary', themeConfig: typeof themes[Theme] }> = ({ children, className, variant = 'primary', themeConfig, ...props }) => {
  const baseClasses = "px-6 py-2 rounded-md font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variantClasses = variant === 'primary' ? themeConfig.neonButtonPrimary : themeConfig.neonButtonSecondary;
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const OnlinePlayerCounter: React.FC<{ themeConfig: typeof themes[Theme] }> = ({ themeConfig }) => {
    const [count, setCount] = React.useState(Math.floor(Math.random() * (1200 - 800 + 1)) + 800);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => {
                const change = Math.floor(Math.random() * 51) - 25; // -25 to +25
                return Math.max(500, prevCount + change);
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg`}>
            <div className="relative flex items-center justify-center h-2.5 w-2.5">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></div>
            </div>
            <p className="text-white font-semibold text-sm">{count.toLocaleString()} <span className="text-gray-400 font-normal">Online</span></p>
        </div>
    );
};


// --- OBRAZOVKY ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void; themeConfig: typeof themes[Theme] }> = ({ onLogin, themeConfig }) => {
  const [authMode, setAuthMode] = React.useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; code?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email je povinný.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Neplatný formát emailu.";
    }

    if (!password) {
      newErrors.password = "Heslo je povinné.";
    } else if (password.length < 6) {
      newErrors.password = "Heslo musí mít alespoň 6 znaků.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (authMode === 'login') {
        const storedHistory = localStorage.getItem('ludus_question_history');
        const questionHistory = storedHistory ? JSON.parse(storedHistory) : [];
        const storedLang = (localStorage.getItem('ludus_language') as Language) || 'cs';
        onLogin({ email, luduCoins: INITIAL_COINS, questionHistory, language: storedLang });
    } else {
        setAuthMode('verify');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length < 6) {
        setErrors({ code: "Kód musí mít 6 znaků." });
        return;
    }
    setErrors({});
    
    const storedHistory = localStorage.getItem('ludus_question_history');
    const questionHistory = storedHistory ? JSON.parse(storedHistory) : [];
    const storedLang = (localStorage.getItem('ludus_language') as Language) || 'cs';
    
    onLogin({ 
        email, 
        luduCoins: INITIAL_COINS + EMAIL_VERIFICATION_BONUS, 
        questionHistory,
        language: storedLang,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className={`text-7xl font-bold ${themeConfig.accentText} tracking-widest ${themeConfig.pulseAnimation}`}>LUDUS</h1>
        <p className="text-gray-400 text-xl mt-2">Aréna Vědomostí</p>
      </div>
      <div className={`w-full max-w-md bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} shadow-2xl ${themeConfig.accentShadow}`}>
        {authMode === 'verify' ? (
             <div>
                <h2 className={`text-3xl font-bold text-center mb-4 ${themeConfig.accentTextLight}`}>Ověření Účtu</h2>
                <p className="text-gray-400 text-center mb-6">Zadejte 6místný kód, který jsme vám zaslali na email. Jako odměnu získáte <span className="font-bold text-yellow-400">{EMAIL_VERIFICATION_BONUS}</span> LuduCoinů!</p>
                <form onSubmit={handleVerify} noValidate>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="code">Ověřovací Kód</label>
                        <input 
                          type="text" 
                          id="code" 
                          maxLength={6}
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value)}
                          className={`w-full p-3 bg-gray-700 rounded border text-center tracking-[0.5em] text-2xl ${errors.code ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 ${themeConfig.accentRing}`} 
                        />
                         {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>
                    <NeonButton type="submit" className="w-full" themeConfig={themeConfig}>Ověřit a Získat Bonus</NeonButton>
                </form>
             </div>
        ) : (
            <>
                <h2 className={`text-3xl font-bold text-center mb-6 ${themeConfig.accentTextLight}`}>{authMode === 'login' ? 'Přihlášení' : 'Registrace'}</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full p-3 bg-gray-700 rounded border ${errors.email ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 ${themeConfig.accentRing}`} 
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2" htmlFor="password">Heslo</label>
                    <input 
                      type="password" 
                      id="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full p-3 bg-gray-700 rounded border ${errors.password ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <NeonButton type="submit" className="w-full" themeConfig={themeConfig}>{authMode === 'login' ? 'Vstoupit do Arény' : 'Vytvořit Účet'}</NeonButton>
                </form>
                <p className="text-center mt-6 text-gray-500">
                  <button onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setErrors({}); // Clear errors when switching modes
                  }} className={`${themeConfig.accentText} hover:underline`}>
                    {authMode === 'login' ? "Potřebujete účet? Zaregistrujte se" : "Už máte účet? Přihlaste se"}
                  </button>
                </p>
            </>
        )}
      </div>
    </div>
  );
};

const LobbyScreen: React.FC<{ 
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    onNavigate: (screen: string) => void; 
    onGetFreeCoins: () => void; 
    onOpenThemeSelector: () => void;
    appMetadata: { name: string, description: string } | null;
    themeConfig: typeof themes[Theme];
}> = ({ user, setUser, onNavigate, onGetFreeCoins, onOpenThemeSelector, appMetadata, themeConfig }) => {
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

const OnlineLobbyScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onStartGame, onBack, themeConfig }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>Online Aréna</h1>
        <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-md space-y-4`}>
            <NeonButton onClick={() => onStartGame(2)} className="w-full h-16" themeConfig={themeConfig}>Rychlá Hra (1v1)</NeonButton>
            <NeonButton onClick={() => onStartGame(4)} className="w-full h-16" themeConfig={themeConfig}>Vytvořit Hru (1v1v1v1)</NeonButton>
            <NeonButton variant="secondary" onClick={onBack} className="w-full mt-4" themeConfig={themeConfig}>Zpět</NeonButton>
        </div>
    </div>
);

const FindingMatchScreen: React.FC<{ playerCount: number; onMatchFound: () => void; themeConfig: typeof themes[Theme] }> = ({ playerCount, onMatchFound, themeConfig }) => {
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


const AdRewardModal: React.FC<{ onClaim: () => void; themeConfig: typeof themes[Theme] }> = ({ onClaim, themeConfig }) => (
    <Modal isOpen={true} themeConfig={themeConfig}>
        <div className="text-center">
            <h2 className={`text-3xl font-bold ${themeConfig.accentTextLight} mb-4`}>Sledujete Reklamu</h2>
            <div className="bg-gray-700 h-48 flex items-center justify-center rounded-lg mb-6">
                <p className="text-gray-400">Video se přehrává...</p>
            </div>
            <NeonButton onClick={onClaim} themeConfig={themeConfig}>
                Získat <span className="font-bold text-yellow-300">{AD_REWARD_COINS}</span> <LuduCoin className="w-8 h-8" themeConfig={themeConfig}/>
            </NeonButton>
        </div>
    </Modal>
);

const GameSetupScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onStartGame, onBack, themeConfig }) => {
    const [playerCount, setPlayerCount] = React.useState<number>(2);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
             <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>Vytvořit Lokální Hru</h1>
             <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-md`}>
                 <div className="mb-6">
                     <label className="block text-xl text-gray-300 mb-3">Herní Mód: Všichni proti všem</label>
                     <p className="text-gray-500">Týmové módy již brzy!</p>
                 </div>
                 <div className="mb-8">
                     <label htmlFor="playerCount" className="block text-xl text-gray-300 mb-3">Počet Hráčů</label>
                     <select id="playerCount" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))} className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}>
                         <option value="2">2 Hráči</option>
                         <option value="4">4 Hráči</option>
                     </select>
                 </div>
                 <div className="flex justify-between items-center">
                    <NeonButton variant="secondary" onClick={onBack} themeConfig={themeConfig}>Zpět do Lobby</NeonButton>
                    <NeonButton onClick={() => onStartGame(playerCount)} themeConfig={themeConfig}>Začít Hru</NeonButton>
                 </div>
             </div>
        </div>
    );
};

const RulesScreen: React.FC<{ onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onBack, themeConfig }) => {
    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8 text-center`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>Pravidla Hry</h1>
                <div className={`space-y-6 bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder}`}>
                    <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Souboje & Rozstřel</h2>
                        <p className="text-gray-400">Při útoku na soupeřovo území odpovídá útočník i obránce. Pokud oba odpoví správně, nastává "Rozstřel" - nová otázka bez možností, kde se odpověď musí napsat. Kdo odpoví správně, vyhrává.</p>
                    </div>
                     <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Systém Životů (HP) a Opravy</h2>
                        <p className="text-gray-400">Normální území má 1 HP. Hráčské základny mají 3 HP. Pokud je vaše základna poškozená (má méně než 3 HP), můžete během svého útoku kliknout na ni a při správné odpovědi si opravit 1 HP.</p>
                    </div>
                    <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Fáze 1: Zabírání území (3 kola)</h2>
                        <p className="text-gray-400">Všichni hráči si současně vybírají neutrální pole. Odpovězte správně, abyste pole zabrali a získali 100 bodů. Po této fázi na mapě nezbudou žádná volná pole.</p>
                    </div>
                     <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Vyřazení ze hry</h2>
                        <p className="text-gray-400">Hráč je vyřazen, pokud jeho základna ztratí poslední život (HP), nebo pokud jeho skóre klesne pod nulu.</p>
                    </div>
                </div>
                 <div className="text-center mt-8">
                    <NeonButton onClick={onBack} themeConfig={themeConfig}>Zpět do Lobby</NeonButton>
                 </div>
            </div>
        </div>
    );
};

const GameOverScreen: React.FC<{ gameState: GameState; onBackToLobby: () => void; themeConfig: typeof themes[Theme] }> = ({ gameState, onBackToLobby, themeConfig }) => {
    const { winners } = gameState;
    const humanPlayer = gameState.players.find(p => !p.isBot);
    const humanIsWinner = humanPlayer && winners?.some(w => w.id === humanPlayer.id);
    const winBonus = humanIsWinner ? (gameState.players.length - 1) * WIN_COINS_PER_PLAYER : 0;

    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            <div className="text-center">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-4 animate-text-focus-in`}>Hra Skončila!</h1>
                {winners && winners.length > 0 ? (
                    <>
                        <h2 className="text-3xl text-yellow-400 mb-2">Vítěz: {winners.map(w => w.name).join(', ')}</h2>
                        <p className="text-xl text-gray-300 mb-6">Konečné skóre: {winners[0].score.toLocaleString()} bodů</p>
                    </>
                ) : (
                    <p className="text-2xl text-gray-400 mb-6">Hra skončila remízou.</p>
                )}
                
                {humanIsWinner && (
                    <div className="my-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg inline-block">
                        <p className="text-yellow-300 font-bold text-lg">Bonus za vítězství: +{winBonus.toLocaleString()} <LuduCoin className="w-6 h-6 inline-block" themeConfig={themeConfig} /></p>
                    </div>
                )}
                
                <h3 className={`text-xl ${themeConfig.accentTextLight} mb-3 border-t border-gray-700 pt-4`}>Konečné pořadí:</h3>
                <div className="space-y-2 max-w-sm mx-auto">
                    {[...gameState.players].sort((a,b) => b.score - a.score).map((p, index) => (
                         <div key={p.id} className={`flex justify-between p-2 rounded ${winners?.some(w => w.id === p.id) ? 'bg-yellow-500/20' : 'bg-gray-700/50'}`}>
                            <span className={`font-bold text-${p.color}-400`}>{index + 1}. {p.name}</span>
                            <span className="text-white">{p.score.toLocaleString()} bodů</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <NeonButton onClick={onBackToLobby} themeConfig={themeConfig}>Zpět do Lobby</NeonButton>
                </div>
            </div>
        </Modal>
    );
};

// --- HERNÍ KOMPONENTY ---
const PlayerStatusUI: React.FC<{ players: Player[], currentPlayerId: string, board: Field[], themeConfig: typeof themes[Theme] }> = ({ players, currentPlayerId, board, themeConfig }) => {
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            {players.map(p => {
                const base = board.find(f => f.type === FieldType.PlayerBase && f.ownerId === p.id);
                return (
                    <div key={p.id} className={`p-3 rounded-lg border-2 transition-all duration-300 ${p.isEliminated ? 'border-gray-800 bg-black/30 opacity-60' : (currentPlayerId === p.id ? `border-${p.color}-400 shadow-[0_0_15px_rgba(var(--tw-color-${p.color}-500-rgb),0.6)]` : `border-gray-700`)}`}>
                        <h3 className={`font-bold text-lg truncate ${p.isEliminated ? `text-gray-600 line-through` : `text-${p.color}-400`}`}>{p.name}</h3>
                        {p.isEliminated ? (
                             <p className="text-red-500 font-bold text-xl">VYŘAZEN</p>
                        ) : (
                            <>
                             <p className="text-white text-xl">{p.score.toLocaleString()} bodů</p>
                             <div className="flex items-center gap-1 mt-1">
                                <LuduCoin className="w-5 h-5" themeConfig={themeConfig} />
                                <p className="text-yellow-400 text-sm font-semibold">{p.coins.toLocaleString()}</p>
                             </div>
                             {base && <p className={`text-rose-400 font-bold text-md`}>❤️ {base.hp}/{base.maxHp}</p>}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const getAttackers = (players: Player[]): Player[] => {
    const activePlayers = players.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) return [];
    
    const sortedPlayers = [...activePlayers].sort((a, b) => a.score - b.score);
    const attackerCount = Math.max(1, Math.floor(sortedPlayers.length / 2));
    
    return sortedPlayers.slice(0, attackerCount);
};

const AttackOrderUI: React.FC<{ attackers: Player[], currentPlayerId: string, themeConfig: typeof themes[Theme] }> = ({ attackers, currentPlayerId, themeConfig }) => {
    if (attackers.length === 0) return null;
    return (
        <div>
            <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4 mt-6`}>Pořadí útoků</h2>
            <div className="space-y-2">
                {attackers.map((attacker, index) => (
                    <div key={attacker.id} className={`p-2 rounded-md transition-all duration-300 ${attacker.id === currentPlayerId ? 'bg-cyan-500/20' : 'bg-gray-800'}`}>
                        <p className={`text-lg text-${attacker.color}-400`}>
                            {index + 1}. {attacker.name} {attacker.id === currentPlayerId && <span className="text-xs text-white">(Na tahu)</span>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const HexagonalGameBoard: React.FC<{
    board: Field[],
    players: Player[],
    onFieldClick: (fieldId: number) => void,
    gamePhase: GamePhase,
    currentPlayerId: string, // Human player ID
    currentTurnPlayerId: string,
    phase1Selections?: Record<string, number | null>,
    rotation: number,
    onRotate: (direction: 'left' | 'right') => void,
    themeConfig: typeof themes[Theme],
}> = ({ board, players, onFieldClick, gamePhase, currentPlayerId, currentTurnPlayerId, phase1Selections = {}, rotation, onRotate, themeConfig }) => {
    const hexSize = 50;
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexHeight = 2 * hexSize;

    const getHexPosition = (q: number, r: number) => {
        const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
        const y = hexSize * (3 / 2 * r);
        return { x, y };
    };
    
    const hexPoints = (size: number) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i - 30);
            points.push(`${size * Math.cos(angle)},${size * Math.sin(angle)}`);
        }
        return points.join(' ');
    };
    
    const allFields = board.filter(f => f.type !== FieldType.Empty);
    if(allFields.length === 0) return null;

    const positions = allFields.map(f => getHexPosition(f.q, f.r));
    const minX = Math.min(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxX = Math.max(...positions.map(p => p.x));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const viewBoxWidth = maxX - minX + hexWidth * 1.5;
    const viewBoxHeight = maxY - minY + hexHeight * 1.5;

    const attackers = gamePhase === GamePhase.Phase2_Attacks ? getAttackers(players) : [];
    const isHumanPlayerAttacker = attackers.some(p => p.id === currentPlayerId);
    const isHumanTurn = currentTurnPlayerId === currentPlayerId;

    const getFieldStyle = (field: Field) => {
        const owner = players.find(p => p.id === field.ownerId);
        const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : '#4b5563'; // gray-600
        let fill = 'rgba(75, 85, 99, 0.3)';
        let stroke = '#4b5563';
        let strokeWidth = 2;
        let cursor = 'default';
        let filter = '';
        let isDisabled = false;
        
        const playerBase = board.find(f => f.ownerId === currentPlayerId && f.type === FieldType.PlayerBase);
        const canHeal = playerBase && playerBase.hp < playerBase.maxHp && field.id === playerBase.id;

        if (field.ownerId) {
            fill = `${ownerColor}80`; // 50% opacity
            stroke = ownerColor;
        } else if (field.type === FieldType.Black) {
            fill = '#000000';
            stroke = '#4b5563';
        }

        if (gamePhase === GamePhase.Phase1_LandGrab) {
            const selectedFieldIds = Object.values(phase1Selections).filter(id => id !== null);
            isDisabled = selectedFieldIds.includes(field.id) || !!field.ownerId || field.type === FieldType.Black;
            if (!isDisabled && field.type === FieldType.Neutral) {
                cursor = 'pointer';
                filter = `drop-shadow(0 0 5px ${PLAYER_COLOR_HEX.cyan})`;
            }
        } else if (gamePhase === GamePhase.Phase2_Attacks && isHumanPlayerAttacker && isHumanTurn) {
            const isOwnField = field.ownerId === currentPlayerId;
            if (canHeal) {
                cursor = 'pointer';
                stroke = '#22c55e'; // green-500
                strokeWidth = 4;
                filter = 'url(#glow-green)';
                isDisabled = false;
            } else if (!isOwnField && field.type !== FieldType.Neutral) {
                cursor = 'pointer';
                stroke = '#ef4444'; // red-500
                strokeWidth = 4;
                filter = 'url(#glow-red)';
                isDisabled = false;
            } else {
                isDisabled = true;
            }
        } else {
            isDisabled = true;
        }

        return { fill, stroke, strokeWidth, cursor, filter, isDisabled };
    };

    return (
        <div className="relative flex-grow flex items-center justify-center p-4 overflow-auto">
            <svg viewBox={`${minX - hexWidth} ${minY - hexHeight/1.5} ${viewBoxWidth} ${viewBoxHeight}`} className="max-w-full max-h-full" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s ease-in-out' }}>
                <defs>
                    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" />
                    </filter>
                     <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#22c55e" />
                    </filter>
                </defs>
                {allFields.map(field => {
                    const { x, y } = getHexPosition(field.q, field.r);
                    const { fill, stroke, strokeWidth, cursor, filter, isDisabled } = getFieldStyle(field);
                    return (
                        <g key={field.id} transform={`translate(${x}, ${y})`} onClick={() => !isDisabled && onFieldClick(field.id)} style={{ cursor }}>
                            <polygon points={hexPoints(hexSize * 0.95)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={{ transition: 'all 0.2s ease-in-out' }} filter={filter} />
                            {field.type === FieldType.PlayerBase && (
                                <g transform={`rotate(${-rotation})`}>
                                    <text textAnchor="middle" y={-5} fontSize="30" fill="white" style={{pointerEvents: 'none'}}>★</text>
                                    <text textAnchor="middle" y={25} fontSize="20" fill="white" fontWeight="bold" style={{pointerEvents: 'none'}}>❤️ {field.hp}</text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <button 
                    onClick={() => onRotate('left')} 
                    className={`bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} rounded-full h-12 w-12 flex items-center justify-center ${themeConfig.accentText} hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                    aria-label="Otočit doleva"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8.5a6.5 6.5 0 100-13H11" />
                    </svg>
                </button>
                <button 
                    onClick={() => onRotate('right')} 
                    className={`bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} rounded-full h-12 w-12 flex items-center justify-center ${themeConfig.accentText} hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                    aria-label="Otočit doprava"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H4.5a6.5 6.5 0 100 13H13" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const TimerUI: React.FC<{ startTime: number, timeLimit: number, onTimeout: () => void, themeConfig: typeof themes[Theme] }> = ({ startTime, timeLimit, onTimeout, themeConfig }) => {
    const [timeLeft, setTimeLeft] = React.useState(timeLimit);
    const intervalRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        const updateTimer = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, timeLimit - elapsed);
            setTimeLeft(remaining);
            if (remaining === 0) {
                onTimeout();
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(updateTimer, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTime, timeLimit, onTimeout]);
    
    const circumference = 2 * Math.PI * 20; // 2 * pi * radius
    const strokeDashoffset = circumference - (timeLeft / timeLimit) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 44 44">
                <circle className="text-gray-600" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="22" cy="22" />
                <circle
                    className={themeConfig.accentText.replace('text-','')}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="22"
                    cy="22"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>
            <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-lg font-bold">
                {Math.ceil(timeLeft)}
            </span>
        </div>
    );
};

const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const QuestionModal: React.FC<{
    activeQuestion: GameState['activeQuestion'];
    onAnswer: (answer: string) => void;
    onUseHint: () => void;
    onTimeout: () => void;
    loading: boolean;
    humanPlayer: Player;
    themeConfig: typeof themes[Theme];
}> = ({ activeQuestion, onAnswer, onUseHint, onTimeout, loading, humanPlayer, themeConfig }) => {
    const [writtenAnswer, setWrittenAnswer] = React.useState("");
    
    React.useEffect(() => {
        setWrittenAnswer(""); // Reset on new question
    }, [activeQuestion?.question.question]);

    const canAffordHint = humanPlayer.coins >= HINT_COSTS.AUTO_ANSWER;
    const isAnswering = activeQuestion && activeQuestion.playerAnswers[humanPlayer.id] === null;
    const isHealing = activeQuestion?.actionType === 'HEAL';
    const isTieBreaker = activeQuestion?.isTieBreaker;
    const questionType = activeQuestion?.questionType;

    const handleSubmitWrittenAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (writtenAnswer.trim()) {
            onAnswer(writtenAnswer.trim());
        }
    };

    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Spinner themeConfig={themeConfig} />
                    <p className={`mt-4 text-xl ${themeConfig.accentTextLight}`}>Zpracovávám otázku...</p>
                </div>
            ) : activeQuestion && (
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`${themeConfig.accentText} text-sm mb-2`}>{isTieBreaker ? 'ROZSTŘEL!' : (isHealing ? 'Opravujete Základnu' : 'Otázka')}</p>
                            <h2 className="text-2xl font-bold">{activeQuestion.question.question}</h2>
                        </div>
                        {isAnswering && <TimerUI startTime={activeQuestion.startTime} timeLimit={ANSWER_TIME_LIMIT} onTimeout={onTimeout} themeConfig={themeConfig} />}
                    </div>
                    {questionType === 'MULTIPLE_CHOICE' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeQuestion.question.options?.map(option => (
                                <button
                                    key={option}
                                    onClick={() => onAnswer(option)}
                                    disabled={!isAnswering}
                                    className={`p-4 bg-gray-700 rounded-md text-left text-lg hover:bg-cyan-600 transition-colors duration-200 border border-transparent hover:${themeConfig.accentBorderOpaque} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                    {questionType === 'OPEN_ENDED' && (
                        <form onSubmit={handleSubmitWrittenAnswer}>
                            <input
                                type="text"
                                value={writtenAnswer}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                disabled={!isAnswering}
                                autoFocus
                                className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-lg focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                                placeholder="Napište odpověď..."
                            />
                             <div className="text-right mt-4">
                                <NeonButton type="submit" disabled={!isAnswering || !writtenAnswer.trim()} themeConfig={themeConfig}>Odeslat</NeonButton>
                             </div>
                        </form>
                    )}
                     {isAnswering && questionType === 'MULTIPLE_CHOICE' && (
                        <div className="mt-6 border-t border-gray-700 pt-4 flex justify-end">
                            <NeonButton 
                                variant="secondary" 
                                onClick={onUseHint}
                                disabled={!canAffordHint}
                                title={!canAffordHint ? "Nedostatek mincí" : ""}
                                themeConfig={themeConfig}
                            >
                                Jistota ({HINT_COSTS.AUTO_ANSWER}) <LuduCoin className="w-5 h-5" themeConfig={themeConfig}/>
                            </NeonButton>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

const SpectatorQuestionModal: React.FC<{ activeQuestion: GameState['activeQuestion'] | null; themeConfig: typeof themes[Theme] }> = ({ activeQuestion, themeConfig }) => {
    if (!activeQuestion) return null;
    const { question, questionType } = activeQuestion;
    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
             <div>
                <p className={`${themeConfig.accentText} text-sm mb-2`}>Soupeř odpovídá...</p>
                <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
                {questionType === 'MULTIPLE_CHOICE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                        {question.options?.map(option => (
                            <div key={option} className="p-4 bg-gray-700 rounded-md text-left text-lg">
                                {option}
                            </div>
                        ))}
                    </div>
                )}
                 {questionType === 'OPEN_ENDED' && (
                    <div className="p-4 bg-gray-700 rounded-md text-left text-lg opacity-70">
                        Odpověď se píše...
                    </div>
                )}
            </div>
        </Modal>
    );
};

const AnswerFeedbackModal: React.FC<{ result: GameState['answerResult'] | null; themeConfig: typeof themes[Theme] }> = ({ result, themeConfig }) => {
    if (!result) return null;
    const { isCorrect, correctAnswer } = result;
    const animationClass = isCorrect ? 'animate-flash-green' : 'animate-shake';
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in`}>
            <div className={`p-8 rounded-lg text-center w-full max-w-md border-4 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'} ${animationClass}`}>
                <h2 className={`text-5xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? "Správně!" : "Špatně!"}
                </h2>
                {!isCorrect && (
                    <p className="text-xl text-gray-300">Správná odpověď byla: <span className={`font-bold ${themeConfig.accentTextLight}`}>{correctAnswer}</span></p>
                )}
            </div>
        </div>
    );
};

const EliminationFeedbackModal: React.FC<{ result: GameState['eliminationResult'] | null; themeConfig: typeof themes[Theme] }> = ({ result, themeConfig }) => {
    if (!result) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-8 rounded-lg text-center w-full max-w-lg border-4 border-rose-600 bg-rose-900/50">
                <h2 className="text-5xl font-bold mb-4 text-rose-400 animate-text-focus-in">VYŘAZEN!</h2>
                <p className="text-2xl text-gray-200">
                    <span className={`font-bold ${themeConfig.accentText}`}>{result.attackerName}</span> vyřadil hráče <span className="font-bold text-red-500">{result.eliminatedPlayerName}</span>!
                </p>
            </div>
        </div>
    );
};


const CategorySelectionModal: React.FC<{
    isOpen: boolean;
    availableCategories: Category[];
    onSelect: (category: Category) => void;
    onClose: () => void;
    isBaseAttack: boolean;
    themeConfig: typeof themes[Theme];
}> = ({ isOpen, availableCategories, onSelect, onClose, isBaseAttack, themeConfig }) => {
    if (!isOpen) return null;
    
    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            <div>
                <h2 className={`text-2xl font-bold mb-6 ${themeConfig.accentTextLight}`}>Zvolte kategorii útoku</h2>
                {isBaseAttack ? (
                     <p className="text-gray-300 text-center text-lg">Útočíte na základnu. Kategorie je dána.</p>
                ): (
                    availableCategories.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => onSelect(category)}
                                    className="p-4 bg-gray-700 rounded-md text-lg hover:bg-cyan-600 transition-colors duration-200"
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-400 text-center">Nemáte k dispozici žádné další kategorie pro útok.</p>
                    )
                )}
                 <div className="text-center mt-6">
                   {isBaseAttack ? 
                        <NeonButton onClick={() => onSelect(availableCategories[0])} themeConfig={themeConfig}>Potvrdit Útok</NeonButton> :
                        <NeonButton variant="secondary" onClick={onClose} themeConfig={themeConfig}>Zrušit útok</NeonButton>
                   }
                 </div>
            </div>
        </Modal>
    );
};


// --- HLAVNÍ KOMPONENTA APLIKACE ---

export default function App() {
  const [screen, setScreen] = React.useState<'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME'>('AUTH');
  const [user, setUser] = React.useState<User | null>(null);
  const [gameState, setGameState] = React.useState<GameState | null>(null);
  const [isProcessingQuestion, setIsProcessingQuestion] = React.useState(false);
  const [attackTarget, setAttackTarget] = React.useState<{ targetFieldId: number; defenderId?: string; isBaseAttack: boolean; } | null>(null);
  const [gameTime, setGameTime] = React.useState(0);
  const [isAdModalOpen, setIsAdModalOpen] = React.useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [onlinePlayerCount, setOnlinePlayerCount] = React.useState(2);
  const [appMetadata, setAppMetadata] = React.useState<{name: string, description: string} | null>(null);
  const [boardRotation, setBoardRotation] = React.useState(0);
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('ludus_theme') as Theme) || 'default');
  
  const themeConfig = themes[theme];

  const gameLogicTimeoutRef = React.useRef<number | null>(null);
  const botTurnTimeoutRef = React.useRef<number | null>(null);
  
  React.useEffect(() => {
    fetch('/metadata.json')
        .then(res => res.json())
        .then(data => setAppMetadata(data))
        .catch(err => console.error("Failed to load metadata:", err));
  }, []);

  React.useEffect(() => {
    localStorage.setItem('ludus_theme', theme);
    document.body.className = '';
    document.body.classList.add(themeConfig.background);
  }, [theme, themeConfig]);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (gameState && gameState.gamePhase !== GamePhase.GameOver) {
        setGameTime(Date.now() - gameState.gameStartTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setScreen('LOBBY');
  };
  
  const handleNavigate = (targetScreen: string) => {
    setScreen(targetScreen as any);
  };
  
  const handleRotateBoard = (direction: 'left' | 'right') => {
    const angle = direction === 'left' ? 60 : -60;
    setBoardRotation(prev => (prev + angle + 360) % 360);
  };

  const createInitialGameState = (playerCount: number, isOnlineMode: boolean = false): GameState => {
      const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
          const isBot = i !== 0;
          return {
              id: `player-${i+1}`,
              name: isBot ? (isOnlineMode ? BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)] : `Bot ${i}`) : 'Vy',
              color: PLAYER_COLORS[i % PLAYER_COLORS.length],
              score: 0,
              coins: i === 0 ? user?.luduCoins || INITIAL_COINS : 1000,
              isBot: isBot,
              mainBaseCategory: CATEGORIES[i % CATEGORIES.length],
              usedAttackCategories: [],
              finalPoints: 0,
              isEliminated: false,
          }
      });
      
      const radius = playerCount <= 2 ? 1 : 2;
      let board: Field[] = [];
      let fieldIdCounter = 0;

      for (let q = -radius; q <= radius; q++) {
        for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
            board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
        }
      }

      const basePositions = playerCount <= 2
        ? [{ q: 1, r: -1 }, { q: -1, r: 1 }]
        : [{ q: 2, r: 0 }, { q: -2, r: 0 }, { q: 1, r: -2 }, { q: -1, r: 2 }];

      const assignedBaseCoords = new Set<string>();

      players.forEach((player, i) => {
          const pos = basePositions[i];
          const coordKey = `${pos.q},${pos.r}`;
          const baseField = board.find(f => f.q === pos.q && f.r === pos.r)!;
          baseField.type = FieldType.PlayerBase;
          baseField.ownerId = player.id;
          baseField.category = player.mainBaseCategory;
          baseField.hp = BASE_HP;
          baseField.maxHp = BASE_HP;
          assignedBaseCoords.add(coordKey);
      });

      const neutralFields = board.filter(f => {
          const coordKey = `${f.q},${f.r}`;
          return !assignedBaseCoords.has(coordKey);
      });
      
      for (let i = neutralFields.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [neutralFields[i], neutralFields[j]] = [neutralFields[j], neutralFields[i]];
      }

      neutralFields.forEach((field, i) => {
          field.type = FieldType.Neutral;
          field.category = CATEGORIES[i % CATEGORIES.length];
          field.hp = FIELD_HP;
          field.maxHp = FIELD_HP;
      });
      
      return {
          players,
          board: board.filter(f => f.type !== FieldType.Empty),
          gamePhase: GamePhase.Phase1_LandGrab,
          currentTurnPlayerIndex: 0,
          round: 1,
          gameLog: [`Hra začala s ${playerCount} hráči.`],
          activeQuestion: null,
          winners: null,
          phase1Selections: {},
          gameStartTime: Date.now(),
          answerResult: null,
          eliminationResult: null,
          questionHistory: []
      };
  };

  const handleStartGame = (playerCount: number) => {
      setGameState(createInitialGameState(playerCount));
      setScreen('GAME');
  };

  const handleStartOnlineGame = (playerCount: number) => {
      setOnlinePlayerCount(playerCount);
      setScreen('FINDING_MATCH');
  };
  
    const advanceGameState = (state: GameState) => {
        setGameState(prev => {
            if (!prev) return null;
            return { ...prev, ...state };
        });
    }

  const resolvePhase1Round = (currentState: GameState, humanPlayerId: string, humanActionResult: 'win' | 'loss', fieldId: number) => {
    let newState = JSON.parse(JSON.stringify(currentState));
    const humanPlayerIndex = newState.players.findIndex((p: Player) => p.id === humanPlayerId);
    const fieldIndex = newState.board.findIndex((f: Field) => f.id === fieldId);

    if (humanActionResult === 'win') {
        newState.board[fieldIndex].ownerId = humanPlayerId;
        newState.players[humanPlayerIndex].score += POINTS.PHASE1_CLAIM;
        newState.gameLog.push(`${newState.players[humanPlayerIndex].name} jste zabral pole a získal ${POINTS.PHASE1_CLAIM} bodů.`);
    } else {
        newState.board[fieldIndex].type = FieldType.Black;
        newState.board[fieldIndex].hp = FIELD_HP;
        newState.board[fieldIndex].maxHp = FIELD_HP;
        newState.gameLog.push(`${newState.players[humanPlayerIndex].name} jste odpověděl špatně. Pole zčernalo.`);
    }

    const botSelections = Object.entries(newState.phase1Selections || {}).filter(([playerId]) => playerId !== humanPlayerId);
    
    for (const [botId, botFieldId] of botSelections) {
        if (botFieldId === null) continue;
        const botPlayerIndex = newState.players.findIndex((p: Player) => p.id === botId);
        const botFieldIndex = newState.board.findIndex((f: Field) => f.id === botFieldId);
        if (botFieldIndex !== -1 && newState.board[botFieldIndex].type === FieldType.Neutral && !newState.board[botFieldIndex].ownerId) {
             if (Math.random() < 0.7) {
                newState.board[botFieldIndex].ownerId = botId;
                newState.players[botPlayerIndex].score += POINTS.PHASE1_CLAIM;
                newState.gameLog.push(`${newState.players[botPlayerIndex].name} odpověděl správně a zabral pole.`);
             } else {
                newState.board[botFieldIndex].type = FieldType.Black;
                newState.gameLog.push(`${newState.players[botPlayerIndex].name} odpověděl špatně.`);
             }
        }
    }

    newState.round += 1;
    if (newState.round > PHASE_DURATIONS.PHASE1_ROUNDS) {
        newState.gamePhase = GamePhase.Phase2_Attacks;
        newState.round = 1;
        const attackers = getAttackers(newState.players);
        if (attackers.length > 0) {
            const firstAttackerIndex = newState.players.findIndex((p:Player) => p.id === attackers[0].id);
            newState.currentTurnPlayerIndex = firstAttackerIndex;
        }
        newState.gameLog.push("--- Fáze 2: Útoky začaly! ---");
    }

    newState.activeQuestion = null;
    newState.phase1Selections = {};
    advanceGameState(newState);
  }

  const handleFieldClick = async (fieldId: number) => {
    if (!gameState || isProcessingQuestion || gameState.activeQuestion || !user) return;
    
    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    const field = gameState.board.find(f => f.id === fieldId)!;
    
    if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
        if (gameState.phase1Selections?.[humanPlayer.id] != null || Object.values(gameState.phase1Selections || {}).includes(fieldId)) return;
        if (field.type === FieldType.Neutral && !field.ownerId) {
            setGameState(prev => prev ? { ...prev, phase1Selections: {...prev.phase1Selections, [humanPlayer.id]: fieldId} } : null);
            setIsProcessingQuestion(true);
            const question = await generateQuestion(field.category!, gameState.questionHistory, user.language);
            setIsProcessingQuestion(false);
            if (question) {
                setGameState(prev => {
                    if(!prev) return null;
                    const newHistory = [...(user?.questionHistory || []), question.question];
                    setUser(u => u ? {...u, questionHistory: newHistory} : null);
                    localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));
                    return { ...prev, 
                        questionHistory: [...prev.questionHistory, question.question],
                        activeQuestion: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: humanPlayer.id, isBaseAttack: false, isTieBreaker: false, playerAnswers: { [humanPlayer.id]: null }, startTime: Date.now(), actionType: 'ATTACK' } 
                    }
                });
            }
        }
    } else if (gameState.gamePhase === GamePhase.Phase2_Attacks) {
        const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
        if (currentPlayer.isBot || currentPlayer.id !== humanPlayer.id || !getAttackers(gameState.players).some(p => p.id === currentPlayer.id)) return;

        if (field.ownerId === currentPlayer.id && field.type === FieldType.PlayerBase && field.hp < field.maxHp) {
             setIsProcessingQuestion(true);
             const question = await generateQuestion(field.category!, gameState.questionHistory, user.language);
             setIsProcessingQuestion(false);
             if (question) {
                setGameState(prev => {
                    if(!prev) return null;
                     const newHistory = [...(user?.questionHistory || []), question.question];
                     setUser(u => u ? {...u, questionHistory: newHistory} : null);
                     localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));
                     return { ...prev, 
                         questionHistory: [...prev.questionHistory, question.question],
                         activeQuestion: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayer.id, isBaseAttack: false, isTieBreaker: false, actionType: 'HEAL', playerAnswers: { [currentPlayer.id]: null }, startTime: Date.now() } 
                     };
                });
             }
             return;
        }

        if (field.type === FieldType.Black) {
            setIsProcessingQuestion(true);
            const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const question = await generateQuestion(randomCategory, gameState.questionHistory, user.language);
            setIsProcessingQuestion(false);
            if (question) {
                setGameState(prev => {
                    if(!prev) return null;
                    const newHistory = [...(user?.questionHistory || []), question.question];
                    setUser(u => u ? {...u, questionHistory: newHistory} : null);
                    localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));
                    return { ...prev, 
                        questionHistory: [...prev.questionHistory, question.question],
                        activeQuestion: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId: fieldId, attackerId: currentPlayer.id, isBaseAttack: false, isTieBreaker: false, actionType: 'ATTACK', playerAnswers: { [currentPlayer.id]: null }, startTime: Date.now() } 
                    };
                });
            }
        } else if (field.ownerId && field.ownerId !== currentPlayer.id) {
            setAttackTarget({ targetFieldId: fieldId, defenderId: field.ownerId, isBaseAttack: field.type === FieldType.PlayerBase });
        }
    }
  };

  const handleCategorySelect = async (category: Category) => {
    if (!gameState || !attackTarget || !user) return;
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    
    setAttackTarget(null);
    setIsProcessingQuestion(true);
    const question = await generateQuestion(category, gameState.questionHistory, user.language);
    setIsProcessingQuestion(false);

    if (question) {
         setGameState(prev => {
            if (!prev) return null;
            const { targetFieldId, defenderId, isBaseAttack } = attackTarget;
            const players = isBaseAttack ? prev.players : prev.players.map(p => p.id === currentPlayer.id ? {...p, usedAttackCategories: [...p.usedAttackCategories, category]} : p);
            const playerAnswers: Record<string, null> = { [currentPlayer.id]: null };
            if (defenderId) playerAnswers[defenderId] = null;
            
            const newHistory = [...(user?.questionHistory || []), question.question];
            setUser(u => u ? {...u, questionHistory: newHistory} : null);
            localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));

            return { 
                ...prev, 
                players, 
                questionHistory: [...prev.questionHistory, question.question],
                activeQuestion: { question, questionType: 'MULTIPLE_CHOICE', targetFieldId, attackerId: currentPlayer.id, defenderId, isBaseAttack, isTieBreaker: false, playerAnswers, startTime: Date.now(), actionType: 'ATTACK' } 
            };
        });
    }
  };
  
    const finalizeTurnResolution = React.useCallback(async (initialState: GameState) => {
        let finalState = JSON.parse(JSON.stringify(initialState));
        if (!finalState.activeQuestion || !user) return;
        
        const { attackerId, defenderId, targetFieldId, playerAnswers, question, questionType, actionType, isBaseAttack } = finalState.activeQuestion;
        
        const attacker = finalState.players.find((p: Player) => p.id === attackerId);
        const field = finalState.board.find((f: Field) => f.id === targetFieldId);
        let elimination: { eliminatedPlayerName: string, attackerName: string } | null = null;
        
        const attackerAnswer = playerAnswers[attackerId];
        const isAttackerCorrect = normalizeAnswer(attackerAnswer || "") === normalizeAnswer(question.correctAnswer);
        
        if (defenderId) {
            const defenderAnswer = playerAnswers[defenderId];
            const isDefenderCorrect = normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer);
            
            if (isAttackerCorrect && isDefenderCorrect && !isBaseAttack && !finalState.activeQuestion.isTieBreaker) {
                const defender = finalState.players.find((p: Player) => p.id === defenderId);
                if (defender) finalState.gameLog.push(`ROZSTŘEL mezi ${attacker.name} a ${defender.name}!`);
                advanceGameState(finalState);
                
                setIsProcessingQuestion(true);
                // Tie-breaker is always in user's language or Czech for bot
                const langForTiebreaker = finalState.players.find((p: Player) => p.id === defender.id)?.isBot ? 'cs' : user.language;
                const tieBreakerQuestion = await generateOpenEndedQuestion(field.category, finalState.questionHistory, langForTiebreaker);
                setIsProcessingQuestion(false);
                
                if (tieBreakerQuestion) {
                    setGameState(prev => {
                       if (!prev || !prev.activeQuestion) return prev;
                       const newHistory = [...(user?.questionHistory || []), tieBreakerQuestion.question];
                       setUser(u => u ? { ...u, questionHistory: newHistory } : null);
                       localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));
                       return {
                           ...prev,
                           questionHistory: [...prev.questionHistory, tieBreakerQuestion.question],
                           activeQuestion: {
                               ...prev.activeQuestion,
                               question: tieBreakerQuestion,
                               questionType: 'OPEN_ENDED',
                               isTieBreaker: true,
                               playerAnswers: { [attackerId]: null, [defenderId]: null },
                               startTime: Date.now(),
                           }
                       };
                    });
                } else {
                    finalState.gameLog.push("Chyba při generování rozstřelu, kolo končí remízou.");
                }
                return;
            }
        }
        
        if (actionType === 'HEAL') {
            if (isAttackerCorrect) {
                field.hp = Math.min(field.maxHp, field.hp + 1);
                attacker.score += POINTS.HEAL_SUCCESS;
                finalState.gameLog.push(`${attacker.name} si úspěšně opravil základnu.`);
            } else {
                attacker.score += POINTS.HEAL_FAIL_PENALTY;
                finalState.gameLog.push(`${attacker.name} neuspěl při opravě.`);
            }
        } else if (actionType === 'ATTACK') {
             if (defenderId) {
                const defender = finalState.players.find((p: Player) => p.id === defenderId);
                const defenderAnswer = playerAnswers[defenderId];
                const isDefenderCorrect = normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer);
                
                if (isAttackerCorrect && (!isDefenderCorrect || isBaseAttack)) {
                    field.hp -= 1;
                    if (isBaseAttack) {
                        attacker.score += POINTS.ATTACK_DAMAGE;
                        finalState.gameLog.push(`${attacker.name} zasáhl základnu hráče ${defender.name}!`);
                    } else {
                        field.ownerId = attackerId;
                        field.hp = field.maxHp;
                        attacker.score += POINTS.ATTACK_WIN;
                        defender.score += POINTS.ATTACK_LOSS_DEFENDER;
                        finalState.gameLog.push(`${attacker.name} dobyl území od hráče ${defender.name}!`);
                    }
                } else if (!isAttackerCorrect && isDefenderCorrect) {
                    attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                    if (!isBaseAttack) defender.score += POINTS.ATTACK_WIN_DEFENDER;
                    finalState.gameLog.push(`${defender.name} ubránil své území.`);
                } else {
                    attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                    finalState.gameLog.push(`Útok hráče ${attacker.name} se nezdařil.`);
                }
                
                if (field.hp <= 0) {
                    field.ownerId = attackerId;
                    field.hp = field.maxHp;
                    if (isBaseAttack) {
                        attacker.score += POINTS.BASE_DESTROY_BONUS + Math.max(0, defender.score);
                        attacker.coins += ELIMINATION_COIN_BONUS;
                        defender.score = 0;
                        defender.isEliminated = true;
                        elimination = { eliminatedPlayerName: defender.name, attackerName: attacker.name };
                        finalState.gameLog.push(`${attacker.name} ZNIČIL základnu hráče ${defender.name}!`);
                        finalState.board.forEach((f: Field) => { if (f.ownerId === defender.id) f.ownerId = attacker.id; });
                    }
                }

            } else { // Attacking black field
                if (isAttackerCorrect) {
                    field.ownerId = attackerId;
                    field.type = FieldType.Neutral;
                    field.hp = field.maxHp;
                    attacker.score += POINTS.BLACK_FIELD_CLAIM;
                    finalState.gameLog.push(`${attacker.name} zabral černé území!`);
                } else {
                    attacker.score += POINTS.BLACK_FIELD_FAIL;
                    finalState.gameLog.push(`${attacker.name} neuspěl na černém území.`);
                }
            }
        }
        
        finalState.players.forEach((p: Player) => {
            const oldPlayer = initialState.players.find(op => op.id === p.id);
            if (p.score < 0 && oldPlayer && !oldPlayer.isEliminated) {
                p.isEliminated = true;
                elimination = { eliminatedPlayerName: p.name, attackerName: 'Záporné skóre' };
                finalState.gameLog.push(`${p.name} byl vyřazen kvůli záporným bodům!`);
                finalState.board.forEach((f: Field) => {
                    if (f.ownerId === p.id && f.type !== FieldType.PlayerBase) { f.ownerId = null; f.type = FieldType.Black; }
                });
            }
        });

        const activePlayers = finalState.players.filter((p: Player) => !p.isEliminated);
        if (activePlayers.length <= 1) {
            finalState.gamePhase = GamePhase.GameOver;
            finalState.winners = activePlayers;
        } else {
            const currentAttackers = getAttackers(finalState.players);
            const currentAttackerInListIndex = currentAttackers.findIndex(p => p.id === attackerId);
            
            if (currentAttackerInListIndex === -1 || currentAttackerInListIndex === currentAttackers.length - 1 || currentAttackers.length === 0) {
                finalState.round += 1;
                if (finalState.round > PHASE_DURATIONS.PHASE2_ROUNDS) {
                    finalState.gamePhase = GamePhase.GameOver;
                    const highestScore = Math.max(...activePlayers.map(p => p.score));
                    finalState.winners = activePlayers.filter(p => p.score === highestScore);
                } else {
                    const nextRoundAttackers = getAttackers(finalState.players);
                    if (nextRoundAttackers.length > 0) {
                        finalState.currentTurnPlayerIndex = finalState.players.findIndex((p: Player) => p.id === nextRoundAttackers[0].id);
                    } else {
                         finalState.gamePhase = GamePhase.GameOver;
                         finalState.winners = activePlayers;
                    }
                }
            } else {
                const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
                finalState.currentTurnPlayerIndex = finalState.players.findIndex((p: Player) => p.id === nextAttacker.id);
            }
        }
        
        finalState.activeQuestion = null;
        finalState.answerResult = null;
        if (elimination) finalState.eliminationResult = elimination;
        advanceGameState(finalState);

        if (elimination) {
            gameLogicTimeoutRef.current = window.setTimeout(() => {
                setGameState(s => s ? { ...s, eliminationResult: null } : null);
            }, 3000);
        }

    }, [user]);

  const handleAnswer = (answer: string) => {
    if (!gameState || !gameState.activeQuestion) return;
    if (gameLogicTimeoutRef.current) clearTimeout(gameLogicTimeoutRef.current);

    const { activeQuestion } = gameState;
    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    
    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(activeQuestion.question.correctAnswer);

    setGameState(prev => {
        if (!prev || !prev.activeQuestion) return prev;
        
        const updatedActiveQuestion = { ...prev.activeQuestion, playerAnswers: { ...prev.activeQuestion.playerAnswers, [humanPlayer.id]: answer } };
        const newStateWithFeedback = {
            ...prev,
            answerResult: { playerId: humanPlayer.id, isCorrect, correctAnswer: activeQuestion.question.correctAnswer },
            activeQuestion: updatedActiveQuestion
        };

        const allPlayersAnswered = Object.values(updatedActiveQuestion.playerAnswers).every(ans => ans !== null);

        if (allPlayersAnswered) {
            gameLogicTimeoutRef.current = window.setTimeout(() => {
                finalizeTurnResolution(newStateWithFeedback);
            }, 2000);
        }

        return newStateWithFeedback;
    });
  };

  const handleUseHint = () => {
      if (!gameState || !gameState.activeQuestion) return;
      const humanPlayer = gameState.players.find(p => !p.isBot)!;
      if (humanPlayer.coins >= HINT_COSTS.AUTO_ANSWER) {
          setGameState(prev => {
              if (!prev) return null;
              const newPlayers = prev.players.map(p => p.id === humanPlayer.id ? {...p, coins: p.coins - HINT_COSTS.AUTO_ANSWER} : p);
              return {...prev, players: newPlayers};
          });
          handleAnswer(gameState.activeQuestion.question.correctAnswer);
      }
  };
  
    const handleBackToLobby = () => {
        setGameState(null);
        setScreen('LOBBY');
    };

  React.useEffect(() => {
    if (gameState?.gamePhase === GamePhase.Phase1_LandGrab) {
        const humanSelection = gameState.phase1Selections?.[gameState.players.find(p => !p.isBot)!.id];
        const bots = gameState.players.filter(p => p.isBot);
        
        if (humanSelection && Object.keys(gameState.phase1Selections || {}).length < bots.length + 1) {
            const botSelections: Record<string, number> = {};
            const availableFields = gameState.board.filter(f => f.type === FieldType.Neutral && !f.ownerId && f.id !== humanSelection);
            
            bots.forEach(player => {
                if (availableFields.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableFields.length);
                    botSelections[player.id] = availableFields.splice(randomIndex, 1)[0].id;
                }
            });

            if (Object.keys(botSelections).length > 0) {
                setGameState(prev => prev ? { ...prev, phase1Selections: {...prev.phase1Selections, ...botSelections } } : null);
            }
        }
    }
  }, [gameState?.gamePhase, gameState?.phase1Selections, gameState?.players]);

    const passBotTurn = React.useCallback((currentState: GameState, reason: string) => {
        let newState = JSON.parse(JSON.stringify(currentState));
        const bot = newState.players[newState.currentTurnPlayerIndex];
        newState.gameLog.push(`${bot.name} (Bot) přeskakuje tah: ${reason}`);
        
        const currentAttackers = getAttackers(newState.players);
        const currentAttackerInListIndex = currentAttackers.findIndex(p => p.id === bot.id);
        if (currentAttackerInListIndex === -1 || currentAttackerInListIndex === currentAttackers.length - 1 || currentAttackers.length === 0) {
            newState.round += 1;
            const nextRoundAttackers = getAttackers(newState.players);
            if(nextRoundAttackers.length > 0) newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextRoundAttackers[0].id);
        } else {
             const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
            newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextAttacker.id);
        }
        advanceGameState(newState);
    }, []);

    const handleBotAttackTurn = React.useCallback(async (currentState: GameState) => {
        const currentPlayer = currentState.players[currentState.currentTurnPlayerIndex];
        const botBase = currentState.board.find(f => f.ownerId === currentPlayer.id && f.type === FieldType.PlayerBase);

        if (botBase && botBase.hp < botBase.maxHp && (botBase.hp === 1 || Math.random() < 0.5)) {
            const question = await generateQuestion(botBase.category!, currentState.questionHistory, 'cs');
            if(question) {
                let tempState = JSON.parse(JSON.stringify(currentState));
                tempState.questionHistory.push(question.question);
                tempState.activeQuestion = {
                    question, questionType: 'MULTIPLE_CHOICE', targetFieldId: botBase.id, attackerId: currentPlayer.id, actionType: 'HEAL', isBaseAttack: false, isTieBreaker: false, playerAnswers: { [currentPlayer.id]: Math.random() < 0.8 ? question.correctAnswer : "wrong" }, startTime: Date.now()
                };
                finalizeTurnResolution(tempState);
                return;
            }
        }
        
        const validTargets = currentState.board.filter(f => f.ownerId !== currentPlayer.id && f.type !== FieldType.Neutral);
        if (validTargets.length === 0) {
            passBotTurn(currentState, "Nebyly nalezeny žádné platné cíle.");
            return;
        }

        const targetField = validTargets[Math.floor(Math.random() * validTargets.length)];
        const isBaseAttack = targetField.type === FieldType.PlayerBase;
        const defender = currentState.players.find(p => p.id === targetField.ownerId);
        let category: Category;

        if (isBaseAttack) category = targetField.category!;
        else if (targetField.type === FieldType.Black) category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        else {
            const availableCategories = CATEGORIES.filter(c => !currentPlayer.usedAttackCategories.includes(c));
            if (availableCategories.length === 0) { passBotTurn(currentState, "Vyčerpány kategorie."); return; }
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        }

        const question = await generateQuestion(category, currentState.questionHistory, 'cs');
        if (!question) { passBotTurn(currentState, "Chyba při generování otázky."); return; }

        let newState = JSON.parse(JSON.stringify(currentState));
        if (!isBaseAttack && targetField.type !== FieldType.Black) newState.players.find((p: Player) => p.id === currentPlayer.id)!.usedAttackCategories.push(category);
        newState.questionHistory.push(question.question);
        
        newState.activeQuestion = {
            question, questionType: 'MULTIPLE_CHOICE', targetFieldId: targetField.id, attackerId: currentPlayer.id, defenderId: targetField.ownerId || undefined, isBaseAttack, isTieBreaker: false, playerAnswers: { [currentPlayer.id]: Math.random() < 0.7 ? question.correctAnswer : "wrong" }, startTime: Date.now(), actionType: 'ATTACK'
        };
        
        if (defender && !defender.isBot) {
            advanceGameState(newState);
        } else {
            if (defender && defender.isBot) {
                newState.activeQuestion.playerAnswers[defender.id] = Math.random() < 0.6 ? question.correctAnswer : "wrong_2";
            }
            finalizeTurnResolution(newState);
        }
    }, [passBotTurn, finalizeTurnResolution]);

    React.useEffect(() => {
        if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
        if (gameState?.gamePhase === GamePhase.Phase2_Attacks && !gameState.activeQuestion && !isProcessingQuestion && !gameState.answerResult && !gameState.eliminationResult) {
            const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            if (currentPlayer?.isBot && getAttackers(gameState.players).some(p => p.id === currentPlayer.id)) {
                botTurnTimeoutRef.current = window.setTimeout(() => handleBotAttackTurn(gameState), 2000);
            }
        }
        return () => { if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current); };
    }, [gameState, isProcessingQuestion, handleBotAttackTurn]);
    
    React.useEffect(() => {
        if (gameState?.gamePhase === GamePhase.GameOver && user) {
            const humanPlayer = gameState.players.find(p => !p.isBot);
            if (!humanPlayer) return;
            const isWinner = gameState.winners?.some(w => w.id === humanPlayer.id) ?? false;
            let finalCoins = humanPlayer.coins;
            if (isWinner) finalCoins += (gameState.players.length - 1) * WIN_COINS_PER_PLAYER;
            setUser({ ...user, luduCoins: finalCoins });
        }
    }, [gameState?.gamePhase, user]);

    const ThemeSelectionModal: React.FC<{
        isOpen: boolean; onClose: () => void; currentTheme: Theme; onSelectTheme: (theme: Theme) => void;
    }> = ({ isOpen, onClose, currentTheme, onSelectTheme }) => (
        <Modal isOpen={isOpen} themeConfig={themeConfig}>
            <div className="text-center">
                <h2 className={`text-3xl font-bold ${themeConfig.accentTextLight} mb-6`}>Zvolte Vizuální Téma</h2>
                <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(themes) as Theme[]).map(themeKey => {
                        const loopThemeConfig = themes[themeKey];
                        return (
                            <button
                                key={themeKey}
                                onClick={() => onSelectTheme(themeKey)}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${currentTheme === themeKey ? `${loopThemeConfig.accentBorderOpaque} ${loopThemeConfig.accentShadow.replace('/10','')}` : 'border-gray-600 hover:border-gray-500'}`}
                            >
                                <span className={`text-xl font-bold ${loopThemeConfig.accentText}`}>{loopThemeConfig.name}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-8">
                    <NeonButton onClick={onClose} variant="secondary" themeConfig={themeConfig}>Zavřít</NeonButton>
                </div>
            </div>
        </Modal>
    );

  const renderScreen = () => {
    switch (screen) {
      case 'AUTH':
        return <AuthScreen onLogin={handleLogin} themeConfig={themeConfig}/>;
      case 'LOBBY':
        if (!user) return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig} /></div>;
        return <LobbyScreen user={user} setUser={setUser} onNavigate={handleNavigate} onGetFreeCoins={() => setIsAdModalOpen(true)} onOpenThemeSelector={() => setIsThemeModalOpen(true)} appMetadata={appMetadata} themeConfig={themeConfig} />;
      case 'ONLINE_LOBBY':
          return <OnlineLobbyScreen onStartGame={handleStartOnlineGame} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'FINDING_MATCH':
          return <FindingMatchScreen playerCount={onlinePlayerCount} onMatchFound={() => {
              setGameState(createInitialGameState(onlinePlayerCount, true));
              setScreen('GAME');
          }} themeConfig={themeConfig} />;
      case 'GAME_SETUP':
        return <GameSetupScreen onStartGame={handleStartGame} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig}/>;
      case 'RULES':
        return <RulesScreen onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'GAME':
        if (!gameState) return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig} /></div>;
        
        const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        const isHumanAnswering = gameState.activeQuestion?.playerAnswers.hasOwnProperty(humanPlayer.id);

        const getHeaderText = () => {
            if (gameState.answerResult) return 'Vyhodnocuji...';
            if (isProcessingQuestion) return 'Načítám...';
            if (gameState.activeQuestion) {
                 if (isHumanAnswering && gameState.activeQuestion.playerAnswers[humanPlayer.id] === null) return 'Odpovězte na otázku!';
                 return 'Soupeř je na tahu...';
            }
            if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
                 if (gameState.phase1Selections?.[humanPlayer.id]) return 'Čekání na ostatní hráče...';
                 return `Kolo ${gameState.round}/${PHASE_DURATIONS.PHASE1_ROUNDS}: Vyberte si území`;
            }
            if (gameState.gamePhase === GamePhase.Phase2_Attacks && getAttackers(gameState.players).some(p => p.id === humanPlayer.id) && currentPlayer.id === humanPlayer.id) {
                return 'Jste na řadě s útokem!';
            }
            return <>Na tahu: <span className={`font-bold text-${currentPlayer?.color}-400`}>{currentPlayer?.name}</span></>;
        };
        
        const formatTime = (ms: number) => {
            const totalSeconds = Math.floor(ms / 1000);
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            return `${minutes}:${seconds}`;
        };

        const phaseName = gameState.gamePhase.replace(/PHASE_\d+_/,'').replace(/_/g, ' ');
        const attackers = getAttackers(gameState.players);
        
        return (
            <div className="min-h-screen flex flex-col">
                 {gameState.gamePhase === GamePhase.GameOver && <GameOverScreen gameState={gameState} onBackToLobby={handleBackToLobby} themeConfig={themeConfig} />}
                <header className={`bg-gray-800/50 p-4 border-b ${themeConfig.accentBorder}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className={`text-2xl font-bold ${themeConfig.accentText} capitalize`}>Fáze: {phaseName.toLowerCase()}</h1>
                            <p className="text-gray-400">Kolo: {gameState.round}</p>
                        </div>
                        <div className={`text-2xl font-mono ${themeConfig.accentTextLight}`}>{formatTime(gameTime)}</div>
                        <div className="text-right"><h2 className="text-xl">{getHeaderText()}</h2></div>
                    </div>
                </header>
                <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <div className="flex-grow md:w-2/3 lg:w-3/4 order-2 md:order-1 relative">
                        <HexagonalGameBoard 
                            board={gameState.board} players={gameState.players} onFieldClick={handleFieldClick} 
                            phase1Selections={gameState.phase1Selections} gamePhase={gameState.gamePhase}
                            currentPlayerId={humanPlayer.id} currentTurnPlayerId={currentPlayer.id}
                            rotation={boardRotation} onRotate={handleRotateBoard} themeConfig={themeConfig}
                        />
                    </div>
                    <aside className={`md:w-1/3 lg:w-1/4 bg-gray-900/50 p-4 border-t md:border-t-0 md:border-l ${themeConfig.accentBorder} order-1 md:order-2 overflow-y-auto`}>
                        <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4`}>Hráči</h2>
                        <PlayerStatusUI players={gameState.players} currentPlayerId={currentPlayer?.id} board={gameState.board} themeConfig={themeConfig} />
                        {gameState.gamePhase === GamePhase.Phase2_Attacks && <AttackOrderUI attackers={attackers} currentPlayerId={currentPlayer?.id} themeConfig={themeConfig} />}
                        <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4 mt-6`}>Záznam Hry</h2>
                        <div className="h-64 overflow-y-auto bg-gray-800 p-2 rounded-md">
                            {gameState.gameLog.slice().reverse().map((log, i) => <p key={i} className="text-sm text-gray-400 mb-1">{log}</p>)}
                        </div>
                    </aside>
                </main>
                
                {(isProcessingQuestion || (gameState.activeQuestion && isHumanAnswering)) && (
                     <QuestionModal activeQuestion={gameState.activeQuestion} onAnswer={handleAnswer} onTimeout={() => handleAnswer('timeout_wrong_answer')} loading={isProcessingQuestion} onUseHint={handleUseHint} humanPlayer={humanPlayer} themeConfig={themeConfig} />
                )}
                {gameState.activeQuestion && !isHumanAnswering && <SpectatorQuestionModal activeQuestion={gameState.activeQuestion} themeConfig={themeConfig} />}
                {attackTarget && (
                    <CategorySelectionModal 
                        isOpen={true}
                        availableCategories={CATEGORIES.filter(c => !currentPlayer?.usedAttackCategories.includes(c))}
                        isBaseAttack={attackTarget.isBaseAttack}
                        onSelect={async (category) => {
                            if(attackTarget.isBaseAttack) await handleCategorySelect(gameState.board.find(f => f.id === attackTarget.targetFieldId)!.category!);
                            else await handleCategorySelect(category);
                        }}
                        onClose={() => setAttackTarget(null)}
                        themeConfig={themeConfig}
                    />
                )}
                {gameState.answerResult && gameState.answerResult.playerId === humanPlayer.id && <AnswerFeedbackModal result={gameState.answerResult} themeConfig={themeConfig} />}
                {gameState.eliminationResult && <EliminationFeedbackModal result={gameState.eliminationResult} themeConfig={themeConfig} />}
            </div>
        );
      default:
        if (user) return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig}/></div>;
        return <AuthScreen onLogin={handleLogin} themeConfig={themeConfig} />;
    }
  };

  return (
    <div>
        <Analytics />
        {renderScreen()}
        {isThemeModalOpen && <ThemeSelectionModal 
            isOpen={isThemeModalOpen} 
            onClose={() => setIsThemeModalOpen(false)}
            currentTheme={theme}
            onSelectTheme={(selectedTheme) => {
                setTheme(selectedTheme);
                setIsThemeModalOpen(false);
            }}
        />}
        {isAdModalOpen && <AdRewardModal onClaim={() => {
            setUser(u => u ? {...u, luduCoins: u.luduCoins + AD_REWARD_COINS} : u);
            setIsAdModalOpen(false);
        }} themeConfig={themeConfig} />}
    </div>
  );
}