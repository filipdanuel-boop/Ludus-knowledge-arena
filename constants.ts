import { Category } from './types';

export const CATEGORIES = Object.values(Category);

export const PLAYER_COLORS = ['cyan', 'rose', 'lime', 'violet', 'amber', 'indigo', 'emerald', 'fuchsia', 'sky', 'pink', 'teal', 'yellow'];
export const PLAYER_COLOR_HEX: { [key: string]: string } = {
  cyan: '#06b6d4',
  rose: '#f43f5e',
  lime: '#84cc16',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  indigo: '#6366f1',
  emerald: '#10b981',
  fuchsia: '#d946ef',
  sky: '#0ea5e9',
  pink: '#ec4899',
  teal: '#14b8a6',
  yellow: '#eab308',
};

export const INITIAL_COINS = 1000;
export const WIN_COINS_PER_PLAYER = 50;
export const AD_REWARD_COINS = 150;
export const SURRENDER_COIN_PENALTY = 100;
export const ELIMINATION_COIN_BONUS = 100;
export const EMAIL_VERIFICATION_BONUS = 500;


export const BASE_HP = 3;
export const FIELD_HP = 1;

export const POINTS = {
  PHASE1_CLAIM: 100,
  ATTACK_WIN: 100,
  ATTACK_DAMAGE: 50,
  ATTACK_LOSS_ATTACKER: -75,
  ATTACK_LOSS_DEFENDER: -50, // Defender also loses some points on a loss
  ATTACK_WIN_DEFENDER: 100,
  BLACK_FIELD_CLAIM: 200,
  BLACK_FIELD_FAIL: -150,
  BASE_DESTROY_BONUS: 500,
  HEAL_SUCCESS: 75,
  HEAL_FAIL_PENALTY: -50,
};

export const PHASE_DURATIONS = {
  PHASE1_ROUNDS: 3,
  PHASE2_ROUNDS: 6,
};

export const HINT_COSTS = {
    AUTO_ANSWER: 500,
};

export const BOT_NAMES = [
    "ShadowStriker", "QuantumLeap", "Vortex", "Nebula", "CyberJaw", 
    "Pulse", "Ghost", "Echo", "Titan", "Viper", "Omega"
];