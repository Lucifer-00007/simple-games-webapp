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
    const vx = (Math.random() - 0.5) * 1.5; 
    const vy = 5 + Math.random() * 1.5 + (state.difficulty * 0.4);
    
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
    if (newState.status === 'bowling' && ball.y > 240 && ball.y < 255 && ball.vy > 0) {
        ball.vy *= 0.85; 
        ball.vx += (Math.random() - 0.5) * 0.5; // Slight deviation after bounce
    }

    // Hit Detection
    // Forgiving hit zone (Y=320 to 380)
    if (newState.isSwinging && ball.y > 310 && ball.y < 380 && newState.status === 'bowling') {
        const distFromCenter = Math.abs(ball.y - 345);
        const timingBonus = 1 - distFromCenter / 35; // 0 to 1
        
        if (timingBonus > 0) {
            // Successful hit!
            ball.vx = (Math.random() - 0.5) * 30;
            ball.vy = -12 - Math.random() * 12;
            
            // Scoring
            let runs = 1;
            if (timingBonus > 0.85) runs = 6;
            else if (timingBonus > 0.65) runs = 4;
            else if (timingBonus > 0.4) runs = 2;
            else if (timingBonus > 0.2) runs = 1;
            
            newState.score += runs;
            newState.status = 'playing';
            newState.difficulty += 0.08;
        }
    }

    // Out (Missed and hit stumps)
    if (newState.status === 'bowling' && ball.y > 370) {
        if (Math.abs(ball.x - CRICKET_CONFIG.STUMPS_X) < 25) {
            newState.wickets += 1;
            newState.status = newState.wickets >= 3 ? 'gameOver' : 'idle';
            ball.active = false;
        } else {
            // Missed but didn't hit stumps
            newState.status = 'idle';
            ball.active = false;
        }
    }

    // Ball out of play (after being hit)
    if (newState.status === 'playing' && (ball.y < -50 || ball.y > 450 || ball.x < -50 || ball.x > 650)) {
        newState.status = 'idle';
        ball.active = false;
    }

    return newState;
}
