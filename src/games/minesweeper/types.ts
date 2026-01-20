// Minesweeper game types

export type CellState = 'hidden' | 'revealed' | 'flagged';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface Cell {
    isMine: boolean;
    adjacentMines: number;
    state: CellState;
}

export type Board = Cell[][];

export interface GameState {
    board: Board;
    status: GameStatus;
    minesRemaining: number;
    revealedCount: number;
    totalSafeCells: number;
    startTime: number | null;
    endTime: number | null;
}

export interface GameConfig {
    rows: number;
    cols: number;
    mines: number;
}

export const DIFFICULTY_LEVELS: Record<string, GameConfig> = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 12, cols: 12, mines: 30 },
    hard: { rows: 16, cols: 16, mines: 60 },
};

export const DEFAULT_CONFIG = DIFFICULTY_LEVELS.easy;
