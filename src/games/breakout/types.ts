// Breakout game types

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver' | 'won';

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    dx: number;
    dy: number;
}

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    velocity: Velocity;
}

export interface Brick {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    points: number;
    destroyed: boolean;
}

export interface GameState {
    paddle: Paddle;
    ball: Ball;
    bricks: Brick[];
    status: GameStatus;
    score: number;
    highScore: number;
    lives: number;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    paddleWidth: number;
    paddleHeight: number;
    ballRadius: number;
    ballSpeed: number;
    brickRows: number;
    brickCols: number;
    brickWidth: number;
    brickHeight: number;
    brickPadding: number;
    brickOffsetTop: number;
    brickOffsetLeft: number;
    initialLives: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 480,
    canvasHeight: 400,
    paddleWidth: 80,
    paddleHeight: 12,
    ballRadius: 8,
    ballSpeed: 5,
    brickRows: 5,
    brickCols: 8,
    brickWidth: 50,
    brickHeight: 16,
    brickPadding: 6,
    brickOffsetTop: 40,
    brickOffsetLeft: 24,
    initialLives: 3,
};

export const BRICK_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
];
