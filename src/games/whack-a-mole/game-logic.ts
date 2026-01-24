// Whack-A-Mole game logic - pure functions

import { GameState, GameConfig, DEFAULT_CONFIG } from './types';

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        activeMole: null,
        score: 0,
        highScore: 0,
        timeLeft: config.gameDuration,
        status: 'idle',
        hits: 0,
        misses: 0,
    };
}

// Generate random mole position
export function generateMolePosition(gridSize: number, currentPosition: number | null): number {
    let newPosition: number;
    do {
        newPosition = Math.floor(Math.random() * gridSize);
    } while (newPosition === currentPosition);
    return newPosition;
}

// Whack a mole
export function whackMole(state: GameState, position: number): GameState {
    if (state.status !== 'playing') return state;

    if (position === state.activeMole) {
        // Hit!
        return {
            ...state,
            score: state.score + 10,
            hits: state.hits + 1,
            activeMole: null,
        };
    } else {
        // Miss!
        return {
            ...state,
            misses: state.misses + 1,
            score: Math.max(0, state.score - 5),
        };
    }
}

// Start game
export function startGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        ...state,
        status: 'playing',
        score: 0,
        timeLeft: config.gameDuration,
        hits: 0,
        misses: 0,
        activeMole: generateMolePosition(config.gridSize, null),
    };
}

// Tick timer
export function tick(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    const newTimeLeft = state.timeLeft - 1;
    if (newTimeLeft <= 0) {
        return {
            ...state,
            timeLeft: 0,
            status: 'finished',
            activeMole: null,
            highScore: Math.max(state.highScore, state.score),
        };
    }

    return {
        ...state,
        timeLeft: newTimeLeft,
    };
}

// Show new mole
export function showNewMole(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;
    return {
        ...state,
        activeMole: generateMolePosition(config.gridSize, state.activeMole),
    };
}

// Hide mole
export function hideMole(state: GameState): GameState {
    if (state.status !== 'playing') return state;
    return {
        ...state,
        activeMole: null,
    };
}

// Reset game
export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        ...createInitialState(config),
        highScore: state.highScore,
    };
}
