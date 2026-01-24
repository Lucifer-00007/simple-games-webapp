export type GameStatus = 'idle' | 'playing' | 'gameOver';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Obstacle extends GameObject {
    type: 'cactus' | 'bird';
    speed: number;
}

export interface GameState {
    status: GameStatus;
    score: number;
    highScore: number;
    difficulty: Difficulty;
    dino: GameObject & {
        velocity: number;
        isJumping: boolean;
    };
    obstacles: Obstacle[];
    gameSpeed: number;
    lastObstacleTime: number;
}

export const DIFFICULTY_SETTINGS = {
    easy: { speed: 4, acceleration: 0.0005 },
    medium: { speed: 6, acceleration: 0.001 },
    hard: { speed: 8, acceleration: 0.002 },
};

export const DINO_CONFIG = {
    GRAVITY: 0.6,
    JUMP_FORCE: -15, // Increased jump height
    INITIAL_SPEED: 5, // Default/Fallback
    SPEED_INCREMENT: 0.001, // Default/Fallback
    SPAWN_INTERVAL: 1500, // ms
    GROUND_Y: 240, // Increased ground Y for taller canvas
};
