export const normalizeAnswer = (answer: string): string => {
    if (typeof answer !== 'string') return '';
    return answer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const BASE_XP = 100;
const GROWTH_FACTOR = 1.25;

/**
 * Calculates the total XP required to reach a specific level.
 */
export const getTotalXpForLevel = (level: number): number => {
    if (level === 1) return 0;
    // Using a geometric progression formula approximation
    return Math.floor(BASE_XP * (Math.pow(GROWTH_FACTOR, level - 1) - 1) / (GROWTH_FACTOR - 1));
};

/**
 * Calculates the player's current level based on their total XP.
 */
export const getLevelForXp = (xp: number): number => {
    if (xp < BASE_XP) return 1;
    let level = 1;
    while (xp >= getTotalXpForLevel(level + 1)) {
        level++;
        if (level >= 99) return 99;
    }
    return level;
};

/**
 * Calculates the player's progress within the current level.
 */
export const getXpProgressInLevel = (xp: number): { currentLevelXp: number, xpForNextLevel: number, level: number } => {
    const level = getLevelForXp(xp);
    const xpForCurrentLevel = getTotalXpForLevel(level);
    const xpForNextLevel = getTotalXpForLevel(level + 1);
    const currentLevelXp = xp - xpForCurrentLevel;
    return { currentLevelXp, xpForNextLevel: xpForNextLevel - xpForCurrentLevel, level };
};