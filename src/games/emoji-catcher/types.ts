// Emoji Catcher game types

export type GameStatus = 'idle' | 'playing' | 'finished';

export interface FallingEmoji {
    id: number;
    emoji: string;
    x: number;
    y: number;
    speed: number;
}

export interface GameState {
    emojis: FallingEmoji[];
    score: number;
    highScore: number;
    timeLeft: number;
    status: GameStatus;
    missed: number;
    caught: number;
}

export interface GameConfig {
    gameDuration: number;
    spawnInterval: number;
    baseSpeed: number;
    maxEmojis: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    gameDuration: 30,
    spawnInterval: 800,
    baseSpeed: 2,
    maxEmojis: 10,
};

export const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🍌', '⭐', '💎', '🌟'];
