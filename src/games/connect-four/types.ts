// Connect Four game types

export type Player = 'red' | 'yellow';
export type Cell = Player | null;
export type Board = Cell[][];
export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameState {
    board: Board;
    currentPlayer: Player;
    status: GameStatus;
    winner: Player | null;
    winningCells: { row: number; col: number }[] | null;
    scores: { red: number; yellow: number };
}

export interface GameConfig {
    rows: number;
    cols: number;
    winLength: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    rows: 6,
    cols: 7,
    winLength: 4,
};
