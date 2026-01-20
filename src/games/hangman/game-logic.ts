// Hangman game logic - pure functions

import { GameState, GameConfig, WORDS, DEFAULT_CONFIG } from './types';

// Get random word
export function getRandomWord(): { word: string; hint: string } {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    const { word, hint } = getRandomWord();
    return {
        word: word.toUpperCase(),
        guessedLetters: new Set<string>(),
        wrongGuesses: 0,
        maxWrongGuesses: config.maxWrongGuesses,
        status: 'playing',
        hint,
    };
}

// Check if letter is in the word
export function isLetterInWord(word: string, letter: string): boolean {
    return word.includes(letter.toUpperCase());
}

// Check if word is complete
export function isWordComplete(word: string, guessedLetters: Set<string>): boolean {
    return word.split('').every(letter => guessedLetters.has(letter));
}

// Get display word (with blanks)
export function getDisplayWord(word: string, guessedLetters: Set<string>): string[] {
    return word.split('').map(letter =>
        guessedLetters.has(letter) ? letter : '_'
    );
}

// Make a guess
export function makeGuess(state: GameState): GameState {
    return state; // Return as-is, actual implementation in guessLetter
}

// Guess a letter
export function guessLetter(state: GameState, letter: string): GameState {
    if (state.status !== 'playing') return state;

    const normalizedLetter = letter.toUpperCase();

    // Already guessed this letter
    if (state.guessedLetters.has(normalizedLetter)) return state;

    const newGuessedLetters = new Set(state.guessedLetters);
    newGuessedLetters.add(normalizedLetter);

    const isCorrect = isLetterInWord(state.word, normalizedLetter);
    const newWrongGuesses = isCorrect ? state.wrongGuesses : state.wrongGuesses + 1;

    // Check win/lose
    let status: 'playing' | 'won' | 'lost' = state.status;
    if (isWordComplete(state.word, newGuessedLetters)) {
        status = 'won';
    } else if (newWrongGuesses >= state.maxWrongGuesses) {
        status = 'lost';
    }

    return {
        ...state,
        guessedLetters: newGuessedLetters,
        wrongGuesses: newWrongGuesses,
        status,
    };
}

// Get wrong letters
export function getWrongLetters(word: string, guessedLetters: Set<string>): string[] {
    return Array.from(guessedLetters).filter(letter => !isLetterInWord(word, letter));
}

// Reset game
export function resetGame(config: GameConfig = DEFAULT_CONFIG): GameState {
    return createInitialState(config);
}
