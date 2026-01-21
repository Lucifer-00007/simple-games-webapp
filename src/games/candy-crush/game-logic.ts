// Candy Crush game logic - pure functions, no React/DOM

import { Candy, CandyType, Position, GameState, GameConfig, DEFAULT_CONFIG } from './types';

let idCounter = 0;

// Generate unique ID for candy
function generateId(): string {
    return `candy-${idCounter++}`;
}

// Get random candy type
export function getRandomCandyType(config: GameConfig = DEFAULT_CONFIG): CandyType {
    return config.candyTypes[Math.floor(Math.random() * config.candyTypes.length)];
}

// Create a candy
export function createCandy(config: GameConfig = DEFAULT_CONFIG): Candy {
    return {
        type: getRandomCandyType(config),
        id: generateId(),
    };
}

// Check if there's a match at position (don't create initial matches)
function wouldCreateMatch(
    board: (Candy | null)[][],
    row: number,
    col: number,
    type: CandyType
): boolean {
    // Check horizontal
    let count = 1;
    for (let c = col - 1; c >= 0 && board[row][c]?.type === type; c--) count++;
    for (let c = col + 1; c < board[0].length && board[row][c]?.type === type; c++) count++;
    if (count >= 3) return true;

    // Check vertical
    count = 1;
    for (let r = row - 1; r >= 0 && board[r][col]?.type === type; r--) count++;
    for (let r = row + 1; r < board.length && board[r][col]?.type === type; r++) count++;
    if (count >= 3) return true;

    return false;
}

// Create a candy that won't create a match
function createNonMatchingCandy(
    board: (Candy | null)[][],
    row: number,
    col: number,
    config: GameConfig = DEFAULT_CONFIG
): Candy {
    let attempts = 0;
    let candy = createCandy(config);

    while (wouldCreateMatch(board, row, col, candy.type) && attempts < 20) {
        candy = createCandy(config);
        attempts++;
    }

    return candy;
}

// Create initial board without matches
export function createBoard(config: GameConfig = DEFAULT_CONFIG): (Candy | null)[][] {
    const board: (Candy | null)[][] = [];

    for (let row = 0; row < config.rows; row++) {
        board[row] = [];
        for (let col = 0; col < config.cols; col++) {
            board[row][col] = createNonMatchingCandy(board, row, col, config);
        }
    }

    return board;
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        board: createBoard(config),
        selected: null,
        status: 'idle',
        score: 0,
        highScore: 0,
        movesLeft: config.initialMoves,
        isAnimating: false,
    };
}

// Check if two positions are adjacent
export function areAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Swap two candies
export function swapCandies(
    board: (Candy | null)[][],
    pos1: Position,
    pos2: Position
): (Candy | null)[][] {
    const newBoard = board.map((row) => [...row]);
    const temp = newBoard[pos1.row][pos1.col];
    newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
    newBoard[pos2.row][pos2.col] = temp;
    return newBoard;
}

// Find all matches on the board
export function findMatches(board: (Candy | null)[][]): Position[][] {
    const matches: Position[][] = [];
    const rows = board.length;
    const cols = board[0].length;
    const matched = new Set<string>();

    // Check horizontal matches
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - 2; col++) {
            const type = board[row][col]?.type;
            if (!type) continue;

            let matchLength = 1;
            while (col + matchLength < cols && board[row][col + matchLength]?.type === type) {
                matchLength++;
            }

            if (matchLength >= 3) {
                const match: Position[] = [];
                for (let i = 0; i < matchLength; i++) {
                    const posKey = `${row},${col + i}`;
                    if (!matched.has(posKey)) {
                        match.push({ row, col: col + i });
                        matched.add(posKey);
                    }
                }
                if (match.length > 0) matches.push(match);
                col += matchLength - 1;
            }
        }
    }

    // Check vertical matches
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows - 2; row++) {
            const type = board[row][col]?.type;
            if (!type) continue;

            let matchLength = 1;
            while (row + matchLength < rows && board[row + matchLength][col]?.type === type) {
                matchLength++;
            }

            if (matchLength >= 3) {
                const match: Position[] = [];
                for (let i = 0; i < matchLength; i++) {
                    const posKey = `${row + i},${col}`;
                    if (!matched.has(posKey)) {
                        match.push({ row: row + i, col });
                        matched.add(posKey);
                    }
                }
                if (match.length > 0) matches.push(match);
                row += matchLength - 1;
            }
        }
    }

    return matches;
}

// Remove matched candies
export function removeMatches(
    board: (Candy | null)[][],
    matches: Position[][]
): (Candy | null)[][] {
    const newBoard = board.map((row) => [...row]);

    for (const match of matches) {
        for (const pos of match) {
            newBoard[pos.row][pos.col] = null;
        }
    }

    return newBoard;
}

// Drop candies to fill gaps
export function dropCandies(
    board: (Candy | null)[][],
    config: GameConfig = DEFAULT_CONFIG
): (Candy | null)[][] {
    const newBoard = board.map((row) => [...row]);
    const cols = board[0].length;

    for (let col = 0; col < cols; col++) {
        // Collect non-null candies from bottom to top
        const candies: Candy[] = [];
        for (let row = newBoard.length - 1; row >= 0; row--) {
            if (newBoard[row][col]) {
                candies.push(newBoard[row][col]!);
            }
        }

        // Fill column from bottom
        for (let row = newBoard.length - 1; row >= 0; row--) {
            if (candies.length > 0) {
                newBoard[row][col] = candies.shift()!;
            } else {
                newBoard[row][col] = createCandy(config);
            }
        }
    }

    return newBoard;
}

// Process a move
export function processMove(
    state: GameState,
    pos1: Position,
    pos2: Position,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    // Swap candies
    let newBoard = swapCandies(state.board, pos1, pos2);

    // Check for matches
    let matches = findMatches(newBoard);

    // If no matches, swap back
    if (matches.length === 0) {
        return {
            ...state,
            selected: null,
        };
    }

    // Process matches and cascades
    let totalScore = 0;
    let cascade = 0;

    while (matches.length > 0) {
        const matchedCandies = matches.flat().length;
        totalScore += matchedCandies * config.matchPoints * (cascade + 1);

        newBoard = removeMatches(newBoard, matches);
        newBoard = dropCandies(newBoard, config);
        matches = findMatches(newBoard);
        cascade++;
    }

    const newMovesLeft = state.movesLeft - 1;
    const newScore = state.score + totalScore;
    const newStatus = newMovesLeft <= 0 ? 'gameOver' : 'playing';

    return {
        ...state,
        board: newBoard,
        selected: null,
        score: newScore,
        highScore: Math.max(state.highScore, newScore),
        movesLeft: newMovesLeft,
        status: newStatus,
    };
}

// Select a candy
export function selectCandy(
    state: GameState,
    pos: Position,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing' || state.isAnimating) return state;

    // If nothing selected, select this candy
    if (!state.selected) {
        return {
            ...state,
            selected: pos,
        };
    }

    // If clicking same candy, deselect
    if (state.selected.row === pos.row && state.selected.col === pos.col) {
        return {
            ...state,
            selected: null,
        };
    }

    // If adjacent, try to swap
    if (areAdjacent(state.selected, pos)) {
        return processMove(state, state.selected, pos, config);
    }

    // Otherwise, select new candy
    return {
        ...state,
        selected: pos,
    };
}

// Start game
export function startGame(state: GameState): GameState {
    if (state.status === 'playing') return state;
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
        highScore: state.highScore,
    };
}

// Find a hint - returns two positions that can be swapped for a match
export function findHint(board: (Candy | null)[][]): [Position, Position] | null {
    const rows = board.length;
    const cols = board[0].length;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Try swapping with right neighbor
            if (col < cols - 1) {
                const testBoard = swapCandies(board, { row, col }, { row, col: col + 1 });
                if (findMatches(testBoard).length > 0) {
                    return [{ row, col }, { row, col: col + 1 }];
                }
            }

            // Try swapping with bottom neighbor
            if (row < rows - 1) {
                const testBoard = swapCandies(board, { row, col }, { row: row + 1, col });
                if (findMatches(testBoard).length > 0) {
                    return [{ row, col }, { row: row + 1, col }];
                }
            }
        }
    }

    return null;
}
