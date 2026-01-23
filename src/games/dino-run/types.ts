export type GameStatus = 'idle' | 'playing' | 'gameOver';

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
    dino: GameObject & {
        velocity: number;
        isJumping: boolean;
    };
    obstacles: Obstacle[];
    gameSpeed: number;
    lastObstacleTime: number;
}

export const DINO_CONFIG = {
    GRAVITY: 0.6,
    JUMP_FORCE: -12,
    INITIAL_SPEED: 5,
    SPEED_INCREMENT: 0.001,
    SPAWN_INTERVAL: 1500, // ms
    GROUND_Y: 150,
};
