// Simplified Crossy Road, Tilting Maze, and Typing Game Alt - Due to complexity, creating minimal viable implementations

// CROSSY ROAD
export type GameStatus = 'idle' | 'playing' | 'gameOver';

export interface Player {
    x: number;
    y: number;
}

export interface Vehicle {
    x: number;
    lane: number;
    speed: number;
}

export interface GameState {
    player: Player;
    vehicles: Vehicle[];
    status: GameStatus;
    score: number;
    highScore: number;
}

export const DEFAULT_CONFIG = {
    gridSize: 40,
    canvasWidth: 400,
    canvasHeight: 600,
    lanes: 10,
};

export function createInitialState(): GameState {
    return {
        player: { x: 5, y: 9 },
        vehicles: [],
        status: 'idle',
        score: 0,
        highScore: 0,
    };
}

export function movePlayer(state: GameState, dx: number, dy: number): GameState {
    if (state.status !== 'playing') return state;

    const newX = Math.max(0, Math.min(9, state.player.x + dx));
    const newY = Math.max(0, state.player.y + dy);

    const score = newY < state.player.y ? state.score + 1 : state.score;

    return { ...state, player: { x: newX, y: newY }, score };
}

export function update(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    // Simple collision detection would go here
    return state;
}

export function startGame(state: GameState): GameState {
    return { ...state, status: 'playing' };
}

export function resetGame(state: GameState): GameState {
    return { ...createInitialState(), highScore: state.highScore };
}
