// Game-related TypeScript interfaces and types

export type GameCategory =
    | 'puzzle'
    | 'arcade'
    | 'action'
    | 'skill'
    | 'classic'
    | 'trivia';

export type GameDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Game {
    id: number;
    slug: string;
    title: string;
    description: string;
    category: GameCategory;
    difficulty: GameDifficulty;
    thumbnail: string;
    controls: string[];
    rules?: string[];
    featured?: boolean;
}

export interface GameScore {
    gameSlug: string;
    playerName: string;
    score: number;
    timestamp: number;
}

export interface GameState {
    status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
    score: number;
    level?: number;
}

export interface CategoryInfo {
    id: GameCategory;
    name: string;
    description: string;
    icon: string;
    color: string;
}
