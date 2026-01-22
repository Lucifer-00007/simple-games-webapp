// Tilting Maze - Complete implementation with maze walls, goal, and collision detection

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

export interface Goal {
    x: number;
    y: number;
    radius: number;
}

export interface GameState {
    ball: Ball;
    status: GameStatus;
    time: number;
    startTime: number;
}

// Configuration - matching reference dimensions
const pathW = 25; // Path width
const wallW = 10; // Wall width
const cellSize = pathW + wallW; // 35px per cell

export const DEFAULT_CONFIG = {
    canvasWidth: 360,  // Increased to include right border (10 cols * 35 + 10 wall)
    canvasHeight: 325, // Increased to include bottom border (9 rows * 35 + 10 wall)
    ballRadius: 8,     // Larger ball for visibility
    friction: 0.98,
    acceleration: 0.12,
    goalRadius: 32,
    wallThickness: wallW,
};

// Colors matching reference image
export const COLORS = {
    background: '#ede6e3',
    wall: '#36382e',
    ball: '#f06449',
    ballShadow: 'rgba(0, 0, 0, 0.2)',
    goalStroke: '#7d82b8',
    goalDash: '#7d82b8',
    cornerDot: '#f06449',
};

// Wall metadata from reference - using column/row/horizontal/length format
// Then converted to x, y, width, height
const wallsData = [
    // Border
    { column: 0, row: 0, horizontal: true, length: 10 },
    { column: 0, row: 0, horizontal: false, length: 9 },
    { column: 0, row: 9, horizontal: true, length: 10 },
    { column: 10, row: 0, horizontal: false, length: 9 },

    // Horizontal lines starting in 1st column
    { column: 0, row: 6, horizontal: true, length: 1 },
    { column: 0, row: 8, horizontal: true, length: 1 },

    // Horizontal lines starting in 2nd column
    { column: 1, row: 1, horizontal: true, length: 2 },
    { column: 1, row: 7, horizontal: true, length: 1 },

    // Horizontal lines starting in 3rd column
    { column: 2, row: 2, horizontal: true, length: 2 },
    { column: 2, row: 4, horizontal: true, length: 1 },
    { column: 2, row: 5, horizontal: true, length: 1 },
    { column: 2, row: 6, horizontal: true, length: 1 },

    // Horizontal lines starting in 4th column
    { column: 3, row: 3, horizontal: true, length: 1 },
    { column: 3, row: 8, horizontal: true, length: 3 },

    // Horizontal lines starting in 5th column
    { column: 4, row: 6, horizontal: true, length: 1 },

    // Horizontal lines starting in 6th column
    { column: 5, row: 2, horizontal: true, length: 2 },
    { column: 5, row: 7, horizontal: true, length: 1 },

    // Horizontal lines starting in 7th column
    { column: 6, row: 1, horizontal: true, length: 1 },
    { column: 6, row: 6, horizontal: true, length: 2 },

    // Horizontal lines starting in 8th column
    { column: 7, row: 3, horizontal: true, length: 2 },
    { column: 7, row: 7, horizontal: true, length: 2 },

    // Horizontal lines starting in 9th column
    { column: 8, row: 1, horizontal: true, length: 1 },
    { column: 8, row: 2, horizontal: true, length: 1 },
    { column: 8, row: 3, horizontal: true, length: 1 },
    { column: 8, row: 4, horizontal: true, length: 2 },
    { column: 8, row: 8, horizontal: true, length: 2 },

    // Vertical lines after the 1st column
    { column: 1, row: 1, horizontal: false, length: 2 },
    { column: 1, row: 4, horizontal: false, length: 2 },

    // Vertical lines after the 2nd column
    { column: 2, row: 2, horizontal: false, length: 2 },
    { column: 2, row: 5, horizontal: false, length: 1 },
    { column: 2, row: 7, horizontal: false, length: 2 },

    // Vertical lines after the 3rd column
    { column: 3, row: 0, horizontal: false, length: 1 },
    { column: 3, row: 4, horizontal: false, length: 1 },
    { column: 3, row: 6, horizontal: false, length: 2 },

    // Vertical lines after the 4th column
    { column: 4, row: 1, horizontal: false, length: 2 },
    { column: 4, row: 6, horizontal: false, length: 1 },

    // Vertical lines after the 5th column
    { column: 5, row: 0, horizontal: false, length: 2 },
    { column: 5, row: 6, horizontal: false, length: 1 },
    { column: 5, row: 8, horizontal: false, length: 1 },

    // Vertical lines after the 6th column
    { column: 6, row: 4, horizontal: false, length: 1 },
    { column: 6, row: 6, horizontal: false, length: 1 },

    // Vertical lines after the 7th column
    { column: 7, row: 1, horizontal: false, length: 4 },
    { column: 7, row: 7, horizontal: false, length: 2 },

    // Vertical lines after the 8th column
    { column: 8, row: 2, horizontal: false, length: 1 },
    { column: 8, row: 4, horizontal: false, length: 2 },

    // Vertical lines after the 9th column
    { column: 9, row: 1, horizontal: false, length: 1 },
    { column: 9, row: 5, horizontal: false, length: 2 },
];

// Convert wall data to pixel coordinates
export const MAZE_WALLS: Wall[] = wallsData.map((wall) => {
    const x = wall.column * cellSize;
    const y = wall.row * cellSize;
    const length = wall.length * cellSize;

    if (wall.horizontal) {
        // Horizontal wall - width is length, height is wallW
        return {
            x: x,
            y: y,
            width: length,
            height: wallW,
        };
    } else {
        // Vertical wall - width is wallW, height is length
        return {
            x: x,
            y: y,
            width: wallW,
            height: length,
        };
    }
});

// Ball starting position - top-left cell center (inside the maze boundary)
export const BALL_START = {
    x: wallW + pathW / 2,   // Center of first cell X
    y: wallW + pathW / 2,   // Center of first cell Y
};

// Goal position - CENTER of the maze (matching reference: 350/2, 315/2)
export const GOAL_POSITION: Goal = {
    x: DEFAULT_CONFIG.canvasWidth / 2,
    y: DEFAULT_CONFIG.canvasHeight / 2,
    radius: DEFAULT_CONFIG.goalRadius,
};

// Corner decorations (small red dots) - all 4 corners
export const CORNER_DOTS = [
    { x: wallW / 2, y: wallW / 2 },  // Top-left
    { x: DEFAULT_CONFIG.canvasWidth - wallW / 2, y: wallW / 2 }, // Top-right
    { x: wallW / 2, y: DEFAULT_CONFIG.canvasHeight - wallW / 2 }, // Bottom-left
    { x: DEFAULT_CONFIG.canvasWidth - wallW / 2, y: DEFAULT_CONFIG.canvasHeight - wallW / 2 }, // Bottom-right
];

export function createInitialState(): GameState {
    return {
        ball: { x: BALL_START.x, y: BALL_START.y, vx: 0, vy: 0 },
        status: 'idle',
        time: 0,
        startTime: 0,
    };
}

// Check collision between ball and a wall
function checkBallWallCollision(
    ballX: number,
    ballY: number,
    ballRadius: number,
    wall: Wall
): { collides: boolean; normalX: number; normalY: number; penetration: number } {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(wall.x, Math.min(ballX, wall.x + wall.width));
    const closestY = Math.max(wall.y, Math.min(ballY, wall.y + wall.height));

    // Calculate distance
    const distX = ballX - closestX;
    const distY = ballY - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance < ballRadius) {
        // Collision detected
        const normalX = distance > 0 ? distX / distance : 0;
        const normalY = distance > 0 ? distY / distance : 1;
        const penetration = ballRadius - distance;

        return { collides: true, normalX, normalY, penetration };
    }

    return { collides: false, normalX: 0, normalY: 0, penetration: 0 };
}

// Check if ball reached the goal
function checkGoalReached(ballX: number, ballY: number): boolean {
    const dx = ballX - GOAL_POSITION.x;
    const dy = ballY - GOAL_POSITION.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Win when ball is within the goal radius
    return distance < GOAL_POSITION.radius;
}

export function updateBall(state: GameState, tiltX: number, tiltY: number): GameState {
    if (state.status !== 'playing') return state;

    const maxVelocity = 1.5;

    // Apply acceleration based on tilt
    let newVx = state.ball.vx + tiltX * DEFAULT_CONFIG.acceleration;
    let newVy = state.ball.vy + tiltY * DEFAULT_CONFIG.acceleration;

    // Clamp velocity
    newVx = Math.max(-maxVelocity, Math.min(maxVelocity, newVx));
    newVy = Math.max(-maxVelocity, Math.min(maxVelocity, newVy));

    // Apply friction
    newVx *= DEFAULT_CONFIG.friction;
    newVy *= DEFAULT_CONFIG.friction;

    // Calculate new position
    let newX = state.ball.x + newVx;
    let newY = state.ball.y + newVy;

    // Check collision with all walls
    for (const wall of MAZE_WALLS) {
        const collision = checkBallWallCollision(newX, newY, DEFAULT_CONFIG.ballRadius, wall);

        if (collision.collides) {
            // Push ball out of wall
            newX += collision.normalX * collision.penetration;
            newY += collision.normalY * collision.penetration;

            // Reflect velocity (with damping)
            const dotProduct = newVx * collision.normalX + newVy * collision.normalY;
            newVx -= 1.5 * dotProduct * collision.normalX;
            newVy -= 1.5 * dotProduct * collision.normalY;

            // Apply damping on bounce
            newVx *= 0.5;
            newVy *= 0.5;
        }
    }

    // Check win condition
    if (checkGoalReached(newX, newY)) {
        return {
            ...state,
            ball: { x: newX, y: newY, vx: 0, vy: 0 },
            status: 'won',
            time: Date.now() - state.startTime,
        };
    }

    return {
        ...state,
        ball: { x: newX, y: newY, vx: newVx, vy: newVy },
    };
}

export function startGame(state: GameState): GameState {
    return {
        ...createInitialState(),
        status: 'playing',
        startTime: Date.now(),
    };
}

export function resetGame(): GameState {
    return createInitialState();
}
