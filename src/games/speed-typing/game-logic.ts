// Speed Typing game logic

import { GameState, SAMPLE_TEXTS } from './types';

export function getRandomText(): string {
    return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

export function createInitialState(): GameState {
    return {
        text: getRandomText(),
        typedText: '',
        startTime: null,
        endTime: null,
        status: 'idle',
        errors: 0,
        wpm: 0,
        accuracy: 100,
    };
}

export function startGame(state: GameState): GameState {
    return {
        ...state,
        status: 'playing',
        startTime: Date.now(),
        typedText: '',
        errors: 0,
    };
}

export function calculateWPM(text: string, startTime: number, endTime: number): number {
    const words = text.trim().split(/\s+/).length;
    const minutes = (endTime - startTime) / 1000 / 60;
    return Math.round(words / minutes);
}

export function calculateAccuracy(text: string, typedText: string): number {
    if (typedText.length === 0) return 100;
    let correct = 0;
    const minLen = Math.min(text.length, typedText.length);
    for (let i = 0; i < minLen; i++) {
        if (text[i] === typedText[i]) correct++;
    }
    return Math.round((correct / typedText.length) * 100);
}

export function countErrors(text: string, typedText: string): number {
    let errors = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (text[i] !== typedText[i]) errors++;
    }
    return errors;
}

export function typeCharacter(state: GameState, newTypedText: string): GameState {
    if (state.status !== 'playing') return state;

    const errors = countErrors(state.text, newTypedText);
    const accuracy = calculateAccuracy(state.text, newTypedText);

    // Calculate WPM in real-time
    let wpm = 0;
    if (state.startTime) {
        const elapsed = (Date.now() - state.startTime) / 1000 / 60;
        if (elapsed > 0) {
            const words = newTypedText.trim().split(/\s+/).filter(w => w).length;
            wpm = Math.round(words / elapsed);
        }
    }

    // Check if finished
    if (newTypedText.length >= state.text.length) {
        const endTime = Date.now();
        const finalWpm = calculateWPM(newTypedText, state.startTime!, endTime);
        return {
            ...state,
            typedText: newTypedText,
            errors,
            accuracy,
            wpm: finalWpm,
            status: 'finished',
            endTime,
        };
    }

    return {
        ...state,
        typedText: newTypedText,
        errors,
        accuracy,
        wpm,
    };
}

export function resetGame(): GameState {
    return {
        ...createInitialState(),
        text: getRandomText(),
    };
}
