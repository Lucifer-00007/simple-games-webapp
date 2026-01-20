// Ping Pong game logic - pure functions, no React/DOM

import { Paddle, Ball, GameState, GameConfig, DEFAULT_CONFIG } from './types';

// Create player paddle (left side)
export function createPlayerPaddle(config: GameConfig = DEFAULT_CONFIG): Paddle {
    return {
        x: 20,
        y: (config.canvasHeight - config.paddleHeight) / 2,
        width: config.paddleWidth,
        height: config.paddleHeight,
        speed: config.paddleSpeed,
    };
}

// Create AI paddle (right side)
export function createAIPaddle(config: GameConfig = DEFAULT_CONFIG): Paddle {
    return {
        x: config.canvasWidth - 20 - config.paddleWidth,
        y: (config.canvasHeight - config.paddleHeight) / 2,
        width: config.paddleWidth,
        height: config.paddleHeight,
        speed: config.paddleSpeed,
    };
}

// Create ball
export function createBall(config: GameConfig = DEFAULT_CONFIG): Ball {
    const angle = (Math.random() - 0.5) * Math.PI / 3; // -30 to 30 degrees
    const direction = Math.random() > 0.5 ? 1 : -1;

    return {
        x: config.canvasWidth / 2,
        y: config.canvasHeight / 2,
        radius: config.ballRadius,
        dx: config.ballSpeed * direction * Math.cos(angle),
        dy: config.ballSpeed * Math.sin(angle),
        speed: config.ballSpeed,
    };
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        playerPaddle: createPlayerPaddle(config),
        aiPaddle: createAIPaddle(config),
        ball: createBall(config),
        playerScore: 0,
        aiScore: 0,
        status: 'idle',
        winner: null,
    };
}

// Move player paddle
export function movePlayerPaddle(
    state: GameState,
    direction: 'up' | 'down',
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing') return state;

    let newY = state.playerPaddle.y;
    if (direction === 'up') {
        newY -= state.playerPaddle.speed;
    } else {
        newY += state.playerPaddle.speed;
    }

    // Clamp to canvas bounds
    newY = Math.max(0, Math.min(config.canvasHeight - state.playerPaddle.height, newY));

    return {
        ...state,
        playerPaddle: {
            ...state.playerPaddle,
            y: newY,
        },
    };
}

// Move player paddle to position (mouse control)
export function movePlayerPaddleToPosition(
    state: GameState,
    targetY: number,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing') return state;

    let newY = targetY - state.playerPaddle.height / 2;
    newY = Math.max(0, Math.min(config.canvasHeight - state.playerPaddle.height, newY));

    return {
        ...state,
        playerPaddle: {
            ...state.playerPaddle,
            y: newY,
        },
    };
}

// Update AI paddle
function updateAIPaddle(state: GameState, config: GameConfig = DEFAULT_CONFIG): Paddle {
    const paddle = state.aiPaddle;
    const ball = state.ball;
    const paddleCenter = paddle.y + paddle.height / 2;

    // AI tracks ball with some delay/imperfection
    const targetY = ball.y;
    const diff = targetY - paddleCenter;

    // Only move if ball is coming towards AI
    if (ball.dx > 0) {
        const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), paddle.speed * config.aiDifficulty);
        let newY = paddle.y + moveAmount;
        newY = Math.max(0, Math.min(config.canvasHeight - paddle.height, newY));

        return {
            ...paddle,
            y: newY,
        };
    }

    return paddle;
}

// Check paddle collision
function checkPaddleCollision(ball: Ball, paddle: Paddle): boolean {
    return (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    );
}

// Update ball position
export function updateBall(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    let ball = { ...state.ball };
    let playerScore = state.playerScore;
    let aiScore = state.aiScore;
    let status: GameState['status'] = state.status;
    let winner = state.winner;

    // Update position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom wall collision
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= config.canvasHeight) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(config.canvasHeight - ball.radius, ball.y));
    }

    // Player paddle collision
    if (checkPaddleCollision(ball, state.playerPaddle) && ball.dx < 0) {
        const hitPos = (ball.y - state.playerPaddle.y) / state.playerPaddle.height;
        const angle = (hitPos - 0.5) * Math.PI / 3; // -30 to 30 degrees
        ball.speed *= 1.02; // Slight speed increase
        ball.dx = Math.abs(ball.speed * Math.cos(angle));
        ball.dy = ball.speed * Math.sin(angle);
        ball.x = state.playerPaddle.x + state.playerPaddle.width + ball.radius;
    }

    // AI paddle collision
    if (checkPaddleCollision(ball, state.aiPaddle) && ball.dx > 0) {
        const hitPos = (ball.y - state.aiPaddle.y) / state.aiPaddle.height;
        const angle = (hitPos - 0.5) * Math.PI / 3;
        ball.speed *= 1.02;
        ball.dx = -Math.abs(ball.speed * Math.cos(angle));
        ball.dy = ball.speed * Math.sin(angle);
        ball.x = state.aiPaddle.x - ball.radius;
    }

    // Score detection
    if (ball.x - ball.radius <= 0) {
        // AI scores
        aiScore++;
        if (aiScore >= config.winScore) {
            status = 'gameOver';
            winner = 'ai';
        } else {
            ball = createBall(config);
        }
    } else if (ball.x + ball.radius >= config.canvasWidth) {
        // Player scores
        playerScore++;
        if (playerScore >= config.winScore) {
            status = 'gameOver';
            winner = 'player';
        } else {
            ball = createBall(config);
        }
    }

    return {
        ...state,
        ball,
        playerScore,
        aiScore,
        status,
        winner,
        aiPaddle: updateAIPaddle(state, config),
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
export function resetGame(config: GameConfig = DEFAULT_CONFIG): GameState {
    return createInitialState(config);
}
