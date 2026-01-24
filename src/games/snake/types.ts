// Snake game types

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Position {
    x: number;
    y: number;
}

export interface GameState {
    snake: Position[];
    food: Position;
    direction: Direction;
    nextDirection: Direction;
    status: GameStatus;
    score: number;
    highScore: number;
    speed: number;
}

export interface GameConfig {
    gridSize: number;
    initialSpeed: number;
    speedIncrement: number;
    initialLength: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    gridSize: 20,
    initialSpeed: 150,
    speedIncrement: 5,
    initialLength: 3,
};
