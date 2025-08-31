import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
// FIX: Import GamePhase to correctly type the game state reset.
import { User, Theme, GamePhase } from './types';
import { AD_REWARD_COINS, INITIAL_COINS } from './constants';
import { gameReducer } from './services/gameLogic';

// Import screen components
import { AuthScreen } from './components/screens/AuthScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { OnlineLobbyScreen } from './components/screens/OnlineLobbyScreen';
import { FindingMatchScreen } from './components/screens/FindingMatchScreen';
import { GameSetupScreen } from './components/screens/GameSetupScreen';
import { RulesScreen } from './components/screens/RulesScreen';
import { GameScreen } from './components/screens/GameScreen';

// Import UI components
import { AdRewardModal } from './components/game/AdRewardModal';
import { ThemeSelectionModal } from './components/game/ThemeSelectionModal';
import { Spinner } from './components/ui/Spinner';

export const themes: Record<Theme, {
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


export default function App() {
  const [screen, setScreen] = React.useState<'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME'>('AUTH');
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = React.useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [onlinePlayerCount, setOnlinePlayerCount] = React.useState(2);
  const [appMetadata, setAppMetadata] = React.useState<{name: string, description: string} | null>(null);
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('ludus_theme') as Theme) || 'default');
  
  const [gameState, dispatch] = React.useReducer(gameReducer, null);

  const themeConfig = themes[theme];

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

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setScreen('LOBBY');
  };
  
  const handleStartGame = (playerCount: number) => {
    if (user) {
        dispatch({ type: 'INITIALIZE_GAME', payload: { playerCount, user } });
        setScreen('GAME');
    }
  };

  const handleStartOnlineGame = (playerCount: number) => {
      setOnlinePlayerCount(playerCount);
      setScreen('FINDING_MATCH');
  };

  const handleBackToLobby = () => {
      // FIX: Use the GamePhase enum member instead of a string literal to match the type definition.
      dispatch({ type: 'SET_STATE', payload: { gamePhase: GamePhase.Setup }}); // Reset game state
      setScreen('LOBBY');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'AUTH':
        return <AuthScreen onLogin={handleLogin} themeConfig={themeConfig}/>;
      case 'LOBBY':
        if (!user) return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig} /></div>;
        return <LobbyScreen 
            user={user} 
            setUser={setUser} 
            onNavigate={(s) => setScreen(s as any)} 
            onGetFreeCoins={() => setIsAdModalOpen(true)} 
            onOpenThemeSelector={() => setIsThemeModalOpen(true)} 
            appMetadata={appMetadata} 
            themeConfig={themeConfig} 
        />;
      case 'ONLINE_LOBBY':
          return <OnlineLobbyScreen onStartGame={handleStartOnlineGame} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'FINDING_MATCH':
          return <FindingMatchScreen 
            playerCount={onlinePlayerCount} 
            onMatchFound={() => {
                if(user) {
                    dispatch({ type: 'INITIALIZE_GAME', payload: { playerCount: onlinePlayerCount, user, isOnlineMode: true } });
                    setScreen('GAME');
                }
            }} 
            themeConfig={themeConfig} 
          />;
      case 'GAME_SETUP':
        return <GameSetupScreen onStartGame={handleStartGame} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig}/>;
      case 'RULES':
        return <RulesScreen onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'GAME':
        if (!gameState || !user) return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig} /></div>;
        return <GameScreen 
            gameState={gameState}
            dispatch={dispatch}
            user={user}
            setUser={setUser}
            onBackToLobby={handleBackToLobby}
            themeConfig={themeConfig}
        />
      default:
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
            themes={themes}
        />}
        {isAdModalOpen && <AdRewardModal onClaim={() => {
            setUser(u => u ? {...u, luduCoins: u.luduCoins + AD_REWARD_COINS} : u);
            setIsAdModalOpen(false);
        }} themeConfig={themeConfig} />}
    </div>
  );
}