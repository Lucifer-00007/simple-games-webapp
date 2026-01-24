// Candy Crush game types

export type CandyType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
export type GameStatus = 'idle' | 'playing' | 'animating' | 'gameOver';

export interface Position {
    row: number;
    col: number;
}

export interface Candy {
    type: CandyType;
    id: string;
}

export interface GameState {
    board: (Candy | null)[][];
    selected: Position | null;
    status: GameStatus;
    score: number;
    highScore: number;
    movesLeft: number;
    isAnimating: boolean;
}

export interface GameConfig {
    rows: number;
    cols: number;
    candyTypes: CandyType[];
    initialMoves: number;
    matchPoints: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    rows: 8,
    cols: 8,
    candyTypes: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
    initialMoves: 30,
    matchPoints: 10,
};

export const CANDY_EMOJIS: Record<CandyType, string> = {
    red: '🍎',
    orange: '🍊',
    yellow: '🍋',
    green: '🍏',
    blue: '🫐',
    purple: '🍇',
};

export const CANDY_COLORS: Record<CandyType, string> = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
};
