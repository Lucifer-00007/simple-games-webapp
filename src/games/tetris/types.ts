// Tetris game types

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Position {
    x: number;
    y: number;
}

export interface Tetromino {
    type: TetrominoType;
    shape: number[][];
    position: Position;
    color: string;
}

export interface GameState {
    board: (string | null)[][];
    currentPiece: Tetromino | null;
    nextPiece: Tetromino | null;
    ghostPosition: Position | null;
    status: GameStatus;
    score: number;
    highScore: number;
    level: number;
    linesCleared: number;
}

export interface GameConfig {
    boardWidth: number;
    boardHeight: number;
    initialSpeed: number;
    speedMultiplier: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    boardWidth: 14,
    boardHeight: 18,
    initialSpeed: 1000,
    speedMultiplier: 0.9,
};

// Tetromino shapes and colors
export const TETROMINOES: Record<TetrominoType, { shape: number[][]; color: string }> = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: '#00f5ff',
    },
    O: {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: '#ffd700',
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#a855f7',
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        color: '#22c55e',
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        color: '#ef4444',
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#3b82f6',
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#f97316',
    },
};

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
