// Speed Typing game types

export type GameStatus = 'idle' | 'playing' | 'finished';

export interface GameState {
    text: string;
    typedText: string;
    startTime: number | null;
    endTime: number | null;
    status: GameStatus;
    errors: number;
    wpm: number;
    accuracy: number;
}

export interface GameConfig {
    timeLimit: number; // seconds, 0 = no limit
}

export const DEFAULT_CONFIG: GameConfig = {
    timeLimit: 60,
};

export const SAMPLE_TEXTS = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
    "Programming is the art of telling a computer what to do through a carefully crafted sequence of instructions.",
    "JavaScript is a versatile programming language that powers interactive websites and modern web applications.",
    "React makes it painless to create interactive user interfaces with reusable components and efficient updates.",
    "TypeScript adds static typing to JavaScript, helping developers catch errors early and write more maintainable code.",
    "The best way to predict the future is to create it. Innovation distinguishes between a leader and a follower.",
    "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
    "Code is like humor. When you have to explain it, it is bad. Clean code reads like well-written prose.",
];
