export type Theme = 'default' | 'forest' | 'ocean' | 'inferno';
export type Language = 'cs' | 'en' | 'de' | 'es';

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
  Phase2_Attacks = "PHASE_2_ÚTOKY",
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

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

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
    // FIX: Add category to active question to track for stats.
    category: Category;
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
  // FIX: Added missing properties to GameState for match statistics and bot difficulty.
  matchStats: Record<string, {
      correct: number;
      total: number;
      xpEarned: number;
      categories: Record<Category, { correct: number, total: number }>;
  }>;
  botDifficulty: QuestionDifficulty;
}

// FIX: Added UserStats interface for detailed player statistics.
export interface UserStats {
  totalCorrect: number;
  totalAnswered: number;
  answeredQuestions: string[];
  categoryStats: Record<Category, { totalCorrect: number, totalAnswered: number }>;
}

export interface User {
  email: string;
  luduCoins: number;
  language: Language;
  // FIX: Added properties for XP, stats, and login streaks to the User type.
  xp: number;
  stats: UserStats;
  lastLoginDate: string;
  loginStreak: number;
}


// --- Game Reducer Actions ---
export type GameAction =
  // FIX: Updated INITIALIZE_GAME payload to accept optional botDifficulty.
  | { type: 'INITIALIZE_GAME'; payload: { playerCount: number; user: User, isOnlineMode?: boolean, botDifficulty?: QuestionDifficulty } }
  | { type: 'SET_PHASE1_SELECTION'; payload: { playerId: string; fieldId: number } }
  | { type: 'SET_QUESTION'; payload: GameState['activeQuestion'] }
  | { type: 'CLEAR_QUESTION' }
  // FIX: Updated SUBMIT_ANSWER payload to include the question category for stats tracking.
  | { type: 'SUBMIT_ANSWER'; payload: { playerId: string; answer: string; category: Category } }
  | { type: 'RESOLVE_PHASE1_ROUND'; payload: { humanActionResult: 'win' | 'loss', fieldId: number } }
  | { type: 'RESOLVE_TURN'; payload?: { tieBreakerQuestion?: Question } }
  | { type: 'SET_ANSWER_FEEDBACK'; payload: GameState['answerResult'] }
  | { type: 'CLEAR_ANSWER_FEEDBACK' }
  | { type: 'SET_ELIMINATION_FEEDBACK'; payload: GameState['eliminationResult'] }
  | { type: 'CLEAR_ELIMINATION_FEEDBACK' }
  | { type: 'UPDATE_PLAYERS'; payload: Player[] }
  | { type: 'PASS_BOT_TURN'; payload: { botId: string; reason: string } }
  | { type: 'SET_STATE'; payload: Partial<GameState> };