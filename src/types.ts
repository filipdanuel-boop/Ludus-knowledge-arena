export type Theme = 'default' | 'forest' | 'ocean' | 'inferno';
export type Language = 'cs' | 'en' | 'de' | 'es';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export enum Category {
  Sport = "Sport",
  Esport = "E-sport",
  SocialMedia = "Sociální sítě",
  Culture = "Kultura",
  Geography = "Zeměpis",
  Science = "Věda",
}

export enum GamePhase {
  Setup = "SETUP",
  Phase1_LandGrab = "PHASE_1_ZABÍRÁNÍ_ÚZEMÍ",
  Phase1_PickField = "PHASE_1_PICK_FIELD", // For HexGameBoard/PhaseTimer
  Phase1_ShowQuestion = "PHASE_1_SHOW_QUESTION", // For PhaseTimer
  Phase1_ResolveRound = "PHASE_1_RESOLVE_ROUND", // Added for clarity
  Phase2_Attacks = "PHASE_2_ÚTOKY",
  Phase2_CombatResolve = "PHASE_2_COMBAT_RESOLVE", // New state for resolving combat
  Phase2_Tiebreaker = "PHASE_2_TIEBREAKER", // New state for tie-breaker question
  Phase3_FinalShowdown = "PHASE_3_FINÁLE",
  GameOver = "GAME_OVER",
}

export enum FieldType {
  Neutral = "NEUTRAL",
  PlayerBase = "PLAYER_BASE",
  Black = "BLACK",
  Empty = "EMPTY", // For map generation
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  coins: number;
  isBot: boolean;
  mainBaseCategory: Category;
  usedAttackCategories: Category[];
  finalPoints: number;
  isEliminated: boolean;
}

export interface Field {
  id: number;
  q: number; // Column for hex grid
  r: number; // Row for hex grid
  type: FieldType;
  ownerId: string | null;
  category: Category | null;
  hp: number;
  maxHp: number;
}

export interface Question {
  question: string;
  options?: string[]; // Optional for open-ended questions
  correctAnswer: string;
  difficulty: QuestionDifficulty;
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'OPEN_ENDED';

export interface GameState {
  players: Player[];
  board: Field[];
  gamePhase: GamePhase;
  currentTurnPlayerIndex: number;
  round: number;
  gameLog: string[];
  activeQuestion: {
    question: Question;
    questionType: QuestionType;
    targetFieldId: number;
    attackerId: string;
    defenderId?: string;
    isBaseAttack: boolean;
    isTieBreaker: boolean;
    actionType: 'ATTACK' | 'HEAL';
    playerAnswers: Record<string, string | null>;
    startTime: number; // Timestamp for countdown
  } | null;
  winners: Player[] | null;
  phase1Selections?: Record<string, number | null>;
  gameStartTime: number; // Timestamp for total game duration
  answerResult: {
    playerId: string;
    isCorrect: boolean;
    correctAnswer: string;
  } | null;
  eliminationResult: {
      eliminatedPlayerName: string;
      attackerName: string;
  } | null;
  questionHistory: string[]; // History of questions for the current match
  botDifficulty: QuestionDifficulty;
  allowedCategories: Category[];
  matchStats: Record<string, {
    xpEarned: number;
    correct: number;
    total: number;
    categories: Record<Category, { correct: number; total: number }>;
  }>;
}

export interface User {
  email: string;
  nickname: string;
  luduCoins: number;
  language: Language;
  xp: number;
  stats: {
    totalCorrect: number;
    totalAnswered: number;
    answeredQuestions: string[];
    categoryStats: Record<Category, { totalCorrect: number; totalAnswered: number }>;
  };
  lastLoginDate: string; // YYYY-MM-DD
  loginStreak: number;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    level: number;
    xp: number;
    isCurrentUser: boolean;
}

export interface LobbyPlayer {
    id: string;
    nickname: string;
    isHost: boolean;
}

export interface PrivateLobby {
    code: string;
    hostId: string;
    players: LobbyPlayer[];
    allowedCategories: Category[];
    createdAt: number;
}


// --- Game Reducer Actions ---
export type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { players: Player[]; user: User, botDifficulty: QuestionDifficulty, allowedCategories: Category[] } }
  | { type: 'SET_PHASE1_SELECTION'; payload: { playerId: string; fieldId: number } }
  | { type: 'SET_QUESTION'; payload: GameState['activeQuestion'] }
  | { type: 'SET_TIEBREAKER_QUESTION'; payload: { question: Question } }
  | { type: 'CLEAR_QUESTION' }
  | { type: 'SUBMIT_ANSWER'; payload: { playerId: string; answer: string } }
  | { type: 'RESOLVE_COMBAT' } // New action to resolve turn logic
  | { type: 'SET_ANSWER_FEEDBACK'; payload: GameState['answerResult'] }
  | { type: 'CLEAR_ANSWER_FEEDBACK' }
  | { type: 'SET_ELIMINATION_FEEDBACK'; payload: GameState['eliminationResult'] }
  | { type: 'CLEAR_ELIMINATION_FEEDBACK' }
  | { type: 'UPDATE_PLAYERS'; payload: Player[] }
  | { type: 'PASS_BOT_TURN'; payload: { botId: string; reason: string } }
  | { type: 'SET_STATE'; payload: Partial<GameState> };
