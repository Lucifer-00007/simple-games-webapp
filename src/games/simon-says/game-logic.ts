// Simon Says game logic

import { GameState, Color, GameConfig, DEFAULT_CONFIG } from './types';

// Get random color
export function getRandomColor(colors: Color[]): Color {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Create initial game state
export function createInitialState(): GameState {
    return {
        sequence: [],
        playerSequence: [],
        status: 'idle',
        score: 0,
        highScore: 0,
        activeColor: null,
        currentShowIndex: 0,
    };
}

// Start new game
export function startGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const firstColor = getRandomColor(config.colors);
    return {
        ...state,
        sequence: [firstColor],
        playerSequence: [],
        status: 'showingSequence',
        score: 0,
        activeColor: null,
        currentShowIndex: 0,
    };
}

// Add to sequence for next round
export function addToSequence(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newColor = getRandomColor(config.colors);
    return {
        ...state,
        sequence: [...state.sequence, newColor],
        playerSequence: [],
        status: 'showingSequence',
        currentShowIndex: 0,
    };
}

// Player makes a move
export function playerMove(state: GameState, color: Color): GameState {
    if (state.status !== 'playerTurn') return state;

    const expectedColor = state.sequence[state.playerSequence.length];

    if (color !== expectedColor) {
        // Wrong!
        return {
            ...state,
            status: 'gameOver',
            highScore: Math.max(state.highScore, state.score),
        };
    }

    const newPlayerSequence = [...state.playerSequence, color];

    // Check if player completed the sequence
    if (newPlayerSequence.length === state.sequence.length) {
        return {
            ...state,
            playerSequence: newPlayerSequence,
            score: state.score + 1,
            status: 'showingSequence', // Will add to sequence
        };
    }

    return {
        ...state,
        playerSequence: newPlayerSequence,
    };
}

// Set active color (for showing sequence)
export function setActiveColor(state: GameState, color: Color | null): GameState {
    return {
        ...state,
        activeColor: color,
    };
}

// Start player turn
export function startPlayerTurn(state: GameState): GameState {
    return {
        ...state,
        status: 'playerTurn',
        playerSequence: [],
        activeColor: null,
    };
}

// Reset game
export function resetGame(state: GameState): GameState {
    return {
        ...createInitialState(),
        highScore: state.highScore,
    };
}
