// Fruit Slicer game types

export type GameStatus = 'idle' | 'playing' | 'gameOver';
export type FruitType = 'apple' | 'orange' | 'watermelon' | 'banana' | 'pineapple';

export interface Fruit {
    id: string;
    type: FruitType;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    rotation: number;
    rotationSpeed: number;
    sliced: boolean;
}

export interface Bomb {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

export interface SliceTrail {
    x: number;
    y: number;
    age: number;
}

export interface GameState {
    fruits: Fruit[];
    bombs: Bomb[];
    sliceTrail: SliceTrail[];
    status: GameStatus;
    score: number;
    highScore: number;
    lives: number;
    frameCount: number;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    gravity: number;
    spawnInterval: number;
    initialLives: number;
    fruitRadius: number;
    bombRadius: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 500,
    canvasHeight: 500,
    gravity: 0.3,
    spawnInterval: 60,
    initialLives: 3,
    fruitRadius: 30,
    bombRadius: 25,
};

export const FRUIT_EMOJIS: Record<FruitType, string> = {
    apple: '🍎',
    orange: '🍊',
    watermelon: '🍉',
    banana: '🍌',
    pineapple: '🍍',
};

export const FRUIT_TYPES: FruitType[] = ['apple', 'orange', 'watermelon', 'banana', 'pineapple'];
