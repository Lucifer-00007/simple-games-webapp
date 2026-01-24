// Archery game types

export type GameStatus = 'idle' | 'drawing' | 'flying' | 'gameOver';

export interface Arrow {
    x: number;
    y: number;
    flying: boolean;
}

export interface GameState {
    score: number;
    highScore: number;
    arrowsLeft: number;
    status: GameStatus;
}

export interface GameConfig {
    totalArrows: number;
    bullseyePoints: number;
    hitPoints: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    totalArrows: 10,
    bullseyePoints: 10,
    hitPoints: 5,
};
