// Archery game logic

import { Arrow, GameState, GameConfig, DEFAULT_CONFIG } from './types';

export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
    return {
        arrow: {
            power: 0,
            angle: 45,
            x: 50,
            y: config.canvasHeight - 50,
            flying: false,
        },
        score: 0,
        highScore: 0,
        arrowsLeft: config.totalArrows,
        wind: (Math.random() - 0.5) * 5,
        status: 'idle',
        lastHitScore: 0,
    };
}

export function startAiming(state: GameState): GameState {
    if (state.status !== 'idle' && state.status !== 'result') return state;
    return { ...state, status: 'aiming', arrow: { ...state.arrow, power: 0 } };
}

export function updatePower(state: GameState, power: number): GameState {
    if (state.status !== 'aiming') return state;
    return { ...state, arrow: { ...state.arrow, power: Math.min(100, Math.max(0, power)) } };
}

export function shoot(state: GameState): GameState {
    if (state.status !== 'aiming' || state.arrow.power === 0) return state;
    return { ...state, status: 'shooting', arrow: { ...state.arrow, flying: true } };
}

export function calculateHit(
    arrowX: number,
    arrowY: number,
    config: GameConfig = DEFAULT_CONFIG
): number {
    const dist = Math.sqrt(
        Math.pow(arrowX - config.targetX, 2) + Math.pow(arrowY - config.targetY, 2)
    );

    if (dist < 20) return 10; // Bullseye
    if (dist < 40) return 8;
    if (dist < 60) return 6;
    if (dist < 80) return 4;
    if (dist < 100) return 2;
    return 0;
}

export function updateArrow(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'shooting' || !state.arrow.flying) return state;

    const radians = (state.arrow.angle * Math.PI) / 180;
    const vx = Math.cos(radians) * state.arrow.power / 5;
    const vy = -Math.sin(radians) * state.arrow.power / 5;

    const newX = state.arrow.x + vx + state.wind * 0.5;
    const newY = state.arrow.y + vy + 2; // Gravity

    // Check if arrow hit target or off screen
    if (newX > config.canvasWidth || newY > config.canvasHeight || newY < 0) {
        const hitScore = calculateHit(newX, newY, config);
        const newArrowsLeft = state.arrowsLeft - 1;
        const newStatus = newArrowsLeft <= 0 ? 'gameOver' : 'result';

        return {
            ...state,
            arrow: { ...state.arrow, x: newX, y: newY, flying: false },
            score: state.score + hitScore,
            highScore: Math.max(state.highScore, state.score + hitScore),
            arrowsLeft: newArrowsLeft,
            status: newStatus,
            lastHitScore: hitScore,
            wind: (Math.random() - 0.5) * 5,
        };
    }

    return {
        ...state,
        arrow: { ...state.arrow, x: newX, y: newY },
    };
}

export function nextShot(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    if (state.status !== 'result') return state;
    return {
        ...state,
        arrow: {
            power: 0,
            angle: 45,
            x: 50,
            y: config.canvasHeight - 50,
            flying: false,
        },
        status: 'idle',
    };
}

export function resetGame(state: GameState, config: GameConfig = DEFAULT_CONFIG): GameState {
    const newState = createInitialState(config);
    return { ...newState, highScore: state.highScore };
}
