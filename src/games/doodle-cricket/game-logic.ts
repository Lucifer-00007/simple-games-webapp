import { GameState, CRICKET_CONFIG, Ball } from './types';

export function createInitialState(): GameState {
    return {
        status: 'idle',
        score: 0,
        wickets: 0,
        ball: { x: 0, y: 0, vx: 0, vy: 0, active: false },
        isSwinging: false,
        lastSwingTime: 0,
        difficulty: 1,
    };
}

export function startNewBall(state: GameState): GameState {
    // Variable speed and spin based on difficulty
    const vx = 5 + Math.random() * 2 + (state.difficulty * 0.4);
    const vy = -2 - Math.random() * 2;
    // Add a slight vertical spin effect
    const spin = (Math.random() - 0.5) * 0.1 * state.difficulty;
    
    return {
        ...state,
        status: 'bowling',
        ball: {
            x: CRICKET_CONFIG.BOWLER_X,
            y: CRICKET_CONFIG.BOWLER_Y,
            vx,
            vy,
            active: true,
        }
    };
}

export function updateCricket(state: GameState): GameState {
    if (state.status !== 'bowling') return state;

    const newState = { ...state };
    const { ball } = newState;

    if (!ball.active) return state;

    // Physics
    ball.vy += CRICKET_CONFIG.GRAVITY;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce
    if (ball.y > 310) {
        ball.y = 310;
        ball.vy *= -0.75;
    }

    // Hit Detection (Timing based)
    // Batter is around X=530. Bat swing covers a small area.
    if (newState.isSwinging && ball.x > 480 && ball.x < 560 && ball.y > 200 && ball.y < 350) {
        // Successful hit
        ball.vx = -12 - Math.random() * 8;
        ball.vy = -8 - Math.random() * 12;
        
        // Scoring logic: 1, 2, 3, 4, or 6
        const rand = Math.random();
        let runs = 1;
        if (rand > 0.9) runs = 6;
        else if (rand > 0.7) runs = 4;
        else if (rand > 0.4) runs = 2;
        else if (rand > 0.2) runs = 3;
        
        newState.score += runs;
        newState.status = 'playing';
        newState.difficulty += 0.05;
        
        // Disable ball after it flies away
        setTimeout(() => {
            setStateProxy(newState, { ...newState, ball: { ...newState.ball, active: false }, status: 'idle' });
        }, 1500);
    }

    // Out (Hit stumps)
    if (ball.x >= CRICKET_CONFIG.STUMPS_X && ball.x <= CRICKET_CONFIG.STUMPS_X + 25 && 
        ball.y >= CRICKET_CONFIG.STUMPS_Y && ball.y <= CRICKET_CONFIG.STUMPS_Y + 50 &&
        newState.status === 'bowling') {
        
        newState.wickets += 1;
        newState.status = newState.wickets >= 3 ? 'gameOver' : 'idle';
        ball.active = false;
    }

    // Missed entirely
    if (ball.x > 600) {
        newState.status = 'idle';
        ball.active = false;
    }

    return newState;
}

// Helper to bridge the gap between pure logic and async state updates in component
function setStateProxy(current: any, next: any) {
    Object.assign(current, next);
}
