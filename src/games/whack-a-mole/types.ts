// Whack-A-Mole game types

export type GameStatus = 'idle' | 'playing' | 'finished';

export interface GameState {
    activeMole: number | null;
    score: number;
    highScore: number;
    timeLeft: number;
    status: GameStatus;
    hits: number;
    misses: number;
}

export interface GameConfig {
    gridSize: number;
    gameDuration: number;
    moleInterval: number;
    moleVisibleTime: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    gridSize: 9,
    gameDuration: 30,
    moleInterval: 800,
    moleVisibleTime: 1000,
};
