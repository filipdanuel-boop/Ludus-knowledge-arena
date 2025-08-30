
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Category, Field, FieldType, GamePhase, GameState, Player, Question, User, QuestionType } from './types';
import { CATEGORIES, MAP_CONFIG, PLAYER_COLORS, INITIAL_COINS, POINTS, PHASE_DURATIONS, HINT_COSTS, PLAYER_COLOR_HEX, BASE_HP, FIELD_HP, AD_REWARD_COINS, BOT_NAMES, ELIMINATION_COIN_BONUS, WIN_COINS_PER_PLAYER } from './constants';
import { generateQuestion, generateOpenEndedQuestion } from './services/geminiService';

const ANSWER_TIME_LIMIT = 15; // 15 sekund na odpověď

// --- POMOCNÉ & UI KOMPONENTY ---

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
);

const LuduCoin: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="url(#grad)" stroke="#a5f3fc" strokeWidth="1.5"/>
        <path d="M10.5 8L10.5 16L14.5 16" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#e0f2fe', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#7dd3fc', stopOpacity:1}} />
            </radialGradient>
        </defs>
    </svg>
);

const Modal: React.FC<{ children: React.ReactNode; isOpen: boolean; }> = ({ children, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-cyan-500/50 rounded-lg shadow-xl shadow-cyan-500/10 p-6 w-full max-w-2xl text-white">
        {children}
      </div>
    </div>
  );
};

const NeonButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-2 rounded-md font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variantClasses = variant === 'primary'
    ? "bg-cyan-500 text-gray-900 hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.7)] hover:shadow-[0_0_20px_rgba(6,182,212,0.9)] focus:ring-cyan-500"
    : "bg-gray-700 text-cyan-300 border border-cyan-600 hover:bg-gray-600 hover:text-cyan-200 focus:ring-cyan-600";
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const OnlinePlayerCounter: React.FC = () => {
    const [count, setCount] = useState(Math.floor(Math.random() * (350 - 150 + 1)) + 150);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => {
                const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
                return Math.max(100, prevCount + change);
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm border border-cyan-500/30 px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
            <div className="relative flex items-center justify-center h-3 w-3">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></div>
            </div>
            <p className="text-white font-bold">{count} <span className="text-gray-400 font-normal">Online</span></p>
        </div>
    );
};


// --- OBRAZOVKY ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // V reálné aplikaci by zde byla logika pro načtení/vytvoření v DB.
    // Nyní jen simulujeme a ukládáme lokálně.
    const storedHistory = localStorage.getItem('ludus_question_history');
    const questionHistory = storedHistory ? JSON.parse(storedHistory) : [];
    
    const user: User = { 
      email: "hrac@ludus.com", // Zde by byl email z formuláře
      luduCoins: INITIAL_COINS, 
      questionHistory 
    };
    
    localStorage.setItem('ludus_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center mb-10">
        <h1 className="text-7xl font-bold text-cyan-400 tracking-widest animate-pulse-bright">LUDUS</h1>
        <p className="text-gray-400 text-xl mt-2">Aréna Vědomostí</p>
      </div>
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
        <h2 className="text-3xl font-bold text-center mb-6 text-cyan-300">{isLogin ? 'Přihlášení' : 'Registrace'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" defaultValue="hrac@ludus.com" className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Heslo</label>
            <input type="password" id="password" defaultValue="password" className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <NeonButton type="submit" className="w-full">{isLogin ? 'Vstoupit do Arény' : 'Vytvořit Účet'}</NeonButton>
        </form>
        <p className="text-center mt-6 text-gray-500">
          <button onClick={() => setIsLogin(!isLogin)} className="text-cyan-400 hover:underline">
            {isLogin ? "Potřebujete účet? Zaregistrujte se" : "Už máte účet? Přihlaste se"}
          </button>
        </p>
      </div>
    </div>
  );
};

const LobbyScreen: React.FC<{ user: User; onNavigate: (screen: string) => void; onGetFreeCoins: () => void; }> = ({ user, onNavigate, onGetFreeCoins }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="absolute top-4 right-4 bg-gray-800 border border-cyan-500/30 p-3 rounded-lg text-center flex items-center gap-4">
            <p className="text-cyan-400 font-bold">{user.email}</p>
            <div className="flex items-center gap-2">
              <LuduCoin />
              <p className="text-yellow-400 text-lg font-bold">{user.luduCoins.toLocaleString()}</p>
            </div>
        </div>
      <h1 className="text-6xl font-bold text-cyan-400 mb-12 animate-pulse-bright">Hlavní Lobby</h1>
      <div className="flex flex-col gap-6 w-full max-w-md">
         <NeonButton onClick={() => onNavigate('GAME_SETUP')} className="w-full h-20 text-2xl">Hrát Lokálně</NeonButton>
         <NeonButton onClick={() => onNavigate('ONLINE_LOBBY')} className="w-full h-20 text-2xl">Hrát Online <span className="text-xs bg-rose-500 text-white px-2 py-1 rounded-full">BETA</span></NeonButton>
         <NeonButton onClick={onGetFreeCoins} variant="secondary" className="w-full h-20 text-2xl">Získat Coiny Zdarma</NeonButton>
         <NeonButton onClick={() => onNavigate('RULES')} variant="secondary" className="w-full h-20 text-2xl">Pravidla</NeonButton>
      </div>
      <OnlinePlayerCounter />
    </div>
  );
};

const OnlineLobbyScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; }> = ({ onStartGame, onBack }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h1 className="text-5xl font-bold text-cyan-400 mb-8" style={{ textShadow: '0 0 10px #06b6d4' }}>Online Aréna</h1>
        <div className="bg-gray-800 p-8 rounded-lg border border-cyan-500/30 w-full max-w-md space-y-4">
            <NeonButton onClick={() => onStartGame(2)} className="w-full h-16">Rychlá Hra (1v1)</NeonButton>
            <NeonButton onClick={() => onStartGame(4)} className="w-full h-16">Vytvořit Hru (1v1v1v1)</NeonButton>
            <NeonButton variant="secondary" onClick={onBack} className="w-full mt-4">Zpět</NeonButton>
        </div>
    </div>
);

const FindingMatchScreen: React.FC<{ playerCount: number; onMatchFound: () => void }> = ({ playerCount, onMatchFound }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        const matchTimer = setTimeout(onMatchFound, 5000); // Find match after 5s
        return () => {
            clearInterval(timer);
            clearTimeout(matchTimer);
        };
    }, [onMatchFound]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold text-cyan-300 mb-4">Vyhledávám zápas...</h1>
            <Spinner />
            <p className="text-xl mt-4 text-gray-400">Hledám {playerCount - 1} {playerCount - 1 > 1 ? 'soupeřů' : 'soupeře'}</p>
            <p className="text-lg mt-2 text-gray-500">Uplynulý čas: {elapsed}s</p>
        </div>
    );
};


const AdRewardModal: React.FC<{ onClaim: () => void; }> = ({ onClaim }) => (
    <Modal isOpen={true}>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-cyan-300 mb-4">Sledujete Reklamu</h2>
            <div className="bg-gray-700 h-48 flex items-center justify-center rounded-lg mb-6">
                <p className="text-gray-400">Video se přehrává...</p>
            </div>
            <NeonButton onClick={onClaim}>
                Získat <span className="font-bold text-yellow-300">{AD_REWARD_COINS}</span> <LuduCoin className="w-8 h-8"/>
            </NeonButton>
        </div>
    </Modal>
);

const GameSetupScreen: React.FC<{ onStartGame: (playerCount: number) => void; onBack: () => void; }> = ({ onStartGame, onBack }) => {
    const [playerCount, setPlayerCount] = useState<number>(2);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
             <h1 className="text-5xl font-bold text-cyan-400 mb-8" style={{ textShadow: '0 0 10px #06b6d4' }}>Vytvořit Lokální Hru</h1>
             <div className="bg-gray-800 p-8 rounded-lg border border-cyan-500/30 w-full max-w-md">
                 <div className="mb-6">
                     <label className="block text-xl text-gray-300 mb-3">Herní Mód: Všichni proti všem</label>
                     <p className="text-gray-500">Týmové módy již brzy!</p>
                 </div>
                 <div className="mb-8">
                     <label htmlFor="playerCount" className="block text-xl text-gray-300 mb-3">Počet Hráčů</label>
                     <select id="playerCount" value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))} className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                         <option value="2">2 Hráči</option>
                         <option value="4">4 Hráči</option>
                     </select>
                 </div>
                 <div className="flex justify-between items-center">
                    <NeonButton variant="secondary" onClick={onBack}>Zpět do Lobby</NeonButton>
                    <NeonButton onClick={() => onStartGame(playerCount)}>Začít Hru</NeonButton>
                 </div>
             </div>
        </div>
    );
};

const RulesScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold text-cyan-400 mb-8 text-center" style={{ textShadow: '0 0 10px #06b6d4' }}>Pravidla Hry</h1>
                <div className="space-y-6 bg-gray-800 p-6 rounded-lg border border-cyan-500/30">
                    <div>
                        <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Souboje & Rozstřel</h2>
                        <p className="text-gray-400">Při útoku na soupeřovo území odpovídá útočník i obránce. Pokud oba odpoví správně, nastává "Rozstřel" - nová otázka bez možností, kde se odpověď musí napsat. Kdo odpoví správně, vyhrává.</p>
                    </div>
                     <div>
                        <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Systém Životů (HP) a Opravy</h2>
                        <p className="text-gray-400">Normální území má 1 HP. Hráčské základny mají 3 HP. Pokud je vaše základna poškozená (má méně než 3 HP), můžete během svého útoku kliknout na ni a při správné odpovědi si opravit 1 HP.</p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Fáze 1: Zabírání území (3 kola)</h2>
                        <p className="text-gray-400">Všichni hráči si současně vybírají neutrální pole. Odpovězte správně, abyste pole zabrali a získali 100 bodů. Po této fázi na mapě nezbudou žádná volná pole.</p>
                    </div>
                     <div>
                        <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Vyřazení ze hry</h2>
                        <p className="text-gray-400">Hráč je vyřazen, pokud jeho základna ztratí poslední život (HP), nebo pokud jeho skóre klesne pod nulu.</p>
                    </div>
                </div>
                 <div className="text-center mt-8">
                    <NeonButton onClick={onBack}>Zpět do Lobby</NeonButton>
                 </div>
            </div>
        </div>
    );
};

const GameOverScreen: React.FC<{ gameState: GameState; onBackToLobby: () => void }> = ({ gameState, onBackToLobby }) => {
    const { winners } = gameState;

    return (
        <Modal isOpen={true}>
            <div className="text-center">
                <h1 className="text-5xl font-bold text-cyan-400 mb-4 animate-text-focus-in">Hra Skončila!</h1>
                {winners && winners.length > 0 ? (
                    <>
                        <h2 className="text-3xl text-yellow-400 mb-2">Vítěz: {winners.map(w => w.name).join(', ')}</h2>
                        <p className="text-xl text-gray-300 mb-6">Konečné skóre: {winners[0].score.toLocaleString()} bodů</p>
                    </>
                ) : (
                    <p className="text-2xl text-gray-400 mb-6">Hra skončila remízou.</p>
                )}
                
                <h3 className="text-xl text-cyan-300 mb-3 border-t border-gray-700 pt-4">Konečné pořadí:</h3>
                <div className="space-y-2 max-w-sm mx-auto">
                    {[...gameState.players].sort((a,b) => b.score - a.score).map((p, index) => (
                         <div key={p.id} className={`flex justify-between p-2 rounded ${winners?.some(w => w.id === p.id) ? 'bg-yellow-500/20' : 'bg-gray-700/50'}`}>
                            <span className={`font-bold text-${p.color}-400`}>{index + 1}. {p.name}</span>
                            <span className="text-white">{p.score.toLocaleString()} bodů</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <NeonButton onClick={onBackToLobby}>Zpět do Lobby</NeonButton>
                </div>
            </div>
        </Modal>
    );
};

// --- HERNÍ KOMPONENTY ---
const PlayerStatusUI: React.FC<{ players: Player[], currentPlayerId: string, board: Field[] }> = ({ players, currentPlayerId, board }) => {
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
                                <LuduCoin className="w-5 h-5" />
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

const AttackOrderUI: React.FC<{ attackers: Player[], currentPlayerId: string }> = ({ attackers, currentPlayerId }) => {
    if (attackers.length === 0) return null;
    return (
        <div>
            <h2 className="text-2xl font-bold text-cyan-300 border-b border-gray-700 pb-2 mb-4 mt-6">Pořadí útoků</h2>
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
    phase1Selections?: Record<string, number | null>
}> = ({ board, players, onFieldClick, gamePhase, currentPlayerId, currentTurnPlayerId, phase1Selections = {} }) => {
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
                filter = `drop-shadow(0 0 5px #06b6d4)`;
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
        <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
            <svg viewBox={`${minX - hexWidth} ${minY - hexHeight/1.5} ${viewBoxWidth} ${viewBoxHeight}`} className="max-w-full max-h-full">
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
                                <>
                                    <text textAnchor="middle" y={-5} fontSize="30" fill="white" style={{pointerEvents: 'none'}}>★</text>
                                    <text textAnchor="middle" y={25} fontSize="20" fill="white" fontWeight="bold" style={{pointerEvents: 'none'}}>❤️ {field.hp}</text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const TimerUI: React.FC<{ startTime: number, timeLimit: number, onTimeout: () => void }> = ({ startTime, timeLimit, onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const updateTimer = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, timeLimit - elapsed);
            setTimeLeft(remaining);
            if (remaining === 0) {
                onTimeout();
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };
        
        // Clear previous interval if it exists
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(updateTimer, 100);

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
                    className="text-cyan-400"
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
}> = ({ activeQuestion, onAnswer, onUseHint, onTimeout, loading, humanPlayer }) => {
    const [writtenAnswer, setWrittenAnswer] = useState("");
    
    useEffect(() => {
        setWrittenAnswer(""); // Reset on new question
    }, [activeQuestion?.question.question]);

    if (!activeQuestion && !loading) return null;

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
        <Modal isOpen={true}>
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <Spinner />
                    <p className="mt-4 text-xl text-cyan-300">Generuji otázku...</p>
                </div>
            ) : activeQuestion && (
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-cyan-400 mb-2">{isTieBreaker ? 'ROZSTŘEL!' : (isHealing ? 'Opravujete Základnu' : 'Otázka')}</p>
                            <h2 className="text-2xl font-bold">{activeQuestion.question.question}</h2>
                        </div>
                        {isAnswering && <TimerUI startTime={activeQuestion.startTime} timeLimit={ANSWER_TIME_LIMIT} onTimeout={onTimeout} />}
                    </div>
                    {questionType === 'MULTIPLE_CHOICE' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeQuestion.question.options?.map(option => (
                                <button
                                    key={option}
                                    onClick={() => onAnswer(option)}
                                    disabled={!isAnswering}
                                    className="p-4 bg-gray-700 rounded-md text-left text-lg hover:bg-cyan-600 transition-colors duration-200 border border-transparent hover:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Napište odpověď..."
                            />
                             <div className="text-right mt-4">
                                <NeonButton type="submit" disabled={!isAnswering || !writtenAnswer.trim()}>Odeslat</NeonButton>
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
                            >
                                Jistota ({HINT_COSTS.AUTO_ANSWER}) <LuduCoin className="w-5 h-5"/>
                            </NeonButton>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

const SpectatorQuestionModal: React.FC<{ activeQuestion: GameState['activeQuestion'] }> = ({ activeQuestion }) => {
    if (!activeQuestion) return null;
    const { question, questionType } = activeQuestion;
    return (
        <Modal isOpen={true}>
             <div>
                <p className="text-sm text-cyan-400 mb-2">Soupeř odpovídá...</p>
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

const AnswerFeedbackModal: React.FC<{ result: GameState['answerResult']; humanPlayerId: string }> = ({ result, humanPlayerId }) => {
    if (!result || result.playerId !== humanPlayerId) return null;

    const { isCorrect, correctAnswer } = result;
    const animationClass = isCorrect ? 'animate-fade-in' : 'animate-shake';
    
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 ${animationClass}`}>
            <div className={`p-8 rounded-lg text-center w-full max-w-md border-4 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                <h2 className={`text-5xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? "Správně!" : "Špatně!"}
                </h2>
                {!isCorrect && (
                    <p className="text-xl text-gray-300">Správná odpověď byla: <span className="font-bold text-cyan-300">{correctAnswer}</span></p>
                )}
            </div>
        </div>
    );
};

const EliminationFeedbackModal: React.FC<{ result: GameState['eliminationResult'] }> = ({ result }) => {
    if (!result) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="p-8 rounded-lg text-center w-full max-w-lg border-4 border-rose-600 bg-rose-900/50">
                <h2 className="text-5xl font-bold mb-4 text-rose-400 animate-text-focus-in">VYŘAZEN!</h2>
                <p className="text-2xl text-gray-200">
                    <span className="font-bold text-cyan-400">{result.attackerName}</span> vyřadil hráče <span className="font-bold text-red-500">{result.eliminatedPlayerName}</span>!
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
}> = ({ isOpen, availableCategories, onSelect, onClose, isBaseAttack }) => {
    if (!isOpen) return null;
    
    return (
        <Modal isOpen={true}>
            <div>
                <h2 className="text-2xl font-bold mb-6 text-cyan-300">Zvolte kategorii útoku</h2>
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
                        <NeonButton onClick={() => onSelect(availableCategories[0])}>Potvrdit Útok</NeonButton> :
                        <NeonButton variant="secondary" onClick={onClose}>Zrušit útok</NeonButton>
                   }
                 </div>
            </div>
        </Modal>
    );
};


// --- HLAVNÍ KOMPONENTA APLIKACE ---

export default function App() {
  const [screen, setScreen] = useState<'AUTH' | 'LOBBY' | 'ONLINE_LOBBY' | 'FINDING_MATCH' | 'GAME_SETUP' | 'RULES' | 'GAME'>('AUTH');
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [attackTarget, setAttackTarget] = useState<{ targetFieldId: number; defenderId?: string; isBaseAttack: boolean; } | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [onlinePlayerCount, setOnlinePlayerCount] = useState(2);


  const gameLogicTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const botTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Efekt pro automatické přihlášení
  useEffect(() => {
    const savedUserJson = localStorage.getItem('ludus_user');
    if (savedUserJson) {
      const savedUser = JSON.parse(savedUserJson);
      // Zde by v reálné aplikaci proběhla validace session/tokenu
      handleLogin(savedUser);
    }
  }, []);


  useEffect(() => {
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

      const config = MAP_CONFIG[playerCount as keyof typeof MAP_CONFIG];
      let board: Field[] = [];
      let fieldIdCounter = 0;
      
      for (let r = 0; r < config.height; r++) {
        for (let q = 0; q < config.width; q++) {
          board.push({ id: fieldIdCounter++, q, r, type: FieldType.Empty, ownerId: null, category: null, hp: 0, maxHp: 0 });
        }
      }

      // Place bases in corners
      const basePositions = [
          {q: 0, r: 0},
          {q: config.width - 1, r: config.height - 1},
          {q: config.width - 1, r: 0},
          {q: 0, r: config.height - 1}
      ];

      players.forEach((player, i) => {
          const pos = basePositions[i];
          const baseField = board.find(f => f.q === pos.q && f.r === pos.r)!;
          baseField.type = FieldType.PlayerBase;
          baseField.ownerId = player.id;
          baseField.category = player.mainBaseCategory;
          baseField.hp = BASE_HP;
          baseField.maxHp = BASE_HP;
      });

      const neutralFieldsNeeded = playerCount * PHASE_DURATIONS.PHASE1_ROUNDS;
      const emptyFields = board.filter(f => f.type === FieldType.Empty);
      
      for (let i = 0; i < neutralFieldsNeeded && i < emptyFields.length; i++) {
        const field = emptyFields[i];
        field.type = FieldType.Neutral;
        field.category = CATEGORIES[i % CATEGORIES.length];
        field.hp = FIELD_HP;
        field.maxHp = FIELD_HP;
      }
      
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
            let newState = { ...prev, ...state };
            
            return newState;
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
    if (!gameState || isLoadingQuestion || gameState.activeQuestion) return;
    
    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    const field = gameState.board.find(f => f.id === fieldId)!;
    
    if (gameState.gamePhase === GamePhase.Phase1_LandGrab) {
        if (gameState.phase1Selections?.[humanPlayer.id] != null) return;
        if (field.type === FieldType.Neutral && !field.ownerId) {
             if (Object.values(gameState.phase1Selections || {}).includes(fieldId)) return;
            setGameState(prev => prev ? { ...prev, phase1Selections: {...prev.phase1Selections, [humanPlayer.id]: fieldId} } : null);
            setIsLoadingQuestion(true);
            const question = await generateQuestion(field.category!, user?.questionHistory);
            setIsLoadingQuestion(false);
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
        if (currentPlayer.isBot || currentPlayer.id !== humanPlayer.id) return;

        const currentAttackers = getAttackers(gameState.players);
        if (!currentAttackers.some(p => p.id === currentPlayer.id)) return;

        // Healing logic
        if (field.ownerId === currentPlayer.id && field.type === FieldType.PlayerBase && field.hp < field.maxHp) {
             setIsLoadingQuestion(true);
             const question = await generateQuestion(field.category!, user?.questionHistory);
             setIsLoadingQuestion(false);
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
            setIsLoadingQuestion(true);
            const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const question = await generateQuestion(randomCategory, user?.questionHistory);
            setIsLoadingQuestion(false);
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
    if (!gameState || !attackTarget) return;
    const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
    
    setAttackTarget(null); // Close modal immediately
    setIsLoadingQuestion(true);
    const question = await generateQuestion(category, user?.questionHistory);
    setIsLoadingQuestion(false);

    if (question) {
         setGameState(prev => {
            if (!prev) return null;
            const { targetFieldId, defenderId, isBaseAttack } = attackTarget;
            
            // Only use an attack category if it's NOT a base attack
            const players = isBaseAttack ? prev.players : prev.players.map(p => p.id === currentPlayer.id ? {...p, usedAttackCategories: [...p.usedAttackCategories, category]} : p);

            const playerAnswers: Record<string, null> = { [currentPlayer.id]: null };
            if (defenderId) {
                 playerAnswers[defenderId] = null; // Prepare for defender's answer
            }
            
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
  
    const finalizeTurnResolution = useCallback(async (initialState: GameState) => {
        let finalState = JSON.parse(JSON.stringify(initialState));
        if (!finalState.activeQuestion) return;
        
        const { attackerId, defenderId, targetFieldId, playerAnswers, question, questionType, actionType, isBaseAttack } = finalState.activeQuestion;
        
        const attacker = finalState.players.find((p: Player) => p.id === attackerId);
        const field = finalState.board.find((f: Field) => f.id === targetFieldId);
        let elimination: { eliminatedPlayerName: string, attackerName: string } | null = null;
        
        const attackerAnswer = playerAnswers[attackerId];
        const isAttackerCorrect = questionType === 'MULTIPLE_CHOICE' ? attackerAnswer === question.correctAnswer : normalizeAnswer(attackerAnswer || "") === normalizeAnswer(question.correctAnswer);
        
        // Tie-breaker logic
        if (defenderId) {
            const defenderAnswer = playerAnswers[defenderId];
            const isDefenderCorrect = questionType === 'MULTIPLE_CHOICE' ? defenderAnswer === question.correctAnswer : normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer);
            
            if (isAttackerCorrect && isDefenderCorrect && !isBaseAttack && !finalState.activeQuestion.isTieBreaker) {
                const defender = finalState.players.find((p: Player) => p.id === defenderId);
                if (defender) {
                    finalState.gameLog.push(`ROZSTŘEL mezi ${attacker.name} a ${defender.name}!`);
                }
                advanceGameState(finalState);
                
                setIsLoadingQuestion(true);
                const tieBreakerQuestion = await generateOpenEndedQuestion(field.category, question.question, user?.questionHistory);
                setIsLoadingQuestion(false);
                
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
                    // Fallback to end turn as draw
                }
                return; // Stop further processing until tie-breaker is resolved
            }
        }
        
        // --- Standard Turn Resolution ---
        if (actionType === 'HEAL') {
            if (isAttackerCorrect) {
                field.hp = Math.min(field.maxHp, field.hp + 1);
                attacker.score += POINTS.HEAL_SUCCESS;
                finalState.gameLog.push(`${attacker.name} si úspěšně opravil základnu a získal ${POINTS.HEAL_SUCCESS} bodů.`);
            } else {
                attacker.score += POINTS.HEAL_FAIL_PENALTY;
                finalState.gameLog.push(`${attacker.name} neuspěl při opravě základny a ztratil ${-POINTS.HEAL_FAIL_PENALTY} bodů.`);
            }
        } else if (actionType === 'ATTACK') {
             if (defenderId) { // Duel or Base Attack
                const defender = finalState.players.find((p: Player) => p.id === defenderId);
                const defenderAnswer = playerAnswers[defenderId];
                const isDefenderCorrect = questionType === 'MULTIPLE_CHOICE' ? defenderAnswer === question.correctAnswer : normalizeAnswer(defenderAnswer || "") === normalizeAnswer(question.correctAnswer);
                
                if (isAttackerCorrect && (!isDefenderCorrect || isBaseAttack)) { // Attacker wins (in base attack, defender doesn't answer)
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
                } else if (!isAttackerCorrect && isDefenderCorrect) { // Defender wins
                    attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                    if (!isBaseAttack) defender.score += POINTS.ATTACK_WIN_DEFENDER;
                    finalState.gameLog.push(`${defender.name} ubránil své území proti ${attacker.name}.`);
                } else if (!isAttackerCorrect && (!isDefenderCorrect || isBaseAttack)) { // Attacker wrong (defender doesn't matter)
                    attacker.score += POINTS.ATTACK_LOSS_ATTACKER;
                    finalState.gameLog.push(`${attacker.name} odpověděl špatně a útok se nezdařil.`);
                } else { // Both correct in duel (tie-breaker already handled) or some other case
                    finalState.gameLog.push(`Souboj mezi ${attacker.name} a ${defender.name} skončil remízou!`);
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
                        finalState.gameLog.push(`${attacker.name} ZNIČIL základnu hráče ${defender.name} a vyřadil ho!`);
                        finalState.board.forEach((f: Field) => {
                            if (f.ownerId === defender.id) { f.ownerId = attacker.id; }
                        });
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
                    finalState.gameLog.push(`${attacker.name} neuspěl při zabírání černého území.`);
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
             // Turn progression logic
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
        finalState.answerResult = null; // Clear feedback
        if (elimination) finalState.eliminationResult = elimination;
        advanceGameState(finalState);

        if (elimination) {
            gameLogicTimeoutRef.current = setTimeout(() => {
                setGameState(s => s ? { ...s, eliminationResult: null } : null);
            }, 3000);
        }

    }, [user?.questionHistory]);

  const handleAnswer = (answer: string) => {
    if (!gameState || !gameState.activeQuestion) return;
    if (gameLogicTimeoutRef.current) clearTimeout(gameLogicTimeoutRef.current);

    const { activeQuestion } = gameState;
    const humanPlayer = gameState.players.find(p => !p.isBot)!;
    
    const isCorrect = activeQuestion.questionType === 'MULTIPLE_CHOICE' 
        ? answer === activeQuestion.question.correctAnswer
        : normalizeAnswer(answer) === normalizeAnswer(activeQuestion.question.correctAnswer);

    setGameState(prev => {
        if (!prev || !prev.activeQuestion) return prev;
        
        // Update the answer in the current state
        const updatedActiveQuestion = { ...prev.activeQuestion };
        updatedActiveQuestion.playerAnswers[humanPlayer.id] = answer;
        
        // Show feedback immediately
        const newStateWithFeedback = {
            ...prev,
            answerResult: { playerId: humanPlayer.id, isCorrect, correctAnswer: activeQuestion.question.correctAnswer },
            activeQuestion: updatedActiveQuestion
        };

        const allPlayersAnswered = Object.values(updatedActiveQuestion.playerAnswers).every(ans => ans !== null);

        if (allPlayersAnswered) {
             // If all have answered, set a timeout to finalize the turn after showing feedback
            gameLogicTimeoutRef.current = setTimeout(() => {
                finalizeTurnResolution(newStateWithFeedback);
            }, 3000);
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

  useEffect(() => {
    if (gameState?.gamePhase === GamePhase.Phase1_LandGrab) {
        const selectionsMadeCount = Object.keys(gameState.phase1Selections || {}).length;
        const botCount = gameState.players.filter(p => p.isBot).length;

        if (selectionsMadeCount < botCount && selectionsMadeCount === 0) {
            const botSelections: Record<string, number> = {};
            const availableFields = gameState.board.filter(f => f.type === FieldType.Neutral && !f.ownerId);
            
            gameState.players.forEach(player => {
                if (player.isBot && availableFields.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableFields.length);
                    botSelections[player.id] = availableFields.splice(randomIndex, 1)[0].id;
                }
            });

            if (Object.keys(botSelections).length > 0) {
                setGameState(prev => prev ? { ...prev, phase1Selections: botSelections } : null);
            }
        }
    }
  }, [gameState?.gamePhase, gameState?.round]);

    const passBotTurn = useCallback((currentState: GameState, reason: string) => {
        let newState = JSON.parse(JSON.stringify(currentState));
        const bot = newState.players[newState.currentTurnPlayerIndex];
        newState.gameLog.push(`${bot.name} (Bot) přeskakuje tah. Důvod: ${reason}`);
        
        // Advance turn without action
        const currentAttackers = getAttackers(newState.players);
        const currentAttackerInListIndex = currentAttackers.findIndex(p => p.id === bot.id);
        if (currentAttackerInListIndex === -1 || currentAttackerInListIndex === currentAttackers.length - 1 || currentAttackers.length === 0) {
            newState.round += 1;
        } else {
             const nextAttacker = currentAttackers[currentAttackerInListIndex + 1];
            newState.currentTurnPlayerIndex = newState.players.findIndex((p: Player) => p.id === nextAttacker.id);
        }
        advanceGameState(newState);
    }, []);

    const handleBotAttackTurn = useCallback(async (currentState: GameState) => {
        const currentPlayer = currentState.players[currentState.currentTurnPlayerIndex];
        const botBase = currentState.board.find(f => f.ownerId === currentPlayer.id && f.type === FieldType.PlayerBase);

        // Heal logic for bot
        if (botBase && botBase.hp < botBase.maxHp && (botBase.hp === 1 || Math.random() < 0.5)) {
            setIsLoadingQuestion(true);
            const question = await generateQuestion(botBase.category!, user?.questionHistory);
            setIsLoadingQuestion(false);
            if(question) {
                const isCorrect = Math.random() < 0.8;
                const answer = isCorrect ? question.correctAnswer : "wrong";
                let tempState = JSON.parse(JSON.stringify(currentState));
                 tempState.questionHistory.push(question.question);
                 const newHistory = [...(user?.questionHistory || []), question.question];
                 setUser(u => u ? {...u, questionHistory: newHistory} : null);
                 localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));

                tempState.activeQuestion = {
                    question, questionType: 'MULTIPLE_CHOICE', targetFieldId: botBase.id, attackerId: currentPlayer.id, actionType: 'HEAL', isBaseAttack: false, isTieBreaker: false, playerAnswers: { [currentPlayer.id]: answer }, startTime: Date.now()
                };
                finalizeTurnResolution(tempState);
                return;
            }
        }
        
        // Attack logic for bot
        const validTargets = currentState.board.filter(f => f.ownerId !== currentPlayer.id && f.type !== FieldType.Neutral);
        if (validTargets.length === 0) {
            passBotTurn(currentState, "Nebyly nalezeny žádné platné cíle.");
            return;
        }

        const humanPlayer = currentState.players.find(p => !p.isBot);
        let prioritizedTargets = validTargets.filter(t => t.ownerId === humanPlayer?.id);
        if (prioritizedTargets.length === 0) prioritizedTargets = validTargets;

        const targetField = prioritizedTargets[Math.floor(Math.random() * prioritizedTargets.length)];
        const isBaseAttack = targetField.type === FieldType.PlayerBase;
        const defender = currentState.players.find(p => p.id === targetField.ownerId);

        let category: Category;
        if (isBaseAttack) {
            category = targetField.category!;
        } else if (targetField.type === FieldType.Black) {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        } else {
            const availableCategories = CATEGORIES.filter(c => !currentPlayer.usedAttackCategories.includes(c));
            if (availableCategories.length === 0) {
                passBotTurn(currentState, "Byly vyčerpány všechny kategorie pro útok.");
                return;
            }
            category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        }

        setIsLoadingQuestion(true);
        const question = await generateQuestion(category, user?.questionHistory);
        setIsLoadingQuestion(false);

        if (!question) {
            passBotTurn(currentState, "Chyba při generování otázky.");
            return;
        }

        let newState = JSON.parse(JSON.stringify(currentState));
        const botPlayer = newState.players.find((p: Player) => p.id === currentPlayer.id)!;
        
        if (!isBaseAttack && targetField.type !== FieldType.Black) {
            botPlayer.usedAttackCategories.push(category);
        }
        
        const newHistory = [...(user?.questionHistory || []), question.question];
        setUser(u => u ? {...u, questionHistory: newHistory} : null);
        localStorage.setItem('ludus_question_history', JSON.stringify(newHistory));
        newState.questionHistory.push(question.question);
        
        const isAttackerCorrect = Math.random() < 0.7;
        const attackerAnswer = isAttackerCorrect ? question.correctAnswer : "wrong_bot_answer";
        
        const playerAnswers: Record<string, string | null> = { [currentPlayer.id]: attackerAnswer };
        
        newState.activeQuestion = {
            question, questionType: 'MULTIPLE_CHOICE', targetFieldId: targetField.id, attackerId: currentPlayer.id, defenderId: targetField.ownerId || undefined, isBaseAttack, isTieBreaker: false, playerAnswers, startTime: Date.now(), actionType: 'ATTACK'
        };
        
        if (defender && !defender.isBot) {
            advanceGameState(newState); // Wait for human to answer
        } else {
            if (defender && defender.isBot) {
                const isDefenderCorrect = Math.random() < 0.6;
                newState.activeQuestion.playerAnswers[defender.id] = isDefenderCorrect ? question.correctAnswer : "wrong_bot_answer_2";
            }
            // FIX: Check for defender existence before accessing its properties
            if (defender && newState.activeQuestion?.playerAnswers) {
                const isDefenderCorrect = Math.random() < 0.6;
                newState.activeQuestion.playerAnswers[defender.id] = isDefenderCorrect ? question.correctAnswer : "wrong_bot_answer_2";
            }
            finalizeTurnResolution(newState);
        }
    }, [passBotTurn, finalizeTurnResolution, user?.questionHistory]);

    useEffect(() => {
        if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
        
        if (gameState?.gamePhase === GamePhase.Phase2_Attacks && !gameState.activeQuestion && !isLoadingQuestion && !gameState.answerResult && !gameState.eliminationResult) {
            const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
            
            if (currentPlayer?.isBot) {
                botTurnTimeoutRef.current = setTimeout(() => {
                    if(!gameState) return;
                    const attackers = getAttackers(gameState.players);
                    if (attackers.some(p => p.id === currentPlayer.id)) {
                        handleBotAttackTurn(gameState);
                    }
                }, 2000);
            }
        }
        
        return () => { if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current); };
    }, [gameState, isLoadingQuestion, handleBotAttackTurn, passBotTurn]);
    
    // Efekt pro aktualizaci stavu mincí po skončení hry
    useEffect(() => {
        if (gameState?.gamePhase === GamePhase.GameOver && user) {
            const humanPlayer = gameState.players.find(p => !p.isBot);
            if (!humanPlayer) return;

            const isWinner = gameState.winners?.some(w => w.id === humanPlayer.id) ?? false;
            
            let finalCoins = humanPlayer.coins;
            if (isWinner) {
                const totalPlayers = gameState.players.length;
                const winBonus = (totalPlayers - 1) * WIN_COINS_PER_PLAYER;
                finalCoins += winBonus;
            }

            const updatedUser = { ...user, luduCoins: finalCoins };
            setUser(updatedUser);
            localStorage.setItem('ludus_user', JSON.stringify(updatedUser));
        }
    }, [gameState?.gamePhase]);


  const renderScreen = () => {
    switch (screen) {
      case 'AUTH':
        return <AuthScreen onLogin={handleLogin} />;
      case 'LOBBY':
        return user && <LobbyScreen user={user} onNavigate={handleNavigate} onGetFreeCoins={() => setIsAdModalOpen(true)} />;
      case 'ONLINE_LOBBY':
          return <OnlineLobbyScreen onStartGame={handleStartOnlineGame} onBack={() => setScreen('LOBBY')} />;
      case 'FINDING_MATCH':
          return <FindingMatchScreen playerCount={onlinePlayerCount} onMatchFound={() => {
              setGameState(createInitialGameState(onlinePlayerCount, true));
              setScreen('GAME');
          }} />;
      case 'GAME_SETUP':
        return <GameSetupScreen onStartGame={handleStartGame} onBack={() => setScreen('LOBBY')} />;
      case 'RULES':
        return <RulesScreen onBack={() => setScreen('LOBBY')} />;
      case 'GAME':
        if (!gameState) return null;
        if (gameState.gamePhase === GamePhase.GameOver) {
            return <GameOverScreen gameState={gameState} onBackToLobby={handleBackToLobby} />;
        }
        const currentPlayer = gameState.players[gameState.currentTurnPlayerIndex];
        const humanPlayer = gameState.players.find(p => !p.isBot)!;
        const isHumanAnswering = gameState.activeQuestion?.playerAnswers.hasOwnProperty(humanPlayer.id);

        const getHeaderText = () => {
            if (gameState.answerResult) return 'Vyhodnocuji...';
            if (isLoadingQuestion) return 'Načítám...';
            if (gameState.activeQuestion) {
                 if (isHumanAnswering && gameState.activeQuestion.playerAnswers[humanPlayer.id] === null) return 'Odpovězte na otázku!';
                 return 'Soupeř je na tahu...';
            }
            if (gameState.gamePhase === GamePhase.Phase1_LandGrab) return `Kolo ${gameState.round}/${PHASE_DURATIONS.PHASE1_ROUNDS}: Vyberte si území`;
            
            const attackers = getAttackers(gameState.players);
            if (gameState.gamePhase === GamePhase.Phase2_Attacks && attackers.some(p => p.id === humanPlayer.id) && currentPlayer.id === humanPlayer.id) {
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

        const phaseName = gameState.gamePhase.replace("PHASE_1_", "").replace("PHASE_2_", "").replace("PHASE_3_", "").replace(/_/g, ' ');
        const attackers = getAttackers(gameState.players);
        
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <header className="bg-gray-800/50 p-4 border-b border-cyan-500/30">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-400 capitalize">Fáze: {phaseName.toLowerCase()}</h1>
                            <p className="text-gray-400">Kolo: {gameState.round}</p>
                        </div>
                        <div className="text-2xl font-mono text-cyan-300">{formatTime(gameTime)}</div>
                        <div className="text-right">
                             <h2 className="text-xl">{getHeaderText()}</h2>
                        </div>
                    </div>
                </header>
                <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <div className="flex-grow md:w-2/3 lg:w-3/4 order-2 md:order-1 relative">
                        <HexagonalGameBoard 
                            board={gameState.board} 
                            players={gameState.players} 
                            onFieldClick={handleFieldClick} 
                            phase1Selections={gameState.phase1Selections} 
                            gamePhase={gameState.gamePhase}
                            currentPlayerId={humanPlayer.id}
                            currentTurnPlayerId={currentPlayer.id}
                        />
                    </div>
                    <aside className="md:w-1/3 lg:w-1/4 bg-gray-900/50 p-4 border-t md:border-t-0 md:border-l border-cyan-500/30 order-1 md:order-2 overflow-y-auto">
                        <h2 className="text-2xl font-bold text-cyan-300 border-b border-gray-700 pb-2 mb-4">Hráči</h2>
                        <PlayerStatusUI players={gameState.players} currentPlayerId={currentPlayer?.id} board={gameState.board} />
                        {gameState.gamePhase === GamePhase.Phase2_Attacks && <AttackOrderUI attackers={attackers} currentPlayerId={currentPlayer?.id} />}
                        <h2 className="text-2xl font-bold text-cyan-300 border-b border-gray-700 pb-2 mb-4 mt-6">Záznam Hry</h2>
                        <div className="h-64 overflow-y-auto bg-gray-800 p-2 rounded-md">
                            {gameState.gameLog.slice().reverse().map((log, i) => <p key={i} className="text-sm text-gray-400 mb-1">{log}</p>)}
                        </div>
                    </aside>
                </main>
                {isHumanAnswering ? (
                     <QuestionModal activeQuestion={gameState.activeQuestion} onAnswer={handleAnswer} onTimeout={() => handleAnswer('timeout_wrong_answer')} loading={isLoadingQuestion} onUseHint={handleUseHint} humanPlayer={humanPlayer} />
                ) : (
                     <SpectatorQuestionModal activeQuestion={gameState.activeQuestion} />
                )}
                <CategorySelectionModal 
                    isOpen={!!attackTarget}
                    availableCategories={CATEGORIES.filter(c => !currentPlayer?.usedAttackCategories.includes(c))}
                    isBaseAttack={attackTarget?.isBaseAttack || false}
                    onSelect={async (category) => {
                        if(attackTarget?.isBaseAttack){
                             const field = gameState.board.find(f => f.id === attackTarget.targetFieldId)!;
                             await handleCategorySelect(field.category!);
                        } else {
                            await handleCategorySelect(category);
                        }
                    }}
                    onClose={() => setAttackTarget(null)}
                />
                <AnswerFeedbackModal result={gameState.answerResult} humanPlayerId={humanPlayer.id} />
                <EliminationFeedbackModal result={gameState.eliminationResult} />
            </div>
        );
      default:
        // Zkontrolujte, zda je uživatel v procesu načítání, abyste předešli blikání
        return user ? null : <AuthScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="bg-gray-900">
        <Analytics />
        {renderScreen()}
        {isAdModalOpen && <AdRewardModal onClaim={() => {
            setUser(u => u ? {...u, luduCoins: u.luduCoins + AD_REWARD_COINS} : u);
            setIsAdModalOpen(false);
        }} />}
    </div>
  );
}