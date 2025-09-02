import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
// FIX: Import 'Category' type to resolve 'Cannot find name' errors.
import { User, Theme, GamePhase, Language, QuestionDifficulty, Category } from './types';
import { gameReducer } from './services/gameLogic';
import { themes } from './themes';
import * as userService from './services/userService';
import { AD_REWARD_COINS } from './constants';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';

// Import screen components
import { AuthScreen } from './components/screens/AuthScreen';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { OnlineLobbyScreen } from './components/screens/OnlineLobbyScreen';
import { FindingMatchScreen } from './components/screens/FindingMatchScreen';
import { GameSetupScreen } from './components/screens/GameSetupScreen';
import { RulesScreen } from './components/screens/RulesScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { LanguageSelectionScreen } from './components/screens/LanguageSelectionScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';


// Import UI components
import { AdRewardModal } from './components/game/AdRewardModal';
import { ThemeSelectionModal } from './components/game/ThemeSelectionModal';
import { Spinner } from './components/ui/Spinner';

type Screen = 'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME' | 'PROFILE' | 'LEADERBOARD';

// FIX: Hardcode metadata to resolve persistent module loading error
const appMetadata = {
  "name": "LUDUS: Knowledge Arena",
  "description": "A strategic online trivia game where players conquer territories by answering questions. Compete in various modes, climb the ranks, and prove your knowledge in sports, culture, science, and more.",
  "requestFramePermissions": []
};

const AppContent = () => {
  const { language, setLanguage } = useTranslation();
  const [isLanguageSet, setIsLanguageSet] = React.useState(!!localStorage.getItem('ludus_language'));

  const [screen, setScreen] = React.useState<Screen>('AUTH');
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = React.useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [onlinePlayerCount, setOnlinePlayerCount] = React.useState(2);
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem('ludus_theme') as Theme) || 'default');
  
  const [gameState, dispatch] = React.useReducer(gameReducer, null);

  const themeConfig = themes[theme];
  
  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLanguageSet(true);
  };

  React.useEffect(() => {
    // FIX: Only attempt auto-login after the language has been set.
    // This ensures the language selection screen is always shown first for new users.
    if (isLanguageSet) {
      const loggedInUser = userService.getLoggedInUser();
      if (loggedInUser) {
          // Sync global language with user's saved language
          if(loggedInUser.language !== language) {
              setLanguage(loggedInUser.language);
          }
        setUser(loggedInUser);
        setScreen('PROFILE'); // Navigate to profile on auto-login
      }
    }
  }, [isLanguageSet, language, setLanguage]);

  React.useEffect(() => {
      if (user && user.language !== language) {
          const updatedUser = { ...user, language };
          setUser(updatedUser);
          userService.saveUserData(updatedUser);
      }
  }, [language, user]);

  React.useEffect(() => {
    localStorage.setItem('ludus_theme', theme);
    // FIX: Simplify theme application for robustness. This replaces all existing
    // classes on the body with the new theme's background classes, avoiding
    // potential issues with complex class names and manual removal.
    document.body.className = themeConfig.background;
  }, [theme, themeConfig]);

  const handleLogin = (loggedInUser: User) => {
    const userWithCurrentLang = { ...loggedInUser, language };
    setUser(userWithCurrentLang);
    userService.saveUserData(userWithCurrentLang);
    userService.saveLoggedInUser(userWithCurrentLang.email);
    setScreen('PROFILE'); // Navigate to profile on manual login
  };
  
  const handleLogout = () => {
    userService.logoutUser();
    setUser(null);
    setScreen('AUTH');
  };

  const handleStartGame = (playerCount: number, botDifficulty: QuestionDifficulty) => {
    if (user) {
        dispatch({ type: 'INITIALIZE_GAME', payload: { playerCount, user, botDifficulty } });
        setScreen('GAME');
    }
  };

  const handleStartOnlineGame = (playerCount: number) => {
      setOnlinePlayerCount(playerCount);
      setScreen('FINDING_MATCH');
  };

  const handleBackToLobby = () => {
      if (gameState?.players && user) {
        const humanPlayer = gameState.players.find(p => !p.isBot);
        if(humanPlayer && gameState.matchStats[humanPlayer.id]) {
            const playerStats = gameState.matchStats[humanPlayer.id];
            const currentUserData = userService.loadUserData(user.email)!;
            
            currentUserData.xp += playerStats.xpEarned;
            currentUserData.stats.totalCorrect += playerStats.correct;
            currentUserData.stats.totalAnswered += playerStats.total;
            
            for(const category in playerStats.categories){
                currentUserData.stats.categoryStats[category as Category].totalCorrect += playerStats.categories[category as Category].correct;
                currentUserData.stats.categoryStats[category as Category].totalAnswered += playerStats.categories[category as Category].total;
            }
            
            userService.saveUserData(currentUserData);
            setUser(currentUserData);
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
                    dispatch({ type: 'INITIALIZE_GAME', payload: { playerCount: onlinePlayerCount, user, isOnlineMode: true, botDifficulty: 'medium' } });
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
      case 'LEADERBOARD':
        if (!user) return <AuthScreen onLogin={handleLogin} themeConfig={themeConfig} />;
        return <LeaderboardScreen user={user} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
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

  if (!isLanguageSet) {
    return <LanguageSelectionScreen onSelect={handleLanguageSelect} />;
  }

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

export default function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    )
}