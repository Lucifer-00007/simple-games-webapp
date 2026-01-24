// Archery game logic

import { GameState, GameConfig, DEFAULT_CONFIG } from './types';

export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        score: 0,
        highScore: 0,
        arrowsLeft: config.totalArrows,
        status: 'idle',
    };
}

export function calculateHitScore(distance: number, config: GameConfig = DEFAULT_CONFIG): number {
    // Distance from target center
    if (distance < 20) return config.bullseyePoints; // Bullseye
    if (distance < 40) return config.hitPoints; // Hit
    return 0; // Miss
}

export function updateScore(state: GameState, points: number): GameState {
    const newScore = state.score + points;
    return {
        ...state,
        score: newScore,
        highScore: Math.max(state.highScore, newScore),
    };
}

export function shootArrow(state: GameState): GameState {
    if (state.arrowsLeft <= 0) return state;

    return {
        ...state,
        arrowsLeft: state.arrowsLeft - 1,
        status: state.arrowsLeft <= 1 ? 'gameOver' : 'idle',
    };
}

export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        ...createInitialState(config),
        highScore: state.highScore,
    };
}
