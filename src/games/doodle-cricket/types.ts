export type GameStatus = 'idle' | 'playing' | 'gameOver' | 'bowling';

export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
}

export interface GameState {
    status: GameStatus;
    score: number;
    wickets: number;
    ball: Ball;
    isSwinging: boolean;
    lastSwingTime: number;
    difficulty: number;
}

export const CRICKET_CONFIG = {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
    STUMPS_X: 500,
    STUMPS_Y: 250,
    BOWLER_X: 50,
    BOWLER_Y: 200,
    GRAVITY: 0.15,
};
