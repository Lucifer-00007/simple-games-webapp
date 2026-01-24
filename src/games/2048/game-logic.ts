// 2048 game logic - pure functions, no React/DOM

import { GameState, GameConfig, Direction, DEFAULT_CONFIG } from './types';

// Create empty board
export function createEmptyBoard(size: number): number[][] {
    return Array(size).fill(null).map(() => Array(size).fill(0));
}

// Get all empty cell positions
export function getEmptyCells(board: number[][]): { row: number; col: number }[] {
    const empty: { row: number; col: number }[] = [];
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === 0) {
                empty.push({ row, col });
            }
        }
    }
    return empty;
}

// Add a random tile (2 or 4) to empty cell
export function addRandomTile(board: number[][]): number[][] {
    const newBoard = board.map(row => [...row]);
    const emptyCells = getEmptyCells(newBoard);

    if (emptyCells.length === 0) return newBoard;

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;

    return newBoard;
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    let board = createEmptyBoard(config.gridSize);
    board = addRandomTile(board);
    board = addRandomTile(board);

    return {
        board,
        score: 0,
        bestScore: 0,
        status: 'playing',
        hasWon: false,
    };
}

// Slide a row to the left (base operation)
function slideRow(row: number[]): { newRow: number[]; score: number } {
    // Remove zeros
    const filtered = row.filter(val => val !== 0);
    let score = 0;

    // Merge adjacent equal values
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            score += filtered[i];
            filtered.splice(i + 1, 1);
        }
    }

    // Pad with zeros
    while (filtered.length < row.length) {
        filtered.push(0);
    }

    return { newRow: filtered, score };
}

// Rotate board 90 degrees clockwise
function rotateBoard(board: number[][]): number[][] {
    const size = board.length;
    const rotated: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            rotated[col][size - 1 - row] = board[row][col];
        }
    }

    return rotated;
}

// Move tiles in a direction
export function move(board: number[][], direction: Direction): { newBoard: number[][]; score: number; moved: boolean } {
    let rotations = 0;
    let workBoard = board.map(row => [...row]);

    // Rotate so we always slide left
    switch (direction) {
        case 'LEFT': rotations = 0; break;
        case 'UP': rotations = 1; break;
        case 'RIGHT': rotations = 2; break;
        case 'DOWN': rotations = 3; break;
    }

    for (let i = 0; i < rotations; i++) {
        workBoard = rotateBoard(workBoard);
    }

    // Slide all rows left
    let totalScore = 0;
    const newBoard = workBoard.map(row => {
        const { newRow, score } = slideRow(row);
        totalScore += score;
        return newRow;
    });

    // Rotate back
    let result = newBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
        result = rotateBoard(result);
    }

    // Check if anything moved
    const moved = JSON.stringify(result) !== JSON.stringify(board);

    return { newBoard: result, score: totalScore, moved };
}

// Check if any moves are possible
export function canMove(board: number[][]): boolean {
    const size = board.length;

    // Check for empty cells
    if (getEmptyCells(board).length > 0) return true;

    // Check for adjacent equal cells
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const val = board[row][col];
            if (col < size - 1 && board[row][col + 1] === val) return true;
            if (row < size - 1 && board[row + 1][col] === val) return true;
        }
    }

    return false;
}

// Check if player has won (has 2048 tile)
export function hasWinningTile(board: number[][], winningTile: number = 2048): boolean {
    return board.some(row => row.some(cell => cell >= winningTile));
}

// Process a move
export function makeMove(state: GameState, direction: Direction, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status === 'lost') return state;

    const { newBoard, score, moved } = move(state.board, direction);

    if (!moved) return state;

    // Add new tile
    const boardWithNewTile = addRandomTile(newBoard);
    const newScore = state.score + score;

    // Check win condition
    const won = !state.hasWon && hasWinningTile(boardWithNewTile, config.winningTile);

    // Check lose condition
    const lost = !canMove(boardWithNewTile);

    return {
        board: boardWithNewTile,
        score: newScore,
        bestScore: Math.max(state.bestScore, newScore),
        status: lost ? 'lost' : won ? 'won' : 'playing',
        hasWon: state.hasWon || won,
    };
}

// Continue playing after winning
export function continueGame(state: GameState): GameState {
    if (state.status !== 'won') return state;
    return {
        ...state,
        status: 'playing',
    };
}

// Reset game
export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newState = createInitialState(config);
    return {
        ...newState,
        bestScore: state.bestScore,
    };
}
