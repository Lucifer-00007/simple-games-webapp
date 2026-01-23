'use client';

import * as React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startNewBall, updateCricket } from './game-logic';
import { GameState, CRICKET_CONFIG } from './types';
import styles from './styles.module.css';

export function DoodleCricket({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [state, setState] = React.useState<GameState>(createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>(0);

    const handleAction = () => {
        if (state.status === 'idle') {
            setState(prev => startNewBall(prev));
        } else if (state.status === 'bowling') {
            setState(prev => ({ ...prev, isSwinging: true, lastSwingTime: Date.now() }));
            setTimeout(() => setState(prev => ({ ...prev, isSwinging: false })), 200);
        } else if (state.status === 'gameOver') {
            setState(createInitialState());
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.status]);

    const animate = () => {
        setState(prev => {
            const next = updateCricket(prev);
            if (prev.status !== 'gameOver' && next.status === 'gameOver') {
                onScoreUpdate?.(next.score);
            }
            return next;
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Pitch
        ctx.fillStyle = '#86efac';
        ctx.fillRect(0, 300, canvas.width, 100);

        // Stumps
        ctx.fillStyle = '#78350f';
        ctx.fillRect(CRICKET_CONFIG.STUMPS_X, CRICKET_CONFIG.STUMPS_Y, 5, 50);
        ctx.fillRect(CRICKET_CONFIG.STUMPS_X + 10, CRICKET_CONFIG.STUMPS_Y, 5, 50);
        ctx.fillRect(CRICKET_CONFIG.STUMPS_X + 20, CRICKET_CONFIG.STUMPS_Y, 5, 50);

        // Batter
        ctx.fillStyle = '#3b82f6';
        const batterX = 520;
        ctx.fillRect(batterX, 230, 20, 70);
        
        // Bat
        ctx.save();
        ctx.translate(batterX, 260);
        if (state.isSwinging) ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-5, 0, 10, 40);
        ctx.restore();

        // Ball
        if (state.ball.active) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [state]);

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Runs</span>
                            <span className={styles.statValue}>{state.score}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Wickets</span>
                            <span className={styles.statValue}>{state.wickets}/3</span>
                        </div>
                    </div>

                    <div className={styles.canvasContainer} onClick={handleAction}>
                        <canvas ref={canvasRef} width={600} height={400} className={styles.canvas} />
                        
                        {state.status === 'idle' && (
                            <div className={styles.overlay}>
                                <Button size="lg">Ready? Click to Bowl</Button>
                            </div>
                        )}

                        {state.status === 'gameOver' && (
                            <div className={styles.overlay}>
                                <h2 className={styles.overlayTitle}>Match Over!</h2>
                                <p className={styles.overlaySubtitle}>Final Score: {state.score}</p>
                                <Button onClick={() => setState(createInitialState())}>Play Again</Button>
                            </div>
                        )}
                    </div>
                    
                    <p className={styles.instructions}>Wait for the ball, then click or press Space to swing!</p>
                </CardContent>
            </Card>
        </div>
    );
}
