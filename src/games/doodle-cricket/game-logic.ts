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
    const vx = 4 + Math.random() * 3 + (state.difficulty * 0.5);
    const vy = -3 - Math.random() * 2;
    
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
    if (ball.y > 300) {
        ball.y = 300;
        ball.vy *= -0.8;
    }

    // Hit Detection
    if (newState.isSwinging && ball.x > 450 && ball.x < 550 && ball.y > 150 && ball.y < 350) {
        // Successful hit
        ball.vx = -10 - Math.random() * 10;
        ball.vy = -5 - Math.random() * 10;
        newState.score += Math.ceil(Math.random() * 6);
        newState.status = 'playing';
        newState.difficulty += 0.1;
        
        setTimeout(() => {
            newState.ball.active = false;
        }, 1000);
    }

    // Out (Stumps or Missed)
    if (ball.x > CRICKET_CONFIG.STUMPS_X + 20 && newState.status === 'bowling') {
        newState.wickets += 1;
        newState.status = newState.wickets >= 3 ? 'gameOver' : 'idle';
        ball.active = false;
    }

    return newState;
}
