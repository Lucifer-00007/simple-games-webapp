// Tower Blocks game - All files in one (types, logic, component, styles, index)

// ===== types.ts =====
export type GameStatus = 'idle' | 'playing' | 'gameOver';

export interface Block {
    x: number;
    width: number;
    moving: boolean;
    direction: number;
}

export interface GameState {
    blocks: Block[];
    currentBlock: Block;
    status: GameStatus;
    score: number;
    highScore: number;
    speed: number;
}

export const DEFAULT_CONFIG = {
    canvasWidth: 300,
    canvasHeight: 500,
    blockHeight: 30,
    initialWidth: 150,
    initialSpeed: 2,
};

// ===== game-logic.ts =====
export function createInitialState(): GameState {
    return {
        blocks: [
            { x: (DEFAULT_CONFIG.canvasWidth - DEFAULT_CONFIG.initialWidth) / 2, width: DEFAULT_CONFIG.initialWidth, moving: false, direction: 1 },
        ],
        currentBlock: {
            x: 0,
            width: DEFAULT_CONFIG.initialWidth,
            moving: true,
            direction: 1,
        },
        status: 'idle',
        score: 0,
        highScore: 0,
        speed: DEFAULT_CONFIG.initialSpeed,
    };
}

export function startGame(state: GameState): GameState {
    return { ...state, status: 'playing' };
}

export function updateBlock(state: GameState): GameState {
    if (state.status !== 'playing' || !state.currentBlock.moving) return state;

    let newX = state.currentBlock.x + state.speed * state.currentBlock.direction;
    let newDirection = state.currentBlock.direction;

    if (newX <= 0 || newX + state.currentBlock.width >= DEFAULT_CONFIG.canvasWidth) {
        newDirection = -newDirection;
        newX = Math.max(0, Math.min(DEFAULT_CONFIG.canvasWidth - state.currentBlock.width, newX));
    }

    return {
        ...state,
        currentBlock: { ...state.currentBlock, x: newX, direction: newDirection },
    };
}

export function dropBlock(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    const lastBlock = state.blocks[state.blocks.length - 1];
    const overlap = Math.max(
        0,
        Math.min(state.currentBlock.x + state.currentBlock.width, lastBlock.x + lastBlock.width) -
        Math.max(state.currentBlock.x, lastBlock.x)
    );

    if (overlap === 0) {
        return { ...state, status: 'gameOver', highScore: Math.max(state.highScore, state.score) };
    }

    const newWidth = overlap;
    const newX = Math.max(state.currentBlock.x, lastBlock.x);

    return {
        ...state,
        blocks: [...state.blocks, { x: newX, width: newWidth, moving: false, direction: 1 }],
        currentBlock: {
            x: 0,
            width: newWidth,
            moving: true,
            direction: 1,
        },
        score: state.score + 1,
        speed: state.speed * 1.02,
    };
}

export function resetGame(state: GameState): GameState {
    const newState = createInitialState();
    return { ...newState, highScore: state.highScore };
}

// ===== Component will be created separately =====
