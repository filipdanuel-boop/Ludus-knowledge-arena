import * as React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { User, Theme, GamePhase, Language, QuestionDifficulty, Category, Player } from './types';
import { BOT_NAMES, CATEGORIES } from './constants';
import { gameReducer } from './services/gameLogic';
import { themes } from './themes';
import * as userService from './services/userService';
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
import { PrivateLobbyScreen } from './components/screens/PrivateLobbyScreen';


// Import UI components
import { ThemeSelectionModal } from './components/game/ThemeSelectionModal';
import { Spinner } from './components/ui/Spinner';

type Screen = 'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME' | 'PROFILE' | 'LEADERBOARD' | 'PRIVATE_LOBBY';

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
    if (!isLanguageSet || user) return;

    const loggedInUser = userService.getLoggedInUser();
    if (loggedInUser) {
        // Sync language provider with user's saved language
        if (loggedInUser.language !== language) {
            setLanguage(loggedInUser.language);
        }
        setUser(loggedInUser);
        setScreen('LOBBY');
    } else {
        setScreen('AUTH');
    }
}, [isLanguageSet, user, language, setLanguage]);

  React.useEffect(() => {
    localStorage.setItem('ludus_theme', theme);
    document.body.className = themeConfig.background;
  }, [theme, themeConfig]);

  const handleLogin = (loggedInUser: User) => {
    const userWithCurrentLang = { ...loggedInUser, language };
    setUser(userWithCurrentLang);
    userService.saveUserData(userWithCurrentLang);
    userService.saveLoggedInUser(userWithCurrentLang.email);
    setScreen('LOBBY');
  };
  
  const handleLogout = () => {
    userService.logoutUser();
    setUser(null);
    setScreen('AUTH');
  };

  const handleStartGame = (playerCount: number, botDifficulty: QuestionDifficulty) => {
    if (user) {
        const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
            id: i === 0 ? user.email : `bot-${i}`,
            name: i === 0 ? user.nickname : `Bot ${i}`,
            isBot: i !== 0,
            color: '', score: 0, coins: 0, mainBaseCategory: Category.Sport, usedAttackCategories: [], finalPoints: 0, isEliminated: false // dummy values
        }));
        dispatch({ type: 'INITIALIZE_GAME', payload: { players, user, botDifficulty, allowedCategories: CATEGORIES } });
        setScreen('GAME');
    }
  };

  const handleStartPrivateGame = (players: Player[], allowedCategories: Category[]) => {
      if (user) {
          dispatch({ type: 'INITIALIZE_GAME', payload: { players, user, botDifficulty: 'medium', allowedCategories } });
          setScreen('GAME');
      }
  };

  const handleStartOnlineGame = (playerCount: number) => {
      setOnlinePlayerCount(playerCount);
      setScreen('FINDING_MATCH');
  };

  const handleBackToLobby = () => {
      if (gameState?.players && user) {
        const humanPlayer = gameState.players.find(p => p.id === user.email);
        if(humanPlayer && gameState.matchStats[humanPlayer.id]) {
            const currentUserData = userService.loadUserData(user.email);
            
            if (currentUserData) {
                const playerStats = gameState.matchStats[humanPlayer.id];
                currentUserData.xp += playerStats.xpEarned;
                currentUserData.stats.totalCorrect += playerStats.correct;
                currentUserData.stats.totalAnswered += playerStats.total;
                
                for(const category in playerStats.categories){
                    if (currentUserData.stats.categoryStats[category as Category]) {
                        currentUserData.stats.categoryStats[category as Category].totalCorrect += playerStats.categories[category as Category].correct;
                        currentUserData.stats.categoryStats[category as Category].totalAnswered += playerStats.categories[category as Category].total;
                    }
                }
                
                userService.saveUserData(currentUserData);
                setUser(currentUserData);
            }
        }
      }
      dispatch({ type: 'SET_STATE', payload: { gamePhase: GamePhase.Setup }});
      setScreen('PROFILE');
  };

  const renderScreen = () => {
    if (!isLanguageSet || (isLanguageSet && screen !== 'AUTH' && !user)) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig} /></div>;
    }
      
    switch (screen) {
      case 'AUTH':
        return <AuthScreen onLogin={handleLogin} themeConfig={themeConfig}/>;
      case 'LOBBY':
        return <LobbyScreen 
            user={user!} 
            setUser={setUser}
            onNavigate={(s) => setScreen(s as Screen)} 
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
                    const players: Player[] = Array.from({ length: onlinePlayerCount }, (_, i) => ({
                        id: i === 0 ? user.email : `bot-${i}`,
                        name: i === 0 ? user.nickname : BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
                        isBot: i !== 0,
                         color: '', score: 0, coins: 0, mainBaseCategory: Category.Sport, usedAttackCategories: [], finalPoints: 0, isEliminated: false
                    }));
                    dispatch({ type: 'INITIALIZE_GAME', payload: { players, user, botDifficulty: 'medium', allowedCategories: CATEGORIES } });
                    setScreen('GAME');
                }
            }} 
            themeConfig={themeConfig} 
          />;
      case 'GAME_SETUP':
        return <GameSetupScreen onStartGame={handleStartGame} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig}/>;
      case 'PRIVATE_LOBBY':
        return <PrivateLobbyScreen user={user!} onStartGame={handleStartPrivateGame} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'RULES':
        return <RulesScreen onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
       case 'PROFILE':
        return <ProfileScreen user={user!} setUser={setUser} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'LEADERBOARD':
        return <LeaderboardScreen user={user!} onBack={() => setScreen('LOBBY')} themeConfig={themeConfig} />;
      case 'GAME':
        if (!gameState) return <div className="min-h-screen flex items-center justify-center"><Spinner themeConfig={themeConfig} /></div>;
        return <GameScreen 
            gameState={gameState}
            dispatch={dispatch}
            user={user!}
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
    </div>
  );
}

export default function AppWrapper() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    )
}