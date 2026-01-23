import { GameState, DINO_CONFIG, Obstacle } from './types';

export function createInitialState(): GameState {
    return {
        status: 'idle',
        score: 0,
        highScore: 0,
        dino: {
            x: 50,
            y: DINO_CONFIG.GROUND_Y,
            width: 40,
            height: 40,
            velocity: 0,
            isJumping: false,
        },
        obstacles: [],
        gameSpeed: DINO_CONFIG.INITIAL_SPEED,
        lastObstacleTime: 0,
    };
}

export function updateGame(state: GameState, deltaTime: number): GameState {
    if (state.status !== 'playing') return state;

    const newState = { ...state };
    const { dino, obstacles } = newState;

    // Update Speed
    newState.gameSpeed += DINO_CONFIG.SPEED_INCREMENT;

    // Dino Physics
    if (dino.isJumping) {
        dino.velocity += DINO_CONFIG.GRAVITY;
        dino.y += dino.velocity;

        if (dino.y >= DINO_CONFIG.GROUND_Y) {
            dino.y = DINO_CONFIG.GROUND_Y;
            dino.velocity = 0;
            dino.isJumping = false;
        }
    }

    // Spawn Obstacles
    const now = Date.now();
    if (now - state.lastObstacleTime > DINO_CONFIG.SPAWN_INTERVAL / (newState.gameSpeed / 5)) {
        const type = Math.random() > 0.3 ? 'cactus' : 'bird';
        const height = type === 'cactus' ? 30 + Math.random() * 30 : 30;
        const y = type === 'cactus' ? DINO_CONFIG.GROUND_Y + (40 - height) : DINO_CONFIG.GROUND_Y - 50;
        
        obstacles.push({
            x: 800, // Canvas width
            y,
            width: 20 + Math.random() * 20,
            height,
            type,
            speed: newState.gameSpeed,
        });
        newState.lastObstacleTime = now;
    }

    // Move and filter obstacles
    newState.obstacles = obstacles
        .map(obj => ({ ...obj, x: obj.x - newState.gameSpeed }))
        .filter(obj => obj.x + obj.width > 0);

    // Collision Detection
    for (const obs of newState.obstacles) {
        if (
            dino.x < obs.x + obs.width - 5 &&
            dino.x + dino.width - 5 > obs.x &&
            dino.y < obs.y + obs.height - 5 &&
            dino.y + dino.height - 5 > obs.y
        ) {
            newState.status = 'gameOver';
            if (newState.score > newState.highScore) {
                newState.highScore = newState.score;
            }
        }
    }

    // Score
    newState.score += 1;

    return newState;
}
