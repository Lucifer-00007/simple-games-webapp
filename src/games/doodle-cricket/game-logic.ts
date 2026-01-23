import { GameState, CRICKET_CONFIG, Ball } from './types';

export function createInitialState(): GameState {
    return {
        status: 'idle',
        score: 0,
        wickets: 0,
        ball: { x: 300, y: 160, vx: 0, vy: 0, active: false },
        isSwinging: false,
        lastSwingTime: 0,
        difficulty: 1,
    };
}

export function startNewBall(state: GameState): GameState {
    // Variable speed and spin based on difficulty
    const vx = (Math.random() - 0.5) * 2; // Slight side to side
    const vy = 4 + Math.random() * 2 + (state.difficulty * 0.5);
    
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
    if (state.status === 'idle' || state.status === 'gameOver') return state;

    const newState = { ...state, ball: { ...state.ball } };
    const { ball } = newState;

    if (!ball.active) return state;

    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce (Perspective bounce)
    // The ball should bounce roughly halfway through the pitch
    if (newState.status === 'bowling' && ball.y > 250 && ball.y < 260 && ball.vy > 0) {
        ball.vy *= 0.8; // Small energy loss on bounce
    }

    // Hit Detection
    // Batter is around Y=340. 
    if (newState.isSwinging && ball.y > 300 && ball.y < 380 && newState.status === 'bowling') {
        const timingBonus = 1 - Math.abs(ball.y - 340) / 40;
        if (timingBonus > 0) {
            // Successful hit!
            ball.vx = (Math.random() - 0.5) * 20;
            ball.vy = -10 - Math.random() * 10;
            
            // Scoring
            let runs = 1;
            if (timingBonus > 0.8) runs = 6;
            else if (timingBonus > 0.6) runs = 4;
            else if (timingBonus > 0.4) runs = 2;
            
            newState.score += runs;
            newState.status = 'playing';
            newState.difficulty += 0.1;
        }
    }

    // Out (Missed and hit stumps)
    if (newState.status === 'bowling' && ball.y > 360) {
        if (Math.abs(ball.x - CRICKET_CONFIG.STUMPS_X) < 20) {
            newState.wickets += 1;
            newState.status = newState.wickets >= 3 ? 'gameOver' : 'idle';
            ball.active = false;
        } else {
            // Missed but didn't hit stumps (Wide/Passed)
            newState.status = 'idle';
            ball.active = false;
        }
    }

    // Ball out of play (after being hit)
    if (newState.status === 'playing' && (ball.y < 0 || ball.y > 400 || ball.x < 0 || ball.x > 600)) {
        newState.status = 'idle';
        ball.active = false;
    }

    return newState;
}