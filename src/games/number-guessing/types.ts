// Number Guessing game types

export type GameStatus = 'playing' | 'won' | 'lost';
export type HintDirection = 'higher' | 'lower' | null;

export interface GameState {
    secretNumber: number;
    guess: number | null;
    attempts: number;
    maxAttempts: number;
    hint: HintDirection;
    status: GameStatus;
    guessHistory: number[];
}

export interface GameConfig {
    minNumber: number;
    maxNumber: number;
    maxAttempts: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    minNumber: 1,
    maxNumber: 100,
    maxAttempts: 10,
};
