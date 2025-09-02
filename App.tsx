

import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { User, Theme, GamePhase } from './types';
import { AD_REWARD_COINS } from './constants';
import { gameReducer } from './services/gameLogic';
import { themes } from './themes';

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

// FIX: Hardcode metadata to resolve persistent module loading error
const appMetadata = {
  "name": "LUDUS: Knowledge Arena",
  "description": "A strategic online trivia game where players conquer territories by answering questions. Compete in various modes, climb the ranks, and prove your knowledge in sports, culture, science, and more.",
  "requestFramePermissions": []
};

export default function App() {
  const [screen, setScreen] = React.useState<'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME'>('AUTH');
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = React.useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [onlinePlayerCount, setOnlinePlayerCount] = React.useState(2);
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('ludus_theme') as Theme) || 'default');
  
  const [gameState, dispatch] = React.useReducer(gameReducer, null);

  const themeConfig = themes[theme];

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