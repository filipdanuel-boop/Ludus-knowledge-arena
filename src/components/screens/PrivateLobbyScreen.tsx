import * as React from 'react';
import { User, Theme, PrivateLobby, Category, LobbyPlayer, Player } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { Spinner } from '../ui/Spinner';
import * as lobbyService from '../../services/lobbyService';
import { useTranslation } from '../../i18n/LanguageContext';
import { CATEGORIES } from '../../constants';

export const PrivateLobbyScreen: React.FC<{ 
    user: User; 
    onStartGame: (players: Player[], allowedCategories: Category[]) => void;
    onBack: () => void; 
    themeConfig: typeof themes[Theme] 
}> = ({ user, onStartGame, onBack, themeConfig }) => {
    const { t } = useTranslation();
    const [currentLobby, setCurrentLobby] = React.useState<PrivateLobby | null>(null);
    const [joinCode, setJoinCode] = React.useState('');
    const [selectedCategories, setSelectedCategories] = React.useState<Category[]>([...CATEGORIES]);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    
    const pollIntervalRef = React.useRef<number | null>(null);
    
    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const startPolling = (code: string) => {
        stopPolling();
        pollIntervalRef.current = window.setInterval(() => {
            const lobby = lobbyService.getLobby(code);
            if (lobby) {
                setCurrentLobby(lobby);
            } else {
                // Lobby was disbanded
                setError(t('errorLobbyNotFound'));
                setCurrentLobby(null);
                stopPolling();
            }
        }, 2000); // Poll every 2 seconds
    };
    
    React.useEffect(() => {
        return () => stopPolling(); // Cleanup on component unmount
    }, []);
    
    const handleCreateLobby = () => {
        setError(null);
        if (selectedCategories.length === 0) {
            setError(t('errorSelectOneCategory'));
            return;
        }
        setIsLoading(true);
        const host: LobbyPlayer = { id: user.email, nickname: user.nickname, isHost: true };
        const newLobby = lobbyService.createLobby(host, selectedCategories);
        setCurrentLobby(newLobby);
        startPolling(newLobby.code);
        setIsLoading(false);
    };

    const handleJoinLobby = () => {
        setError(null);
        if (joinCode.length !== 6) {
            setError(t('errorInvalidCode'));
            return;
        }
        setIsLoading(true);
        const me: LobbyPlayer = { id: user.email, nickname: user.nickname, isHost: false };
        const result = lobbyService.joinLobby(joinCode.toUpperCase(), me);
        if (result.success && result.lobby) {
            setCurrentLobby(result.lobby);
            startPolling(result.lobby.code);
        } else {
            setError(t(result.message!));
        }
        setIsLoading(false);
    };

    const handleLeaveLobby = () => {
        if (currentLobby) {
            stopPolling();
            lobbyService.leaveLobby(currentLobby.code, user.email);
            setCurrentLobby(null);
        }
    };
    
    const handleStartGame = () => {
        if(currentLobby && currentLobby.players.length > 1) {
            stopPolling();
            const gamePlayers: Player[] = currentLobby.players.map(p => ({
                id: p.id,
                name: p.nickname,
                isBot: false, // In private lobbies, all players are human
                 // These are dummy values, will be replaced by createInitialGameState
                color: '', score: 0, coins: 0, mainBaseCategory: Category.Sport, usedAttackCategories: [], finalPoints: 0, isEliminated: false,
            }));
            // Host can add bots if players < 4
            const botsToAdd = 4 - gamePlayers.length;
            for(let i = 0; i < botsToAdd; i++) {
                gamePlayers.push({
                    id: `bot-private-${i}`, name: `Bot ${i+1}`, isBot: true,
                    color: '', score: 0, coins: 0, mainBaseCategory: Category.Sport, usedAttackCategories: [], finalPoints: 0, isEliminated: false,
                })
            }
            lobbyService.removeLobby(currentLobby.code);
            onStartGame(gamePlayers, currentLobby.allowedCategories);
        }
    };

    const toggleCategory = (category: Category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };
    
    const copyToClipboard = () => {
        if (currentLobby) {
            navigator.clipboard.writeText(currentLobby.code);
            const copyButton = document.getElementById('copy-button');
            if(copyButton) {
                copyButton.innerText = t('codeCopied');
                setTimeout(() => {
                    copyButton.innerText = t('copyCode');
                }, 2000);
            }
        }
    };

    if (currentLobby) {
        const amIHost = currentLobby.hostId === user.email;
        return (
             <div className="min-h-screen flex flex-col items-center justify-center p-4">
                 <h1 className={`text-4xl font-bold ${themeConfig.accentTextLight} mb-4`}>{t('privateLobbyTitle')}</h1>
                 <div className={`bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} w-full max-w-lg`}>
                    <p className="text-gray-400 text-center text-lg">{t('shareCode')}</p>
                    <div className="flex items-center justify-center gap-4 my-4">
                        <span className={`text-4xl font-mono tracking-[0.2em] bg-gray-900 px-4 py-2 rounded-md ${themeConfig.accentText}`}>{currentLobby.code}</span>
                        <NeonButton id="copy-button" onClick={copyToClipboard} variant="secondary" themeConfig={themeConfig}>{t('copyCode')}</NeonButton>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-300 mt-6 mb-2">{t('playersInLobby')} ({currentLobby.players.length}/4)</h3>
                    <div className="space-y-2 min-h-[120px]">
                        {currentLobby.players.map(p => (
                            <div key={p.id} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
                                <span className="text-lg">{p.nickname}</span>
                                {p.isHost && <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-gray-900`}>Host</span>}
                            </div>
                        ))}
                    </div>
                    
                     <div className="mt-6 flex justify-between">
                         <NeonButton variant="secondary" onClick={handleLeaveLobby} themeConfig={themeConfig}>{t('leaveLobby')}</NeonButton>
                         {amIHost && <NeonButton onClick={handleStartGame} disabled={currentLobby.players.length < 2} themeConfig={themeConfig}>{t('startGame')}</NeonButton>}
                     </div>
                 </div>
             </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8`}>{t('challengeFriendButton')}</h1>
            
            <div className="w-full max-w-2xl grid md:grid-cols-2 gap-8">
                {/* Create Lobby */}
                <div className={`bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder}`}>
                    <h2 className={`text-3xl font-bold text-center mb-4 ${themeConfig.accentTextLight}`}>{t('createLobby')}</h2>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">{t('selectCategories')}</label>
                        <div className="grid grid-cols-2 gap-2">
                             {CATEGORIES.map(cat => (
                                 <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={`p-2 rounded-md text-sm transition-colors ${selectedCategories.includes(cat) ? `bg-cyan-500 text-white` : 'bg-gray-700 hover:bg-gray-600'}`}
                                 >
                                     {cat}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <NeonButton onClick={handleCreateLobby} disabled={isLoading} className="w-full" themeConfig={themeConfig}>{t('createLobby')}</NeonButton>
                </div>

                {/* Join Lobby */}
                <div className={`bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder}`}>
                    <h2 className={`text-3xl font-bold text-center mb-4 ${themeConfig.accentTextLight}`}>{t('joinLobby')}</h2>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2" htmlFor="lobby-code">{t('lobbyCode')}</label>
                        <input
                            type="text"
                            id="lobby-code"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className={`w-full p-3 bg-gray-700 rounded border border-gray-600 text-center text-2xl tracking-[0.2em] focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                            placeholder="ABC123"
                        />
                    </div>
                    <NeonButton onClick={handleJoinLobby} disabled={isLoading} className="w-full" themeConfig={themeConfig}>{t('join')}</NeonButton>
                </div>
            </div>
            {error && <p className="text-red-500 mt-4 text-center animate-shake">{error}</p>}
            <div className="mt-8">
                <NeonButton onClick={onBack} variant="secondary" themeConfig={themeConfig}>{t('backToLobby')}</NeonButton>
            </div>
        </div>
    );
};
