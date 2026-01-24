// Memory Card game types

export interface Card {
    id: number;
    pairId: number;
    emoji: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export interface GameState {
    cards: Card[];
    flippedCards: number[];
    matchedPairs: number;
    moves: number;
    isLocked: boolean;
    status: 'playing' | 'won';
}

// Emoji pairs for the game
export const CARD_EMOJIS = [
    '🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤',
];
