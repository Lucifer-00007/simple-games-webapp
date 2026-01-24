// Shape Clicker game types

export type GameStatus = 'idle' | 'playing' | 'finished';
export type ShapeType = 'circle' | 'square' | 'triangle' | 'star';

export interface Shape {
    id: number;
    type: ShapeType;
    x: number;
    y: number;
    size: number;
    color: string;
    createdAt: number;
}

export interface GameState {
    shapes: Shape[];
    score: number;
    highScore: number;
    timeLeft: number;
    status: GameStatus;
    shapesClicked: number;
    shapesMissed: number;
}

export interface GameConfig {
    gameDuration: number;
    shapeLifetime: number;
    spawnInterval: number;
    maxShapes: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    gameDuration: 30,
    shapeLifetime: 2000,
    spawnInterval: 600,
    maxShapes: 6,
};

export const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
