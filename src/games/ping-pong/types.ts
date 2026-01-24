// Ping Pong game types

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    dx: number;
    dy: number;
    speed: number;
}

export interface GameState {
    playerPaddle: Paddle;
    aiPaddle: Paddle;
    ball: Ball;
    playerScore: number;
    aiScore: number;
    status: GameStatus;
    winner: 'player' | 'ai' | null;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    paddleWidth: number;
    paddleHeight: number;
    paddleSpeed: number;
    ballRadius: number;
    ballSpeed: number;
    winScore: number;
    aiDifficulty: number; // 0-1, higher = harder
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 600,
    canvasHeight: 400,
    paddleWidth: 12,
    paddleHeight: 80,
    paddleSpeed: 8,
    ballRadius: 8,
    ballSpeed: 6,
    winScore: 7,
    aiDifficulty: 0.7,
};
