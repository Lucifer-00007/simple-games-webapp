// Typing Game Alt - Simplified falling words game
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface Word { 
    text: string; 
    y: number; 
    x: number; 
    speed: number; 
    id: string; 
}

export interface GameState {
    words: Word[];
    currentInput: string;
    status: GameStatus;
    score: number;
    highScore: number;
    lives: number;
    speedLevel: number;
}

export const WORD_LIST = ['cat', 'dog', 'fish', 'bird', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'cow', 'pig', 'horse', 'zebra', 'mouse', 'duck', 'goose', 'owl', 'frog', 'toad', 'crab', 'seal', 'whale', 'shark'];

let wordId = 0;

export function createInitialState(): GameState {
    return { 
        words: [], 
        currentInput: '', 
        status: 'idle', 
        score: 0, 
        highScore: 0, 
        lives: 3,
        speedLevel: 3 
    };
}

export function spawnWord(speedLevel: number): Word {
    const baseSpeed = 0.5 + (speedLevel * 0.2);
    return { 
        text: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)], 
        y: 0, 
        x: Math.random() * 80 + 5, // 5% to 85%
        speed: baseSpeed + Math.random() * 0.5, 
        id: `word-${wordId++}` 
    };
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
    const spawnRate = 0.02 + (state.speedLevel * 0.002);
    if (Math.random() < spawnRate && words.length < 3 + state.speedLevel) {
        words.push(spawnWord(state.speedLevel));
    }

    const status = lives <= 0 ? 'gameOver' : 'playing';

    return { ...state, words, lives, status, highScore: Math.max(state.highScore, state.score) };
}

export function checkInput(state: GameState, newInput: string): GameState {
    if (state.status !== 'playing') return state;

    const words = [...state.words];
    let score = state.score;
    let matched = false;

    // Check if any word matches
    const matchIndex = words.findIndex(w => w.text === newInput.trim().toLowerCase());
    if (matchIndex !== -1) {
        words.splice(matchIndex, 1);
        score += newInput.trim().length * 10;
        matched = true;
    }

    return { 
        ...state, 
        words, 
        currentInput: matched ? '' : newInput, 
        score 
    };
}

export function startGame(state: GameState): GameState { 
    return { 
        ...state, 
        status: 'playing', 
        words: [spawnWord(state.speedLevel)],
        score: 0,
        lives: 3,
        currentInput: ''
    }; 
}

export function pauseGame(state: GameState): GameState {
    if (state.status !== 'playing') return state;
    return { ...state, status: 'paused' };
}

export function resumeGame(state: GameState): GameState {
    if (state.status !== 'paused') return state;
    return { ...state, status: 'playing' };
}

export function resetGame(state: GameState): GameState { 
    return { 
        ...createInitialState(), 
        highScore: state.highScore,
        speedLevel: state.speedLevel 
    }; 
}
