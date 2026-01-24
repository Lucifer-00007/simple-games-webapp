// Insect Catch game logic

import { GameState, Insect, GameConfig, INSECTS, DEFAULT_CONFIG } from './types';

let nextId = 0;

export function createInitialState(): GameState {
    return {
        insects: [],
        selectedInsect: '',
        score: 0,
        highScore: 0,
        timeLeft: DEFAULT_CONFIG.gameDuration,
        status: 'idle',
    };
}

export function selectInsect(state: GameState, insectEmoji: string): GameState {
    return {
        ...state,
        selectedInsect: insectEmoji,
        status: 'playing',
        timeLeft: DEFAULT_CONFIG.gameDuration,
        score: 0,
        insects: [],
    };
}

export function spawnInsect(state: GameState, width: number, height: number): GameState {
    if (state.status !== 'playing') return state;
    if (state.insects.length >= DEFAULT_CONFIG.maxInsects) return state;

    const insect = INSECTS.find(i => i.emoji === state.selectedInsect) || INSECTS[0];
    const newInsect: Insect = {
        id: nextId++,
        type: insect.emoji,
        x: Math.random() * (width - 60) + 30,
        y: Math.random() * (height - 60) + 30,
    };

    return {
        ...state,
        insects: [...state.insects, newInsect],
    };
}

export function catchInsect(state: GameState, insectId: number): GameState {
    if (state.status !== 'playing') return state;

    const insect = state.insects.find(i => i.id === insectId);
    if (!insect) return state;

    const insectData = INSECTS.find(i => i.emoji === insect.type);
    const points = insectData?.points || 10;

    return {
        ...state,
        insects: state.insects.filter(i => i.id !== insectId),
        score: state.score + points,
    };
}

export function tick(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    const newTimeLeft = state.timeLeft - 1;
    if (newTimeLeft <= 0) {
        return {
            ...state,
            timeLeft: 0,
            status: 'finished',
            insects: [],
            highScore: Math.max(state.highScore, state.score),
        };
    }

    return { ...state, timeLeft: newTimeLeft };
}

export function resetGame(state: GameState): GameState {
    nextId = 0;
    return {
        ...createInitialState(),
        highScore: state.highScore,
        status: 'selecting',
    };
}

export function startSelecting(state: GameState): GameState {
    return { ...state, status: 'selecting' };
}
