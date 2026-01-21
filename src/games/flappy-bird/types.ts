// Flappy Bird game types

export type GameStatus = 'idle' | 'playing' | 'gameOver';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Bird {
    x: number;
    y: number;
    velocity: number;
    radius: number;
    rotation: number;
}

export interface Pipe {
    x: number;
    topHeight: number;
    bottomY: number;
    width: number;
    gap: number;
    passed: boolean;
}

export interface GameState {
    bird: Bird;
    pipes: Pipe[];
    status: GameStatus;
    score: number;
    highScore: number;
    frameCount: number;
    difficulty: Difficulty;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    gravity: number;
    jumpForce: number;
    birdRadius: number;
    pipeWidth: number;
    pipeGap: number;
    pipeSpacing: number;
    pipeSpeed: number;
    minPipeHeight: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    gravity: 0.5,
    jumpForce: -9,
    birdRadius: 18,
    pipeWidth: 60,
    pipeGap: 150,
    pipeSpacing: 200,
    pipeSpeed: 3,
    minPipeHeight: 50,
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, Partial<GameConfig>> = {
    easy: {
        pipeGap: 180,
        pipeSpeed: 2.5,
        gravity: 0.45,
    },
    medium: {
        pipeGap: 150,
        pipeSpeed: 3,
        gravity: 0.5,
    },
    hard: {
        pipeGap: 130,
        pipeSpeed: 4,
        gravity: 0.55,
    },
};
