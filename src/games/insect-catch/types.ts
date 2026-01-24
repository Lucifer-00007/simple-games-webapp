// Insect Catch game types

export type GameStatus = 'idle' | 'selecting' | 'playing' | 'finished';

export interface Insect {
    id: number;
    type: string;
    x: number;
    y: number;
}

export interface GameState {
    insects: Insect[];
    selectedInsect: string;
    score: number;
    highScore: number;
    timeLeft: number;
    status: GameStatus;
}

export interface GameConfig {
    gameDuration: number;
    spawnInterval: number;
    maxInsects: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    gameDuration: 30,
    spawnInterval: 1000,
    maxInsects: 8,
};

export const INSECTS = [
    { emoji: '🦟', name: 'Mosquito', points: 10 },
    { emoji: '🪲', name: 'Beetle', points: 15 },
    { emoji: '🦗', name: 'Cricket', points: 10 },
    { emoji: '🐛', name: 'Caterpillar', points: 5 },
    { emoji: '🦋', name: 'Butterfly', points: 20 },
    { emoji: '🐝', name: 'Bee', points: 25 },
];
