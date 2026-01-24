// Tetris game logic - pure functions, no React/DOM

import {
    Position,
    Tetromino,
    TetrominoType,
    GameState,
    GameConfig,
    DEFAULT_CONFIG,
    TETROMINOES,
    TETROMINO_TYPES,
} from './types';

// Generate a random tetromino
export function generateTetromino(config: GameConfig = DEFAULT_CONFIG): Tetromino {
    const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
    const { shape, color } = TETROMINOES[type];
    return {
        type,
        shape: shape.map(row => [...row]),
        position: {
            x: Math.floor((config.boardWidth - shape[0].length) / 2),
            y: 0,
        },
        color,
    };
}

// Create empty board
export function createEmptyBoard(config: GameConfig = DEFAULT_CONFIG): (string | null)[][] {
    return Array(config.boardHeight)
        .fill(null)
        .map(() => Array(config.boardWidth).fill(null));
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        board: createEmptyBoard(config),
        currentPiece: null,
        nextPiece: generateTetromino(config),
        ghostPosition: null,
        status: 'idle',
        score: 0,
        highScore: 0,
        level: 1,
        linesCleared: 0,
    };
}

// Check if position is valid
export function isValidPosition(
    piece: Tetromino,
    board: (string | null)[][],
    offsetX: number = 0,
    offsetY: number = 0,
    config: GameConfig = DEFAULT_CONFIG
): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.position.x + x + offsetX;
                const newY = piece.position.y + y + offsetY;

                // Check bounds
                if (newX < 0 || newX >= config.boardWidth || newY >= config.boardHeight) {
                    return false;
                }

                // Check collision with placed pieces (only if within board)
                if (newY >= 0 && board[newY][newX] !== null) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Rotate tetromino (clockwise)
export function rotatePiece(piece: Tetromino): Tetromino {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const rotated: number[][] = [];

    for (let x = 0; x < cols; x++) {
        rotated[x] = [];
        for (let y = rows - 1; y >= 0; y--) {
            rotated[x][rows - 1 - y] = piece.shape[y][x];
        }
    }

    return {
        ...piece,
        shape: rotated,
    };
}

// Try to rotate with wall kicks
export function tryRotate(
    piece: Tetromino,
    board: (string | null)[][],
    config: GameConfig = DEFAULT_CONFIG
): Tetromino | null {
    const rotated = rotatePiece(piece);

    // Wall kick offsets to try
    const kicks = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -2, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: -1 },
    ];

    for (const kick of kicks) {
        const kicked = {
            ...rotated,
            position: {
                x: rotated.position.x + kick.x,
                y: rotated.position.y + kick.y,
            },
        };
        if (isValidPosition(kicked, board, 0, 0, config)) {
            return kicked;
        }
    }

    return null;
}

// Move piece
export function movePiece(
    state: GameState,
    dx: number,
    dy: number,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing' || !state.currentPiece) return state;

    if (isValidPosition(state.currentPiece, state.board, dx, dy, config)) {
        const newPiece = {
            ...state.currentPiece,
            position: {
                x: state.currentPiece.position.x + dx,
                y: state.currentPiece.position.y + dy,
            },
        };
        return {
            ...state,
            currentPiece: newPiece,
            ghostPosition: calculateGhostPosition(newPiece, state.board, config),
        };
    }

    return state;
}

// Calculate ghost piece position
export function calculateGhostPosition(
    piece: Tetromino,
    board: (string | null)[][],
    config: GameConfig = DEFAULT_CONFIG
): Position {
    let ghostY = piece.position.y;
    while (isValidPosition(piece, board, 0, ghostY - piece.position.y + 1, config)) {
        ghostY++;
    }
    return { x: piece.position.x, y: ghostY };
}

// Hard drop
export function hardDrop(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing' || !state.currentPiece) return state;

    let dropDistance = 0;
    while (isValidPosition(state.currentPiece, state.board, 0, dropDistance + 1, config)) {
        dropDistance++;
    }

    const droppedPiece = {
        ...state.currentPiece,
        position: {
            ...state.currentPiece.position,
            y: state.currentPiece.position.y + dropDistance,
        },
    };

    return lockPiece(
        {
            ...state,
            currentPiece: droppedPiece,
            score: state.score + dropDistance * 2,
        },
        config
    );
}

// Lock piece to board
export function lockPiece(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (!state.currentPiece) return state;

    const newBoard = state.board.map(row => [...row]);

    // Place piece on board
    for (let y = 0; y < state.currentPiece.shape.length; y++) {
        for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
            if (state.currentPiece.shape[y][x]) {
                const boardY = state.currentPiece.position.y + y;
                const boardX = state.currentPiece.position.x + x;
                if (boardY >= 0 && boardY < config.boardHeight) {
                    newBoard[boardY][boardX] = state.currentPiece.color;
                }
            }
        }
    }

    // Check for completed lines
    const { clearedBoard, linesCleared } = clearLines(newBoard, config);

    // Calculate score
    const lineScores = [0, 100, 300, 500, 800];
    const scoreIncrease = lineScores[linesCleared] * state.level;

    const totalLinesCleared = state.linesCleared + linesCleared;
    const newLevel = Math.floor(totalLinesCleared / 10) + 1;

    // Spawn next piece
    const newCurrentPiece = state.nextPiece;
    const newNextPiece = generateTetromino(config);

    // Check game over
    if (newCurrentPiece && !isValidPosition(newCurrentPiece, clearedBoard, 0, 0, config)) {
        return {
            ...state,
            board: clearedBoard,
            currentPiece: null,
            status: 'gameOver',
            highScore: Math.max(state.highScore, state.score + scoreIncrease),
            score: state.score + scoreIncrease,
        };
    }

    return {
        ...state,
        board: clearedBoard,
        currentPiece: newCurrentPiece,
        nextPiece: newNextPiece,
        ghostPosition: newCurrentPiece
            ? calculateGhostPosition(newCurrentPiece, clearedBoard, config)
            : null,
        score: state.score + scoreIncrease,
        linesCleared: totalLinesCleared,
        level: newLevel,
    };
}

// Clear completed lines
export function clearLines(
    board: (string | null)[][],
    config: GameConfig = DEFAULT_CONFIG
): { clearedBoard: (string | null)[][]; linesCleared: number } {
    const newBoard = board.filter(row => row.some(cell => cell === null));
    const linesCleared = config.boardHeight - newBoard.length;

    // Add empty rows at top
    while (newBoard.length < config.boardHeight) {
        newBoard.unshift(Array(config.boardWidth).fill(null));
    }

    return { clearedBoard: newBoard, linesCleared };
}

// Gravity tick
export function tick(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing' || !state.currentPiece) return state;

    if (isValidPosition(state.currentPiece, state.board, 0, 1, config)) {
        return movePiece(state, 0, 1, config);
    } else {
        return lockPiece(state, config);
    }
}

// Rotate current piece
export function rotate(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing' || !state.currentPiece) return state;

    const rotated = tryRotate(state.currentPiece, state.board, config);
    if (rotated) {
        return {
            ...state,
            currentPiece: rotated,
            ghostPosition: calculateGhostPosition(rotated, state.board, config),
        };
    }

    return state;
}

// Start game
export function startGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const currentPiece = state.nextPiece || generateTetromino(config);
    const nextPiece = generateTetromino(config);

    return {
        ...state,
        board: createEmptyBoard(config),
        currentPiece,
        nextPiece,
        ghostPosition: calculateGhostPosition(currentPiece, createEmptyBoard(config), config),
        status: 'playing',
        score: 0,
        level: 1,
        linesCleared: 0,
    };
}

// Toggle pause
export function togglePause(state: GameState): GameState {
    if (state.status === 'playing') {
        return { ...state, status: 'paused' };
    }
    if (state.status === 'paused') {
        return { ...state, status: 'playing' };
    }
    return state;
}

// Reset game
export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newState = createInitialState(config);
    return {
        ...newState,
        highScore: state.highScore,
    };
}

// Get current speed based on level
export function getSpeed(level: number, config: GameConfig = DEFAULT_CONFIG): number {
    return Math.max(100, config.initialSpeed * Math.pow(config.speedMultiplier, level - 1));
}
