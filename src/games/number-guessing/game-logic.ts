// Number Guessing game logic - pure functions, no React/DOM

import { GameState, GameConfig, HintDirection, DEFAULT_CONFIG } from './types';

// Generate a random secret number within the given range
export function generateSecretNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        secretNumber: generateSecretNumber(config.minNumber, config.maxNumber),
        guess: null,
        attempts: 0,
        maxAttempts: config.maxAttempts,
        hint: null,
        status: 'playing',
        guessHistory: [],
    };
}

// Check a guess and return the hint direction
export function checkGuess(guess: number, secret: number): HintDirection {
    if (guess === secret) return null;
    return guess < secret ? 'higher' : 'lower';
}

// Validate if a guess is within valid range
export function isValidGuess(guess: number, min: number, max: number): boolean {
    return !isNaN(guess) && guess >= min && guess <= max;
}

// Make a guess and return new game state
export function makeGuess(state: GameState, guess: number, config: GameConfig = DEFAULT_CONFIG): GameState {
    // Can't guess if game is over
    if (state.status !== 'playing') {
        return state;
    }

    // Validate guess
    if (!isValidGuess(guess, config.minNumber, config.maxNumber)) {
        return state;
    }

    const newAttempts = state.attempts + 1;
    const isCorrect = guess === state.secretNumber;
    const isGameOver = newAttempts >= state.maxAttempts && !isCorrect;

    return {
        ...state,
        guess,
        attempts: newAttempts,
        hint: isCorrect ? null : checkGuess(guess, state.secretNumber),
        status: isCorrect ? 'won' : isGameOver ? 'lost' : 'playing',
        guessHistory: [...state.guessHistory, guess],
    };
}

// Get remaining attempts
export function getRemainingAttempts(state: GameState): number {
    return state.maxAttempts - state.attempts;
}

// Get hint message based on game state
export function getHintMessage(state: GameState): string {
    if (state.status === 'won') {
        return `🎉 Congratulations! You guessed it in ${state.attempts} attempt${state.attempts === 1 ? '' : 's'}!`;
    }
    if (state.status === 'lost') {
        return `😢 Game Over! The number was ${state.secretNumber}`;
    }
    if (state.hint === 'higher') {
        return '📈 Go Higher!';
    }
    if (state.hint === 'lower') {
        return '📉 Go Lower!';
    }
    return 'Enter a number and click Guess!';
}
