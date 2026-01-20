// Hangman game types

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
    word: string;
    guessedLetters: Set<string>;
    wrongGuesses: number;
    maxWrongGuesses: number;
    status: GameStatus;
    hint: string;
}

export interface GameConfig {
    maxWrongGuesses: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    maxWrongGuesses: 6,
};

// Word list with hints
export const WORDS: { word: string; hint: string }[] = [
    { word: 'JAVASCRIPT', hint: 'Programming language for the web' },
    { word: 'PYTHON', hint: 'Named after a comedy group' },
    { word: 'DEVELOPER', hint: 'Someone who writes code' },
    { word: 'ALGORITHM', hint: 'Step-by-step problem solving' },
    { word: 'KEYBOARD', hint: 'Input device with keys' },
    { word: 'MONITOR', hint: 'Display screen' },
    { word: 'COMPUTER', hint: 'Electronic calculating machine' },
    { word: 'INTERNET', hint: 'Global network of computers' },
    { word: 'BROWSER', hint: 'Used to view websites' },
    { word: 'DATABASE', hint: 'Organized data storage' },
    { word: 'FUNCTION', hint: 'Reusable block of code' },
    { word: 'VARIABLE', hint: 'Named storage for data' },
    { word: 'BOOLEAN', hint: 'True or false value' },
    { word: 'ARRAY', hint: 'Ordered list of items' },
    { word: 'OBJECT', hint: 'Key-value data structure' },
    { word: 'REACT', hint: 'Popular UI library' },
    { word: 'COMPONENT', hint: 'Reusable UI piece' },
    { word: 'FRAMEWORK', hint: 'Structure for building apps' },
    { word: 'DEBUGGING', hint: 'Finding and fixing errors' },
    { word: 'TERMINAL', hint: 'Command line interface' },
];
