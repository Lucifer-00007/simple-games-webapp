// Fruit Slicer game logic

import { Fruit, Bomb, SliceTrail, GameState, GameConfig, DEFAULT_CONFIG, FRUIT_TYPES, FruitType } from './types';

let idCounter = 0;

function generateId(): string {
    return `obj-${idCounter++}`;
}

export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        fruits: [],
        bombs: [],
        sliceTrail: [],
        status: 'idle',
        score: 0,
        highScore: 0,
        lives: config.initialLives,
        frameCount: 0,
    };
}

function spawnFruit(config: GameConfig = DEFAULT_CONFIG): Fruit {
    const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    const x = 50 + Math.random() * (config.canvasWidth - 100);

    return {
        id: generateId(),
        type,
        x,
        y: config.canvasHeight + config.fruitRadius,
        vx: (Math.random() - 0.5) * 4,
        vy: -(12 + Math.random() * 4),
        radius: config.fruitRadius,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 10,
        sliced: false,
    };
}

function spawnBomb(config: GameConfig = DEFAULT_CONFIG): Bomb {
    const x = 50 + Math.random() * (config.canvasWidth - 100);

    return {
        id: generateId(),
        x,
        y: config.canvasHeight + config.bombRadius,
        vx: (Math.random() - 0.5) * 3,
        vy: -(10 + Math.random() * 3),
        radius: config.bombRadius,
    };
}

export function tick(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'playing') return state;

    const frameCount = state.frameCount + 1;

    // Update fruits
    let fruits = state.fruits.map(fruit => ({
        ...fruit,
        x: fruit.x + fruit.vx,
        y: fruit.y + fruit.vy,
        vy: fruit.vy + config.gravity,
        rotation: fruit.rotation + fruit.rotationSpeed,
    }));

    // Update bombs
    let bombs = state.bombs.map(bomb => ({
        ...bomb,
        x: bomb.x + bomb.vx,
        y: bomb.y + bomb.vy,
        vy: bomb.vy + config.gravity,
    }));

    // Check for missed fruits (fell off bottom without being sliced)
    let lives = state.lives;
    const missedFruits = fruits.filter(f =>
        !f.sliced && f.y > config.canvasHeight + f.radius * 2 && f.vy > 0
    );
    if (missedFruits.length > 0) {
        lives -= missedFruits.length;
    }

    // Remove off-screen objects
    fruits = fruits.filter(f =>
        f.y < config.canvasHeight + f.radius * 3 || f.vy < 0
    );
    bombs = bombs.filter(b =>
        b.y < config.canvasHeight + b.radius * 3 || b.vy < 0
    );

    // Spawn new objects
    if (frameCount % config.spawnInterval === 0) {
        const spawnCount = 1 + Math.floor(state.score / 100);
        for (let i = 0; i < Math.min(spawnCount, 3); i++) {
            fruits.push(spawnFruit(config));
        }
        // Occasionally spawn bombs
        if (Math.random() < 0.2) {
            bombs.push(spawnBomb(config));
        }
    }

    // Update slice trail
    const sliceTrail = state.sliceTrail
        .map(t => ({ ...t, age: t.age + 1 }))
        .filter(t => t.age < 10);

    // Check game over
    const status = lives <= 0 ? 'gameOver' : 'playing';

    return {
        ...state,
        fruits,
        bombs,
        sliceTrail,
        lives: Math.max(0, lives),
        frameCount,
        status,
        highScore: Math.max(state.highScore, state.score),
    };
}

export function addSlicePoint(state: GameState, x: number, y: number): GameState {
    if (state.status !== 'playing') return state;

    const sliceTrail = [...state.sliceTrail, { x, y, age: 0 }].slice(-20);
    return { ...state, sliceTrail };
}

export function checkSlice(
    state: GameState,
    x: number,
    y: number,
    config: GameConfig = DEFAULT_CONFIG
): GameState {
    if (state.status !== 'playing') return state;

    let score = state.score;
    let lives = state.lives;
    let status = state.status;

    // Check bomb collision
    const hitBomb = state.bombs.find(bomb => {
        const dist = Math.sqrt((bomb.x - x) ** 2 + (bomb.y - y) ** 2);
        return dist < bomb.radius + 20;
    });

    if (hitBomb) {
        return {
            ...state,
            status: 'gameOver',
            highScore: Math.max(state.highScore, state.score),
        };
    }

    // Check fruit collision
    const fruits = state.fruits.map(fruit => {
        if (fruit.sliced) return fruit;

        const dist = Math.sqrt((fruit.x - x) ** 2 + (fruit.y - y) ** 2);
        if (dist < fruit.radius + 20) {
            score += 10;
            return { ...fruit, sliced: true };
        }
        return fruit;
    });

    return {
        ...state,
        fruits,
        score,
        lives,
        status,
    };
}

export function startGame(state: GameState): GameState {
    if (state.status === 'playing') return state;
    return {
        ...state,
        status: 'playing',
    };
}

export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newState = createInitialState(config);
    return {
        ...newState,
        highScore: state.highScore,
    };
}
