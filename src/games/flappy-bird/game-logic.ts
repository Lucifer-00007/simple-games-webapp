// Flappy Bird game logic - pure functions, no React/DOM

import { Bird, Pipe, GameState, GameConfig, DEFAULT_CONFIG, Difficulty, DIFFICULTY_SETTINGS } from './types';

// Create initial bird
export function createBird(config: GameConfig = DEFAULT_CONFIG): Bird {
    return {
        x: config.canvasWidth * 0.3,
        y: config.canvasHeight / 2,
        velocity: 0,
        radius: config.birdRadius,
        rotation: 0,
    };
}

// Generate a new pipe
export function generatePipe(x: number, config: GameConfig = DEFAULT_CONFIG): Pipe {
    const maxTopHeight = config.canvasHeight - config.pipeGap - config.minPipeHeight;
    const topHeight = config.minPipeHeight + Math.random() * (maxTopHeight - config.minPipeHeight);

    return {
        x,
        topHeight,
        bottomY: topHeight + config.pipeGap,
        width: config.pipeWidth,
        gap: config.pipeGap,
        passed: false,
    };
}

// Create initial pipes
export function createInitialPipes(config: GameConfig = DEFAULT_CONFIG): Pipe[] {
    const pipes: Pipe[] = [];
    for (let i = 0; i < 3; i++) {
        pipes.push(generatePipe(config.canvasWidth + i * config.pipeSpacing, config));
    }
    return pipes;
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        bird: createBird(config),
        pipes: createInitialPipes(config),
        status: 'idle',
        score: 0,
        highScore: 0,
        frameCount: 0,
        difficulty: 'medium',
    };
}

// Make bird jump
export function jump(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status === 'gameOver') return state;

    if (state.status === 'idle') {
        return {
            ...state,
            status: 'playing',
            bird: {
                ...state.bird,
                velocity: config.jumpForce,
            },
        };
    }

    return {
        ...state,
        bird: {
            ...state.bird,
            velocity: config.jumpForce,
        },
    };
}

// Check collision with pipes
function checkCollision(bird: Bird, pipes: Pipe[], config: GameConfig = DEFAULT_CONFIG): boolean {
    // Ground/ceiling collision
    if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= config.canvasHeight) {
        return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
        // Check if bird is horizontally aligned with pipe
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipe.width
        ) {
            // Check if bird hits top pipe
            if (bird.y - bird.radius < pipe.topHeight) {
                return true;
            }
            // Check if bird hits bottom pipe
            if (bird.y + bird.radius > pipe.bottomY) {
                return true;
            }
        }
    }

    return false;
}

// Update game state
export function tick(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    // Update bird
    let newVelocity = state.bird.velocity + config.gravity;
    let newY = state.bird.y + newVelocity;

    // Calculate rotation based on velocity
    const rotation = Math.min(Math.max(newVelocity * 3, -30), 90);

    const newBird: Bird = {
        ...state.bird,
        y: newY,
        velocity: newVelocity,
        rotation,
    };

    // Update pipes
    let newPipes = state.pipes.map((pipe) => ({
        ...pipe,
        x: pipe.x - config.pipeSpeed,
    }));

    // Remove off-screen pipes and add new ones
    if (newPipes[0] && newPipes[0].x + newPipes[0].width < 0) {
        newPipes = newPipes.slice(1);
        const lastPipe = newPipes[newPipes.length - 1];
        newPipes.push(generatePipe(lastPipe.x + config.pipeSpacing, config));
    }

    // Check scoring
    let newScore = state.score;
    newPipes = newPipes.map((pipe) => {
        if (!pipe.passed && pipe.x + pipe.width < state.bird.x) {
            newScore++;
            return { ...pipe, passed: true };
        }
        return pipe;
    });

    // Check collision
    if (checkCollision(newBird, newPipes, config)) {
        return {
            ...state,
            bird: newBird,
            pipes: newPipes,
            status: 'gameOver',
            score: newScore,
            highScore: Math.max(state.highScore, newScore),
            frameCount: state.frameCount + 1,
        };
    }

    return {
        ...state,
        bird: newBird,
        pipes: newPipes,
        score: newScore,
        frameCount: state.frameCount + 1,
    };
}

// Reset game
export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newState = createInitialState(config);
    return {
        ...newState,
        highScore: state.highScore,
        difficulty: state.difficulty,
    };
}

// Set difficulty
export function setDifficulty(state: GameState, difficulty: Difficulty): GameState {
    return {
        ...state,
        difficulty,
    };
}

// Get current config based on difficulty
export function getConfig(difficulty: Difficulty): GameConfig {
    return {
        ...DEFAULT_CONFIG,
        ...DIFFICULTY_SETTINGS[difficulty],
    };
}
