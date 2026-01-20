// Tic Tac Toe game types

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export type GameStatus = 'playing' | 'won' | 'draw';

export interface GameState {
    board: Board;
    currentPlayer: Player;
    status: GameStatus;
    winner: Player | null;
    winningLine: number[] | null;
}

// Win conditions - all possible ways to win
export const WIN_CONDITIONS = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
];
