// Shape Clicker game logic

import { GameState, Shape, ShapeType, GameConfig, COLORS, DEFAULT_CONFIG } from './types';

let nextId = 0;
const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'star'];

export function createInitialState(): GameState {
    return {
        shapes: [],
        score: 0,
        highScore: 0,
        timeLeft: DEFAULT_CONFIG.gameDuration,
        status: 'idle',
        shapesClicked: 0,
        shapesMissed: 0,
    };
}

export function startGame(state: GameState): GameState {
    nextId = 0;
    return {
        ...state,
        shapes: [],
        score: 0,
        timeLeft: DEFAULT_CONFIG.gameDuration,
        status: 'playing',
        shapesClicked: 0,
        shapesMissed: 0,
    };
}

export function spawnShape(state: GameState, width: number, height: number): GameState {
    if (state.status !== 'playing') return state;
    if (state.shapes.length >= DEFAULT_CONFIG.maxShapes) return state;

    const size = 40 + Math.random() * 30;
    const shape: Shape = {
        id: nextId++,
        type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
        x: Math.random() * (width - size),
        y: Math.random() * (height - size),
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    return {
        ...state,
        shapes: [...state.shapes, shape],
    };
}

export function clickShape(state: GameState, shapeId: number): GameState {
    if (state.status !== 'playing') return state;

    const shape = state.shapes.find(s => s.id === shapeId);
    if (!shape) return state;

    // Smaller shapes = more points, star = bonus
    const basePoints = Math.round(100 / shape.size * 10);
    const bonus = shape.type === 'star' ? 2 : 1;
    const points = basePoints * bonus;

    return {
        ...state,
        shapes: state.shapes.filter(s => s.id !== shapeId),
        score: state.score + points,
        shapesClicked: state.shapesClicked + 1,
    };
}

export function removeShape(state: GameState, shapeId: number): GameState {
    const exists = state.shapes.find(s => s.id === shapeId);
    return {
        ...state,
        shapes: state.shapes.filter(s => s.id !== shapeId),
        shapesMissed: exists ? state.shapesMissed + 1 : state.shapesMissed,
    };
}

export function tick(state: GameState): GameState {
    if (state.status !== 'playing') return state;

    const newTimeLeft = state.timeLeft - 1;
    if (newTimeLeft <= 0) {
        return {
            ...state,
            timeLeft: 0,
            status: 'finished',
            shapes: [],
            highScore: Math.max(state.highScore, state.score),
        };
    }

    return { ...state, timeLeft: newTimeLeft };
}

export function resetGame(state: GameState): GameState {
    return {
        ...createInitialState(),
        highScore: state.highScore,
    };
}
