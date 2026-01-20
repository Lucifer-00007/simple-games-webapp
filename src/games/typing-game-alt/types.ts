// Typing Game Alt - Simplified falling words game
export type GameStatus = 'idle' | 'playing' | 'gameOver';

export interface Word { text: string; y: number; speed: number; id: string; }

export interface GameState {
    words: Word[];
    currentInput: string;
    status: GameStatus;
    score: number;
    highScore: number;
    lives: number;
}

export const WORD_LIST = ['cat', 'dog', 'fish', 'bird', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'cow', 'pig', 'horse'];

let wordId = 0;

export function createInitialState(): GameState {
    return { words: [], currentInput: '', status: 'idle', score: 0, highScore: 0, lives: 3 };
}

export function spawnWord(): Word {
    return { text: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)], y: 0, speed: 1, id: `word-${wordId++}` };
}

export function updateGame(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    let words = state.words.map(w => ({ ...w, y: w.y + w.speed }));
    let lives = state.lives;

    // Remove words that reached bottom
    words = words.filter(w => {
        if (w.y > 400) {
            lives--;
            return false;
        }
        return true;
    });

    // Spawn new word occasionally
    if (Math.random() < 0.02 && words.length < 5) {
        words.push(spawnWord());
    }

    const status = lives <= 0 ? 'gameOver' : 'playing';

    return { ...state, words, lives, status, highScore: Math.max(state.highScore, state.score) };
}

export function typeCharacter(state: GameState, char: string): GameState {
    if (state.status !== 'playing') return state;

    const newInput = state.currentInput + char;
    let words = [...state.words];
    let score = state.score;

    // Check if any word matches
    const matchIndex = words.findIndex(w => w.text === newInput);
    if (matchIndex !== -1) {
        words.splice(matchIndex, 1);
        score += newInput.length * 10;
        return { ...state, words, currentInput: '', score };
    }

    return { ...state, currentInput: newInput };
}

export function startGame(state: GameState): GameState { return { ...state, status: 'playing', words: [spawnWord()] }; }
export function resetGame(state: GameState): GameState { return { ...createInitialState(), highScore: state.highScore }; }
