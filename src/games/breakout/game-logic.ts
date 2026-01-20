// Breakout game logic - pure functions, no React/DOM

import {
    Paddle,
    Ball,
    Brick,
    GameState,
    GameConfig,
    DEFAULT_CONFIG,
    BRICK_COLORS,
} from './types';

// Create bricks grid
export function createBricks(config: GameConfig = DEFAULT_CONFIG): Brick[] {
    const bricks: Brick[] = [];

    for (let row = 0; row < config.brickRows; row++) {
        for (let col = 0; col < config.brickCols; col++) {
            bricks.push({
                x: config.brickOffsetLeft + col * (config.brickWidth + config.brickPadding),
                y: config.brickOffsetTop + row * (config.brickHeight + config.brickPadding),
                width: config.brickWidth,
                height: config.brickHeight,
                color: BRICK_COLORS[row % BRICK_COLORS.length],
                points: (config.brickRows - row) * 10,
                destroyed: false,
            });
        }
    }

    return bricks;
}

// Create initial paddle
export function createPaddle(config: GameConfig = DEFAULT_CONFIG): Paddle {
    return {
        x: (config.canvasWidth - config.paddleWidth) / 2,
        y: config.canvasHeight - 30,
        width: config.paddleWidth,
        height: config.paddleHeight,
    };
}

// Create initial ball
export function createBall(config: GameConfig = DEFAULT_CONFIG): Ball {
    return {
        x: config.canvasWidth / 2,
        y: config.canvasHeight - 50,
        radius: config.ballRadius,
        velocity: {
            dx: config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
            dy: -config.ballSpeed,
        },
    };
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        paddle: createPaddle(config),
        ball: createBall(config),
        bricks: createBricks(config),
        status: 'idle',
        score: 0,
        highScore: 0,
        lives: config.initialLives,
    };
}

// Move paddle
export function movePaddle(
    state: GameState,
    targetX: number,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing') return state;

    const halfWidth = state.paddle.width / 2;
    let newX = targetX - halfWidth;

    // Clamp to canvas bounds
    newX = Math.max(0, Math.min(config.canvasWidth - state.paddle.width, newX));

    return {
        ...state,
        paddle: {
            ...state.paddle,
            x: newX,
        },
    };
}

// Check collision between ball and rectangle
function checkRectCollision(
    ball: Ball,
    rect: { x: number; y: number; width: number; height: number }
): boolean {
    return (
        ball.x + ball.radius > rect.x &&
        ball.x - ball.radius < rect.x + rect.width &&
        ball.y + ball.radius > rect.y &&
        ball.y - ball.radius < rect.y + rect.height
    );
}

// Update ball position and handle collisions
export function updateBall(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    let newBall = { ...state.ball };
    let newX = newBall.x + newBall.velocity.dx;
    let newY = newBall.y + newBall.velocity.dy;
    let newDx = newBall.velocity.dx;
    let newDy = newBall.velocity.dy;
    let newScore = state.score;
    let newBricks = [...state.bricks];
    let newLives = state.lives;
    let newStatus: GameState['status'] = state.status;

    // Wall collisions
    if (newX - newBall.radius <= 0 || newX + newBall.radius >= config.canvasWidth) {
        newDx = -newDx;
        newX = Math.max(newBall.radius, Math.min(config.canvasWidth - newBall.radius, newX));
    }

    if (newY - newBall.radius <= 0) {
        newDy = -newDy;
        newY = newBall.radius;
    }

    // Ball fell below paddle
    if (newY + newBall.radius >= config.canvasHeight) {
        newLives--;
        if (newLives <= 0) {
            newStatus = 'gameOver';
        } else {
            // Reset ball position
            newBall = createBall(config);
            return {
                ...state,
                ball: newBall,
                lives: newLives,
            };
        }
    }

    // Paddle collision
    const paddleBall = { ...newBall, x: newX, y: newY };
    if (checkRectCollision(paddleBall, state.paddle) && newDy > 0) {
        // Calculate angle based on where ball hits paddle
        const hitPos = (newX - state.paddle.x) / state.paddle.width;
        const angle = (hitPos - 0.5) * Math.PI * 0.6; // -54 to 54 degrees
        const speed = Math.sqrt(newDx * newDx + newDy * newDy);

        newDx = speed * Math.sin(angle);
        newDy = -Math.abs(speed * Math.cos(angle));
        newY = state.paddle.y - newBall.radius;
    }

    // Brick collisions
    for (let i = 0; i < newBricks.length; i++) {
        const brick = newBricks[i];
        if (brick.destroyed) continue;

        const testBall = { ...newBall, x: newX, y: newY };
        if (checkRectCollision(testBall, brick)) {
            newBricks[i] = { ...brick, destroyed: true };
            newScore += brick.points;

            // Determine collision side for reflection
            const ballCenterX = newX;
            const ballCenterY = newY;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;

            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;

            if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
                newDx = -newDx;
            } else {
                newDy = -newDy;
            }

            break; // Only handle one brick collision per frame
        }
    }

    // Check win condition
    if (newBricks.every((brick) => brick.destroyed)) {
        newStatus = 'won';
    }

    return {
        ...state,
        ball: {
            ...newBall,
            x: newX,
            y: newY,
            velocity: { dx: newDx, dy: newDy },
        },
        bricks: newBricks,
        score: newScore,
        lives: newLives,
        status: newStatus,
        highScore: Math.max(state.highScore, newScore),
    };
}

// Game tick
export function tick(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    return updateBall(state, config);
}

// Start game
export function startGame(state: GameState): GameState {
    if (state.status === 'playing') return state;
    return {
        ...state,
        status: 'playing',
    };
}

// Toggle pause
export function togglePause(state: GameState): GameState {
    if (state.status === 'playing') {
        return { ...state, status: 'paused' };
    }
    if (state.status === 'paused') {
        return { ...state, status: 'playing' };
    }
    return state;
}

// Reset game
export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newState = createInitialState(config);
    return {
        ...newState,
        highScore: state.highScore,
    };
}
