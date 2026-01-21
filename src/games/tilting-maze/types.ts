// Tilting Maze game types and logic

export type GameStatus = 'idle' | 'playing' | 'won' | 'gameOver';

export interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export interface Wall {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Hole {
    x: number;
    y: number;
    radius: number;
}

export interface Goal {
    x: number;
    y: number;
    radius: number;
}

export interface Level {
    walls: Wall[];
    holes: Hole[];
    goal: Goal;
    startX: number;
    startY: number;
}

export interface GameState {
    ball: Ball;
    status: GameStatus;
    level: number;
    time: number;
    bestTime: number;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    ballRadius: number;
    friction: number;
    acceleration: number;
    goalRadius: number;
    holeRadius: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 600,
    canvasHeight: 500,
    ballRadius: 12,
    friction: 0.98,
    acceleration: 0.4,
    goalRadius: 20,
    holeRadius: 14,
};

// Maze grid size
export const MAZE_SIZE = 10;
export const CELL_SIZE = 40;

// Predefined maze levels (grid-based)
export const LEVELS: Level[] = [
    // Level 1 - Simple intro
    {
        startX: 1.5,
        startY: 1.5,
        goal: { x: 8.5, y: 8.5, radius: DEFAULT_CONFIG.goalRadius },
        walls: [
            { x: 2, y: 0, width: 1, height: 5 },
            { x: 4, y: 3, width: 1, height: 7 },
            { x: 6, y: 0, width: 1, height: 4 },
            { x: 0, y: 5, width: 3, height: 1 },
            { x: 5, y: 6, width: 4, height: 1 },
        ],
        holes: [
            { x: 3.5, y: 4.5, radius: DEFAULT_CONFIG.holeRadius },
            { x: 7.5, y: 3.5, radius: DEFAULT_CONFIG.holeRadius },
        ],
    },
    // Level 2 - More complex
    {
        startX: 1.5,
        startY: 8.5,
        goal: { x: 8.5, y: 1.5, radius: DEFAULT_CONFIG.goalRadius },
        walls: [
            { x: 0, y: 2, width: 6, height: 1 },
            { x: 2, y: 4, width: 7, height: 1 },
            { x: 0, y: 6, width: 5, height: 1 },
            { x: 3, y: 0, width: 1, height: 3 },
            { x: 7, y: 5, width: 1, height: 5 },
        ],
        holes: [
            { x: 1.5, y: 3.5, radius: DEFAULT_CONFIG.holeRadius },
            { x: 8.5, y: 3.5, radius: DEFAULT_CONFIG.holeRadius },
            { x: 3.5, y: 5.5, radius: DEFAULT_CONFIG.holeRadius },
        ],
    },
    // Level 3 - Challenging
    {
        startX: 1.5,
        startY: 1.5,
        goal: { x: 5, y: 5, radius: DEFAULT_CONFIG.goalRadius },
        walls: [
            { x: 2, y: 0, width: 1, height: 3 },
            { x: 2, y: 5, width: 1, height: 5 },
            { x: 5, y: 0, width: 1, height: 3 },
            { x: 5, y: 5, width: 1, height: 5 },
            { x: 7, y: 0, width: 1, height: 3 },
            { x: 7, y: 5, width: 1, height: 5 },
            { x: 3, y: 3, width: 2, height: 1 },
            { x: 3, y: 6, width: 2, height: 1 },
        ],
        holes: [
            { x: 1.5, y: 8.5, radius: DEFAULT_CONFIG.holeRadius },
            { x: 8.5, y: 1.5, radius: DEFAULT_CONFIG.holeRadius },
            { x: 8.5, y: 8.5, radius: DEFAULT_CONFIG.holeRadius },
            { x: 1.5, y: 5, radius: DEFAULT_CONFIG.holeRadius },
        ],
    },
];

// Get current level
export function getLevel(levelIndex: number): Level {
    return LEVELS[levelIndex % LEVELS.length];
}

// Create initial game state
export function createInitialState(levelIndex: number = 0): GameState {
    const level = getLevel(levelIndex);
    return {
        ball: { x: level.startX, y: level.startY, vx: 0, vy: 0 },
        status: 'idle',
        level: levelIndex,
        time: 0,
        bestTime: Infinity,
    };
}

// Check collision between ball and a wall
function checkWallCollision(ball: Ball, wall: Wall, config: GameConfig): { collided: boolean; newX?: number; newY?: number; newVx?: number; newVy?: number } {
    const { x, y, vx, vy } = ball;
    const r = config.ballRadius;

    // Ball bounds
    const ballLeft = x - r;
    const ballRight = x + r;
    const ballTop = y - r;
    const ballBottom = y + r;

    // Wall bounds
    const wallLeft = wall.x;
    const wallRight = wall.x + wall.width;
    const wallTop = wall.y;
    const wallBottom = wall.y + wall.height;

    // Check if overlapping
    if (ballRight > wallLeft && ballLeft < wallRight && ballBottom > wallTop && ballTop < wallBottom) {
        // Calculate overlap on each side
        const overlapLeft = ballRight - wallLeft;
        const overlapRight = wallRight - ballLeft;
        const overlapTop = ballBottom - wallTop;
        const overlapBottom = wallBottom - ballTop;

        // Find smallest overlap
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        let newX = x, newY = y, newVx = vx, newVy = vy;

        if (minOverlap === overlapLeft) {
            newX = wallLeft - r;
            newVx = -vx * 0.3;
        } else if (minOverlap === overlapRight) {
            newX = wallRight + r;
            newVx = -vx * 0.3;
        } else if (minOverlap === overlapTop) {
            newY = wallTop - r;
            newVy = -vy * 0.3;
        } else {
            newY = wallBottom + r;
            newVy = -vy * 0.3;
        }

        return { collided: true, newX, newY, newVx, newVy };
    }

    return { collided: false };
}

// Check if ball fell into a hole
function checkHoleCollision(ball: Ball, hole: Hole): boolean {
    const dx = ball.x - hole.x;
    const dy = ball.y - hole.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < hole.radius;
}

// Check if ball reached the goal
function checkGoalReached(ball: Ball, goal: Goal, config: GameConfig): boolean {
    const dx = ball.x - goal.x;
    const dy = ball.y - goal.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < goal.radius - config.ballRadius / 2;
}

// Update ball physics
export function updateBall(state: GameState, tiltX: number, tiltY: number, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    const level = getLevel(state.level);

    // Apply tilt as acceleration
    let newVx = (state.ball.vx + tiltX * config.acceleration) * config.friction;
    let newVy = (state.ball.vy + tiltY * config.acceleration) * config.friction;
    let newX = state.ball.x + newVx;
    let newY = state.ball.y + newVy;

    // Boundary collision
    if (newX - config.ballRadius < 0) {
        newX = config.ballRadius;
        newVx = -newVx * 0.3;
    }
    if (newX + config.ballRadius > config.canvasWidth) {
        newX = config.canvasWidth - config.ballRadius;
        newVx = -newVx * 0.3;
    }
    if (newY - config.ballRadius < 0) {
        newY = config.ballRadius;
        newVy = -newVy * 0.3;
    }
    if (newY + config.ballRadius > config.canvasHeight) {
        newY = config.canvasHeight - config.ballRadius;
        newVy = -newVy * 0.3;
    }

    // Wall collisions
    for (const wall of level.walls) {
        const collision = checkWallCollision({ x: newX, y: newY, vx: newVx, vy: newVy }, wall, config);
        if (collision.collided) {
            newX = collision.newX!;
            newY = collision.newY!;
            newVx = collision.newVx!;
            newVy = collision.newVy!;
        }
    }

    // Check if fell into hole
    for (const hole of level.holes) {
        if (checkHoleCollision({ x: newX, y: newY, vx: newVx, vy: newVy }, hole)) {
            return {
                ...state,
                ball: { x: newX, y: newY, vx: 0, vy: 0 },
                status: 'gameOver',
            };
        }
    }

    // Check if reached goal
    if (checkGoalReached({ x: newX, y: newY, vx: newVx, vy: newVy }, level.goal, config)) {
        const newTime = state.time + 1;
        return {
            ...state,
            ball: { x: newX, y: newY, vx: 0, vy: 0 },
            status: 'won',
            time: newTime,
            bestTime: Math.min(state.bestTime, newTime),
        };
    }

    return {
        ...state,
        ball: { x: newX, y: newY, vx: newVx, vy: newVy },
        time: state.time + 1,
    };
}

// Start game
export function startGame(state: GameState): GameState {
    const level = getLevel(state.level);
    return {
        ...state,
        ball: { x: level.startX, y: level.startY, vx: 0, vy: 0 },
        status: 'playing',
        time: 0,
    };
}

// Reset game (same level)
export function resetGame(state: GameState): GameState {
    const level = getLevel(state.level);
    return {
        ...state,
        ball: { x: level.startX, y: level.startY, vx: 0, vy: 0 },
        status: 'idle',
        time: 0,
    };
}

// Next level
export function nextLevel(state: GameState): GameState {
    const newLevelIndex = (state.level + 1) % LEVELS.length;
    const level = getLevel(newLevelIndex);
    return {
        ...state,
        ball: { x: level.startX, y: level.startY, vx: 0, vy: 0 },
        status: 'idle',
        level: newLevelIndex,
        time: 0,
    };
}
