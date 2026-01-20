// Emoji Catcher game logic

import { GameState, FallingEmoji, GameConfig, EMOJIS, DEFAULT_CONFIG } from './types';

let nextId = 0;

// Create initial game state
export function createInitialState(): GameState {
    return {
        emojis: [],
        score: 0,
        highScore: 0,
        timeLeft: DEFAULT_CONFIG.gameDuration,
        status: 'idle',
        missed: 0,
        caught: 0,
    };
}

// Get random emoji
export function getRandomEmoji(): string {
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

// Spawn a new emoji
export function spawnEmoji(state: GameState, containerWidth: number): GameState {
    if (state.status !== 'playing') return state;
    if (state.emojis.length >= DEFAULT_CONFIG.maxEmojis) return state;

    const newEmoji: FallingEmoji = {
        id: nextId++,
        emoji: getRandomEmoji(),
        x: Math.random() * (containerWidth - 50),
        y: -50,
        speed: DEFAULT_CONFIG.baseSpeed + Math.random() * 2,
    };

    return {
        ...state,
        emojis: [...state.emojis, newEmoji],
    };
}

// Update emoji positions
export function updateEmojis(state: GameState, containerHeight: number): GameState {
    if (state.status !== 'playing') return state;

    let missed = 0;
    const updatedEmojis = state.emojis
        .map((emoji) => ({
            ...emoji,
            y: emoji.y + emoji.speed,
        }))
        .filter((emoji) => {
            if (emoji.y > containerHeight) {
                missed++;
                return false;
            }
            return true;
        });

    return {
        ...state,
        emojis: updatedEmojis,
        missed: state.missed + missed,
    };
}

// Catch an emoji
export function catchEmoji(state: GameState, emojiId: number): GameState {
    if (state.status !== 'playing') return state;

    const emojiIndex = state.emojis.findIndex((e) => e.id === emojiId);
    if (emojiIndex === -1) return state;

    const emoji = state.emojis[emojiIndex];
    const points = emoji.emoji === '⭐' || emoji.emoji === '💎' || emoji.emoji === '🌟' ? 20 : 10;

    return {
        ...state,
        emojis: state.emojis.filter((e) => e.id !== emojiId),
        score: state.score + points,
        caught: state.caught + 1,
    };
}

// Start game
export function startGame(state: GameState): GameState {
    nextId = 0;
    return {
        ...state,
        emojis: [],
        score: 0,
        timeLeft: DEFAULT_CONFIG.gameDuration,
        status: 'playing',
        missed: 0,
        caught: 0,
    };
}

// Tick timer
export function tick(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    const newTimeLeft = state.timeLeft - 1;
    if (newTimeLeft <= 0) {
        return {
            ...state,
            timeLeft: 0,
            status: 'finished',
            emojis: [],
            highScore: Math.max(state.highScore, state.score),
        };
    }

    return {
        ...state,
        timeLeft: newTimeLeft,
    };
}

// Reset game
export function resetGame(state: GameState): GameState {
    return {
        ...createInitialState(),
        highScore: state.highScore,
    };
}
