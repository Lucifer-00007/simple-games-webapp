// Tilting Maze - Simplified implementation
export type GameStatus = 'idle' | 'playing' | 'won' | 'gameOver';

export interface Ball { x: number; y: number; vx: number; vy: number; }

export interface GameState {
    ball: Ball;
    status: GameStatus;
    time: number;
}

export const DEFAULT_CONFIG = { canvasWidth: 400, canvasHeight: 400, ballRadius: 15, friction: 0.95, gravity: 0.5 };

export function createInitialState(): GameState {
    return { ball: { x: 50, y: 50, vx: 0, vy: 0 }, status: 'idle', time: 0 };
}

export function updateBall(state: GameState, tiltX: number, tiltY: number): GameState {
    if (state.status !== 'playing') return state;

    const newVx = (state.ball.vx + tiltX * 0.3) * DEFAULT_CONFIG.friction;
    const newVy = (state.ball.vy + tiltY * 0.3) * DEFAULT_CONFIG.friction;
    let newX = state.ball.x + newVx;
    let newY = state.ball.y + newVy;

    newX = Math.max(DEFAULT_CONFIG.ballRadius, Math.min(DEFAULT_CONFIG.canvasWidth - DEFAULT_CONFIG.ballRadius, newX));
    newY = Math.max(DEFAULT_CONFIG.ballRadius, Math.min(DEFAULT_CONFIG.canvasHeight - DEFAULT_CONFIG.ballRadius, newY));

    return { ...state, ball: { x: newX, y: newY, vx: newVx, vy: newVy }, time: state.time + 1 };
}

export function startGame(state: GameState): GameState { return { ...state, status: 'playing' }; }
export function resetGame(): GameState { return createInitialState(); }
