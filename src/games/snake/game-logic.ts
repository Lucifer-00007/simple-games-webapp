// Snake game logic - pure functions, no React/DOM

import { Position, Direction, GameState, GameConfig, DEFAULT_CONFIG } from './types';

// Generate random food position that's not on the snake
export function generateFood(snake: Position[], gridSize: number): Position {
    let food: Position;
    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
        };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
    return food;
}

// Create initial snake body
export function createInitialSnake(gridSize: number, length: number): Position[] {
    const startX = Math.floor(gridSize / 2);
    const startY = Math.floor(gridSize / 2);
    const snake: Position[] = [];
    for (let i = 0; i < length; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    return snake;
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    const snake = createInitialSnake(config.gridSize, config.initialLength);
    return {
        snake,
        food: generateFood(snake, config.gridSize),
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        status: 'idle',
        score: 0,
        highScore: 0,
        speed: config.initialSpeed,
    };
}

// Check if position is valid (within grid and not on snake body)
export function isValidPosition(pos: Position, snake: Position[], gridSize: number): boolean {
    // Check bounds
    if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
        return false;
    }
    // Check self-collision (skip head)
    return !snake.slice(1).some((segment) => segment.x === pos.x && segment.y === pos.y);
}

// Get new head position based on direction
export function getNextHead(head: Position, direction: Direction): Position {
    switch (direction) {
        case 'UP':
            return { x: head.x, y: head.y - 1 };
        case 'DOWN':
            return { x: head.x, y: head.y + 1 };
        case 'LEFT':
            return { x: head.x - 1, y: head.y };
        case 'RIGHT':
            return { x: head.x + 1, y: head.y };
    }
}

// Check if direction change is valid (can't reverse)
export function isValidDirectionChange(current: Direction, next: Direction): boolean {
    const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
    };
    return opposites[current] !== next;
}

// Change direction
export function changeDirection(state: GameState, newDirection: Direction): GameState {
    if (state.status !== 'playing') return state;
    if (!isValidDirectionChange(state.direction, newDirection)) return state;

    return {
        ...state,
        nextDirection: newDirection,
    };
}

// Move the snake one step
export function moveSnake(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    const head = state.snake[0];
    const newHead = getNextHead(head, state.nextDirection);

    // Check for collision
    if (!isValidPosition(newHead, state.snake, config.gridSize)) {
        return {
            ...state,
            status: 'gameOver',
            highScore: Math.max(state.highScore, state.score),
        };
    }

    const newSnake = [newHead, ...state.snake];
    let newFood = state.food;
    let newScore = state.score;
    let newSpeed = state.speed;

    // Check if eating food
    if (newHead.x === state.food.x && newHead.y === state.food.y) {
        newFood = generateFood(newSnake, config.gridSize);
        newScore = state.score + 10;
        newSpeed = Math.max(50, state.speed - config.speedIncrement);
    } else {
        // Remove tail if not eating
        newSnake.pop();
    }

    return {
        ...state,
        snake: newSnake,
        food: newFood,
        direction: state.nextDirection,
        score: newScore,
        speed: newSpeed,
    };
}

// Start game
export function startGame(state: GameState): GameState {
    if (state.status === 'playing') return state;
    return {
        ...state,
        status: 'playing',
    };
}

// Pause/Resume game
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
