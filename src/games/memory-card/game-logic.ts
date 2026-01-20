import { Card, GameState, CARD_EMOJIS } from './types';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Create initial card deck
export function createDeck(): Card[] {
    const pairs: Card[] = [];

    CARD_EMOJIS.forEach((emoji, index) => {
        // Create two cards for each emoji (a pair)
        pairs.push({
            id: index * 2,
            pairId: index,
            emoji,
            isFlipped: false,
            isMatched: false,
        });
        pairs.push({
            id: index * 2 + 1,
            pairId: index,
            emoji,
            isFlipped: false,
            isMatched: false,
        });
    });

    return shuffleArray(pairs);
}

// Create initial game state
export function createInitialState(): GameState {
    return {
        cards: createDeck(),
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        isLocked: false,
        status: 'playing',
    };
}

// Flip a card
export function flipCard(state: GameState, cardId: number): GameState {
    // Don't flip if game is locked or card is already flipped/matched
    if (state.isLocked) return state;

    const card = state.cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return state;

    // Can only have 2 cards flipped at a time
    if (state.flippedCards.length >= 2) return state;

    const newCards = state.cards.map((c) =>
        c.id === cardId ? { ...c, isFlipped: true } : c
    );

    const newFlippedCards = [...state.flippedCards, cardId];

    return {
        ...state,
        cards: newCards,
        flippedCards: newFlippedCards,
        isLocked: newFlippedCards.length === 2,
    };
}

// Check for a match after two cards are flipped
export function checkMatch(state: GameState): GameState {
    if (state.flippedCards.length !== 2) return state;

    const [firstId, secondId] = state.flippedCards;
    const firstCard = state.cards.find((c) => c.id === firstId);
    const secondCard = state.cards.find((c) => c.id === secondId);

    if (!firstCard || !secondCard) return state;

    const isMatch = firstCard.pairId === secondCard.pairId;
    const newMatchedPairs = isMatch ? state.matchedPairs + 1 : state.matchedPairs;
    const isWon = newMatchedPairs === CARD_EMOJIS.length;

    const newCards = state.cards.map((card) => {
        if (card.id === firstId || card.id === secondId) {
            if (isMatch) {
                return { ...card, isMatched: true };
            }
            return { ...card, isFlipped: false };
        }
        return card;
    });

    return {
        ...state,
        cards: newCards,
        flippedCards: [],
        matchedPairs: newMatchedPairs,
        moves: state.moves + 1,
        isLocked: false,
        status: isWon ? 'won' : 'playing',
    };
}
