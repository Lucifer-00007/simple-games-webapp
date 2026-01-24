// Crossy Road game types

export type GameStatus = 'idle' | 'playing' | 'gameOver';
export type LaneType = 'grass' | 'road' | 'water' | 'safe';
export type Direction = 'left' | 'right';
export type TrafficDensity = 'low' | 'medium' | 'high';

export interface Player {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
}

export interface GameObject {
    x: number;
    width: number;
    speed: number;
    direction: Direction;
    type: 'car' | 'truck' | 'log';
    color: string;
}

export interface Lane {
    type: LaneType;
    y: number;
    objects: GameObject[];
    direction: Direction;
    speed: number;
}

export interface GameState {
    player: Player;
    lanes: Lane[];
    status: GameStatus;
    score: number;
    highScore: number;
    cameraY: number;
    maxY: number;
    trafficDensity: TrafficDensity;
}

export interface GameConfig {
    canvasWidth: number;
    canvasHeight: number;
    gridSize: number;
    playerSize: number;
    laneCount: number;
    visibleLanes: number;
    carSpawnChance: number;
    minSpeed: number;
    maxSpeed: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    canvasWidth: 400,
    canvasHeight: 600,
    gridSize: 50,
    playerSize: 40,
    laneCount: 100,
    visibleLanes: 14,
    carSpawnChance: 0.7,
    minSpeed: 1.5,
    maxSpeed: 4,
};

// Lane colors
export const LANE_COLORS: Record<LaneType, string> = {
    grass: '#22c55e',
    road: '#374151',
    water: '#3b82f6',
    safe: '#16a34a',
};

// Vehicle colors
export const VEHICLE_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
];

// Traffic density settings
export interface TrafficDensitySettings {
    roadChance: number;      // Chance of a lane being a road (0-1)
    minVehicles: number;     // Minimum vehicles per road lane
    maxVehicles: number;     // Maximum vehicles per road lane
    speedMultiplier: number; // Speed multiplier for vehicles
}

export const TRAFFIC_DENSITY_SETTINGS: Record<TrafficDensity, TrafficDensitySettings> = {
    low: {
        roadChance: 0.3,
        minVehicles: 1,
        maxVehicles: 2,
        speedMultiplier: 0.8,
    },
    medium: {
        roadChance: 0.5,
        minVehicles: 1,
        maxVehicles: 3,
        speedMultiplier: 1.0,
    },
    high: {
        roadChance: 0.7,
        minVehicles: 2,
        maxVehicles: 4,
        speedMultiplier: 1.3,
    },
};

// Generate a random lane
export function generateLane(y: number, config: GameConfig = DEFAULT_CONFIG, density: TrafficDensity = 'medium'): Lane {
    const densitySettings = TRAFFIC_DENSITY_SETTINGS[density];
    const rand = Math.random();
    let type: LaneType;

    // First lane is always safe
    if (y === 0) {
        type = 'safe';
    } else if (rand < densitySettings.roadChance) {
        type = 'road';
    } else if (rand < densitySettings.roadChance + 0.3) {
        type = 'grass';
    } else {
        type = 'water';
    }

    const direction: Direction = Math.random() < 0.5 ? 'left' : 'right';
    const baseSpeed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    const speed = baseSpeed * densitySettings.speedMultiplier;
    const objects: GameObject[] = [];

    // Generate objects for roads and water
    if (type === 'road' || type === 'water') {
        const minCount = type === 'road' ? densitySettings.minVehicles : 1;
        const maxCount = type === 'road' ? densitySettings.maxVehicles : 2;
        const objectCount = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
        const objectType = type === 'road' ? (Math.random() < 0.5 ? 'car' : 'truck') : 'log';

        for (let i = 0; i < objectCount; i++) {
            const width = objectType === 'truck' ? 80 : objectType === 'log' ? 100 : 50;
            objects.push({
                x: (i * (config.canvasWidth / objectCount)) + Math.random() * 50,
                width,
                speed: speed * (direction === 'right' ? 1 : -1),
                direction,
                type: objectType,
                color: type === 'road'
                    ? VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)]
                    : '#8B4513',
            });
        }
    }

    return { type, y, objects, direction, speed };
}

// Generate initial lanes
export function generateInitialLanes(config: GameConfig = DEFAULT_CONFIG, density: TrafficDensity = 'medium'): Lane[] {
    const lanes: Lane[] = [];
    for (let i = 0; i < config.laneCount; i++) {
        lanes.push(generateLane(i, config, density));
    }
    return lanes;
}

// Create initial game state
export function createInitialState(config: GameConfig = DEFAULT_CONFIG, density: TrafficDensity = 'medium'): GameState {
    const lanes = generateInitialLanes(config, density);
    return {
        player: {
            x: Math.floor(config.canvasWidth / config.gridSize / 2),
            y: 0,
            targetX: Math.floor(config.canvasWidth / config.gridSize / 2),
            targetY: 0,
        },
        lanes,
        status: 'idle',
        score: 0,
        highScore: 0,
        cameraY: 0,
        maxY: 0,
        trafficDensity: density,
    };
}

// Move player
export function movePlayer(state: GameState, dx: number, dy: number, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    const gridCols = Math.floor(config.canvasWidth / config.gridSize);
    const newX = Math.max(0, Math.min(gridCols - 1, state.player.x + dx));
    const newY = Math.max(0, state.player.y + dy);

    // Check if target lane is water and no log at position
    const targetLane = state.lanes[newY];
    if (targetLane && targetLane.type === 'water') {
        const playerWorldX = newX * config.gridSize + config.gridSize / 2;
        const isOnLog = targetLane.objects.some(obj => {
            const objLeft = obj.x;
            const objRight = obj.x + obj.width;
            return playerWorldX > objLeft && playerWorldX < objRight;
        });

        if (!isOnLog && dy !== 0) {
            // Falling in water - game over
            return {
                ...state,
                player: { ...state.player, x: newX, y: newY, targetX: newX, targetY: newY },
                status: 'gameOver',
                highScore: Math.max(state.highScore, state.score),
            };
        }
    }

    // Update score if moving forward
    const newMaxY = Math.max(state.maxY, newY);
    const score = newMaxY > state.maxY ? state.score + 1 : state.score;

    return {
        ...state,
        player: { ...state.player, x: newX, y: newY, targetX: newX, targetY: newY },
        score,
        maxY: newMaxY,
    };
}

// Check collision with vehicles
function checkCollision(state: GameState, config: GameConfig = DEFAULT_CONFIG): boolean {
    const playerLane = state.lanes[state.player.y];
    if (!playerLane || playerLane.type !== 'road') return false;

    const playerLeft = state.player.x * config.gridSize;
    const playerRight = playerLeft + config.playerSize;
    const playerCenterX = playerLeft + config.playerSize / 2;

    for (const obj of playerLane.objects) {
        const objLeft = obj.x;
        const objRight = obj.x + obj.width;

        // Check overlap
        if (playerCenterX > objLeft && playerCenterX < objRight) {
            return true;
        }
    }

    return false;
}

// Update game state (called every frame)
export function tick(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    // Update all lane objects
    const newLanes = state.lanes.map(lane => {
        if (lane.objects.length === 0) return lane;

        const newObjects = lane.objects.map(obj => {
            let newX = obj.x + obj.speed;

            // Wrap around
            if (obj.speed > 0 && newX > config.canvasWidth + obj.width) {
                newX = -obj.width;
            } else if (obj.speed < 0 && newX < -obj.width) {
                newX = config.canvasWidth + obj.width;
            }

            return { ...obj, x: newX };
        });

        return { ...lane, objects: newObjects };
    });

    // Check if player is on water and should move with log
    let playerX = state.player.x;
    const playerLane = newLanes[state.player.y];
    if (playerLane && playerLane.type === 'water') {
        const playerWorldX = playerX * config.gridSize + config.gridSize / 2;
        const log = playerLane.objects.find(obj => {
            const objLeft = obj.x;
            const objRight = obj.x + obj.width;
            return playerWorldX > objLeft && playerWorldX < objRight;
        });

        if (log) {
            // Move with log
            const newWorldX = playerWorldX + log.speed;
            playerX = Math.floor(newWorldX / config.gridSize);

            // Check if player moved off screen
            if (newWorldX < 0 || newWorldX > config.canvasWidth) {
                return {
                    ...state,
                    lanes: newLanes,
                    status: 'gameOver',
                    highScore: Math.max(state.highScore, state.score),
                };
            }
        } else {
            // No log - drown
            return {
                ...state,
                lanes: newLanes,
                status: 'gameOver',
                highScore: Math.max(state.highScore, state.score),
            };
        }
    }

    // Update camera
    const targetCameraY = Math.max(0, state.player.y - 4);
    const cameraY = state.cameraY + (targetCameraY - state.cameraY) * 0.1;

    const newState: GameState = {
        ...state,
        player: { ...state.player, x: playerX },
        lanes: newLanes,
        cameraY,
    };

    // Check collision
    if (checkCollision(newState, config)) {
        return {
            ...newState,
            status: 'gameOver',
            highScore: Math.max(state.highScore, state.score),
        };
    }

    return newState;
}

// Start game
export function startGame(state: GameState): GameState {
    const newState = createInitialState(DEFAULT_CONFIG, state.trafficDensity);
    return {
        ...newState,
        status: 'playing',
        highScore: state.highScore,
    };
}

// Reset game
export function resetGame(state: GameState): GameState {
    const newState = createInitialState(DEFAULT_CONFIG, state.trafficDensity);
    return {
        ...newState,
        highScore: state.highScore,
    };
}

// Set traffic density
export function setTrafficDensity(state: GameState, density: TrafficDensity): GameState {
    // Only allow changing density when not playing
    if (state.status === 'playing') return state;

    const newState = createInitialState(DEFAULT_CONFIG, density);
    return {
        ...newState,
        highScore: state.highScore,
        trafficDensity: density,
    };
}
