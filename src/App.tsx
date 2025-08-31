import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { User, Theme, GamePhase } from './types';
import { gameReducer } from './services/gameLogic';
import appMetadata from './metadata.json';
import { themes } from './themes';
import * as userService from './services/userService';
// FIX: Import AD_REWARD_COINS constant to resolve reference error.
import { AD_REWARD_COINS } from './constants';

// Import screen components
import { AuthScreen } from './components/screens/AuthScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { OnlineLobbyScreen } from './components/screens/OnlineLobbyScreen';
import { FindingMatchScreen } from './components/screens/FindingMatchScreen';
import { GameSetupScreen } from './components/screens/GameSetupScreen';
import { RulesScreen } from './components/screens/RulesScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

// Import UI components
import { AdRewardModal } from './components/game/AdRewardModal';
import { ThemeSelectionModal } from './components/game/ThemeSelectionModal';
import { Spinner } from './components/ui/Spinner';

type Screen = 'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME' | 'PROFILE';

export default function App() {
  const [screen, setScreen] = React.useState<Screen>('AUTH');
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = React.useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [onlinePlayerCount, setOnlinePlayerCount] = React.useState(2);
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('ludus_theme') as Theme) || 'default');
  
  const [gameState, dispatch] = React.useReducer(gameReducer, null);

  const themeConfig = themes[theme];
  
  React.useEffect(() => {
    // Auto-login attempt
    const loggedInUser = userService.getLoggedInUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      setScreen('LOBBY');
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('ludus_theme', theme);
    // Safer way to handle background classes
    Object.values(themes).forEach(t => document.body.classList.remove(t.background));
    document.body.classList.add(themeConfig.background);
  }, [theme, themeConfig]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    userService.saveLoggedInUser(loggedInUser.email);
    setScreen('LOBBY');
  };
  
  const handleLogout = () => {
    userService.logoutUser();
    setUser(null);
    setScreen('AUTH');
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
      if (gameState?.players) {
        const humanPlayer = gameState.players.find(p => !p.isBot);
        if (humanPlayer && user) {
            const updatedUser = userService.loadUserData(user.email);
            if(updatedUser) setUser(updatedUser);
        }
      }
      dispatch({ type: 'SET_STATE', payload: { gamePhase: GamePhase.Setup }});
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
            // FIX: The onNavigate prop expects a function that takes a string, but setScreen takes a specific Screen type. This wrapper with a type assertion handles the mismatch.
            onNavigate={(s) => setScreen(s as Screen)} 
            onGetFreeCoins={() => setIsAdModalOpen(true)} 
            onOpenThemeSelector={() => setIsThemeModalOpen(true)} 
            onLogout={handleLogout}
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
       case 'PROFILE':
        if (!user) return <AuthScreen onLogin={handleLogin} themeConfig={themeConfig} />;
        return <ProfileScreen user={user} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
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
            if(user) {
                const updatedUser = userService.addCoins(user.email, AD_REWARD_COINS);
                if(updatedUser) setUser(updatedUser);
            }
            setIsAdModalOpen(false);
        }} themeConfig={themeConfig} />}
    </div>
  );
}