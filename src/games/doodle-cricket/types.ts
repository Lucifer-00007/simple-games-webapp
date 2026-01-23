export type GameStatus = 'idle' | 'playing' | 'gameOver' | 'bowling';

export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    vz?: number; // Added for 3D-like depth if needed, but we'll stick to 2D for simplicity
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
    STUMPS_X: 300,
    STUMPS_Y: 340,
    BOWLER_X: 300,
    BOWLER_Y: 160,
    GRAVITY: 0.15,
    PITCH_TOP_Y: 150,
    PITCH_BOTTOM_Y: 400,
};