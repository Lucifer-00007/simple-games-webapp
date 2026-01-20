// Archery game types

export type GameStatus = 'idle' | 'aiming' | 'shooting' | 'result' | 'gameOver';

export interface Arrow {
    power: number;
    angle: number;
    x: number;
    y: number;
    flying: boolean;
}

export interface GameState {
    arrow: Arrow;
    score: number;
    highScore: number;
    arrowsLeft: number;
    wind: number;
    status: GameStatus;
    lastHitScore: number;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    targetX: number;
    targetY: number;
    totalArrows: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 600,
    canvasHeight: 400,
    targetX: 500,
    targetY: 200,
    totalArrows: 10,
};
