// Minesweeper game logic

import { Cell, Board, GameState, GameConfig, DEFAULT_CONFIG } from './types';

// Create empty board
export function createEmptyBoard(rows: number, cols: number): Board {
    return Array(rows).fill(null).map(() =>
        Array(cols).fill(null).map(() => ({
            isMine: false,
            adjacentMines: 0,
            state: 'hidden' as const,
        }))
    );
}

// Place mines randomly (avoiding first click position)
export function placeMines(
    board: Board,
    mineCount: number,
    avoidRow: number,
    avoidCol: number
): Board {
    const rows = board.length;
    const cols = board[0].length;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let placed = 0;

    while (placed < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        // Avoid the first click area (3x3 around click)
        const isNearClick = Math.abs(row - avoidRow) <= 1 && Math.abs(col - avoidCol) <= 1;

        if (!newBoard[row][col].isMine && !isNearClick) {
            newBoard[row][col].isMine = true;
            placed++;
        }
    }

    return calculateAdjacentMines(newBoard);
}

// Calculate adjacent mines for all cells
export function calculateAdjacentMines(board: Board): Board {
    const rows = board.length;
    const cols = board[0].length;

    return board.map((row, r) =>
        row.map((cell, c) => {
            if (cell.isMine) return cell;

            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                        count++;
                    }
                }
            }
            return { ...cell, adjacentMines: count };
        })
    );
}

// Create initial state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        board: createEmptyBoard(config.rows, config.cols),
        status: 'playing',
        minesRemaining: config.mines,
        revealedCount: 0,
        totalSafeCells: config.rows * config.cols - config.mines,
        startTime: null,
        endTime: null,
    };
}

// Reveal cell recursively
export function revealCell(state: GameState, row: number, col: number, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    let board = state.board;
    const cell = board[row][col];
    if (cell.state !== 'hidden') return state;

    // First click - place mines
    if (state.startTime === null) {
        board = placeMines(board, config.mines, row, col);
    }

    // Hit a mine
    if (board[row][col].isMine) {
        // Reveal all mines
        const revealedBoard = board.map(r =>
            r.map(c => c.isMine ? { ...c, state: 'revealed' as const } : c)
        );
        return {
            ...state,
            board: revealedBoard,
            status: 'lost',
            endTime: Date.now(),
            startTime: state.startTime ?? Date.now(),
        };
    }

    // Reveal this cell and potentially neighbors
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const toReveal: [number, number][] = [[row, col]];
    let revealed = 0;

    while (toReveal.length > 0) {
        const [r, c] = toReveal.pop()!;
        if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) continue;
        if (newBoard[r][c].state !== 'hidden') continue;

        newBoard[r][c].state = 'revealed';
        revealed++;

        // If no adjacent mines, reveal neighbors
        if (newBoard[r][c].adjacentMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    toReveal.push([r + dr, c + dc]);
                }
            }
        }
    }

    const newRevealedCount = state.revealedCount + revealed;
    const won = newRevealedCount === state.totalSafeCells;

    return {
        ...state,
        board: newBoard,
        revealedCount: newRevealedCount,
        status: won ? 'won' : 'playing',
        startTime: state.startTime ?? Date.now(),
        endTime: won ? Date.now() : null,
    };
}

// Toggle flag
export function toggleFlag(state: GameState, row: number, col: number): GameState {
    if (state.status !== 'playing') return state;

    const cell = state.board[row][col];
    if (cell.state === 'revealed') return state;

    const newBoard = state.board.map(r => r.map(c => ({ ...c })));
    const newState = cell.state === 'flagged' ? 'hidden' : 'flagged';
    newBoard[row][col].state = newState;

    const minesDelta = newState === 'flagged' ? -1 : 1;

    return {
        ...state,
        board: newBoard,
        minesRemaining: state.minesRemaining + minesDelta,
    };
}

// Reset game
export function resetGame(config: GameConfig = DEFAULT_CONFIG): GameState {
    return createInitialState(config);
}
