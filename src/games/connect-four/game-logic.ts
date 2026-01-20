// Connect Four game logic - pure functions

import { Board, Player, Cell, GameState, GameConfig, DEFAULT_CONFIG } from './types';

// Create empty board
export function createEmptyBoard(rows: number, cols: number): Board {
    return Array(rows).fill(null).map(() => Array(cols).fill(null));
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        board: createEmptyBoard(config.rows, config.cols),
        currentPlayer: 'red',
        status: 'playing',
        winner: null,
        winningCells: null,
        scores: { red: 0, yellow: 0 },
    };
}

// Find the lowest empty row in a column
export function findLowestEmptyRow(board: Board, col: number): number {
    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][col] === null) {
            return row;
        }
    }
    return -1; // Column is full
}

// Check for win in a direction
function checkDirection(
    board: Board,
    startRow: number,
    startCol: number,
    dRow: number,
    dCol: number,
    player: Player,
    winLength: number
): { row: number; col: number }[] | null {
    const cells: { row: number; col: number }[] = [];

    for (let i = 0; i < winLength; i++) {
        const row = startRow + i * dRow;
        const col = startCol + i * dCol;

        if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
            return null;
        }

        if (board[row][col] !== player) {
            return null;
        }

        cells.push({ row, col });
    }

    return cells;
}

// Check for winner
export function checkWinner(
    board: Board,
    lastRow: number,
    lastCol: number,
    config: GameConfig = DEFAULT_CONFIG
): { winner: Player | null; winningCells: { row: number; col: number }[] | null } {
    const player = board[lastRow][lastCol];
    if (!player) return { winner: null, winningCells: null };

    const directions = [
        { dRow: 0, dCol: 1 },   // Horizontal
        { dRow: 1, dCol: 0 },   // Vertical
        { dRow: 1, dCol: 1 },   // Diagonal down-right
        { dRow: 1, dCol: -1 },  // Diagonal down-left
    ];

    for (const { dRow, dCol } of directions) {
        // Check all possible starting positions for this direction
        for (let start = 0; start < config.winLength; start++) {
            const startRow = lastRow - start * dRow;
            const startCol = lastCol - start * dCol;

            const cells = checkDirection(board, startRow, startCol, dRow, dCol, player, config.winLength);
            if (cells) {
                return { winner: player, winningCells: cells };
            }
        }
    }

    return { winner: null, winningCells: null };
}

// Check for draw
export function isDraw(board: Board): boolean {
    return board[0].every(cell => cell !== null);
}

// Drop a piece into a column
export function dropPiece(
    state: GameState,
    col: number,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing') return state;

    const row = findLowestEmptyRow(state.board, col);
    if (row === -1) return state; // Column is full

    // Create new board with piece
    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.currentPlayer;

    // Check for winner
    const { winner, winningCells } = checkWinner(newBoard, row, col, config);

    if (winner) {
        return {
            ...state,
            board: newBoard,
            status: 'won',
            winner,
            winningCells,
            scores: {
                ...state.scores,
                [winner]: state.scores[winner] + 1,
            },
        };
    }

    // Check for draw
    if (isDraw(newBoard)) {
        return {
            ...state,
            board: newBoard,
            status: 'draw',
        };
    }

    // Continue game
    return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'red' ? 'yellow' : 'red',
    };
}

// Reset game
export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        ...createInitialState(config),
        scores: state.scores,
    };
}
