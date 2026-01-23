'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, updateGame } from './game-logic';
import { GameState, DINO_CONFIG } from './types';
import styles from './styles.module.css';

export function DinoRun({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [state, setState] = React.useState<GameState>(createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>(0);

    const handleJump = React.useCallback(() => {
        if (state.status === 'playing' && !state.dino.isJumping) {
            setState(prev => ({
                ...prev,
                dino: { ...prev.dino, velocity: DINO_CONFIG.JUMP_FORCE, isJumping: true }
            }));
        } else if (state.status !== 'playing') {
            setState(prev => ({ ...createInitialState(), status: 'playing', highScore: prev.highScore }));
        }
    }, [state.status, state.dino.isJumping]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleJump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJump]);

    const animate = (time: number) => {
        setState(prev => {
            const newState = updateGame(prev, 16);
            if (prev.status === 'playing' && newState.status === 'gameOver') {
                onScoreUpdate?.(newState.score);
            }
            return newState;
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

        // Draw Game
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ground Line
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#ccc';
        ctx.beginPath();
        ctx.moveTo(0, DINO_CONFIG.GROUND_Y + 40);
        ctx.lineTo(canvas.width, DINO_CONFIG.GROUND_Y + 40);
        ctx.stroke();

        // Dino
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(state.dino.x, state.dino.y, state.dino.width, state.dino.height);

        // Obstacles
        state.obstacles.forEach(obs => {
            ctx.fillStyle = obs.type === 'cactus' ? '#10b981' : '#f59e0b';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }, [state]);

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Score</span>
                            <span className={styles.statValue}>{state.score}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>HI</span>
                            <span className={styles.statValue}>{state.highScore}</span>
                        </div>
                    </div>

                    <div className={styles.canvasContainer} onClick={handleJump}>
                        <canvas ref={canvasRef} width={600} height={200} className={styles.canvas} />
                        
                        {state.status !== 'playing' && (
                            <div className={styles.overlay}>
                                <h2 className={styles.overlayTitle}>
                                    {state.status === 'gameOver' ? 'Game Over' : 'Dino Run'}
                                </h2>
                                <Button onClick={handleJump} size="lg" className={styles.startButton}>
                                    {state.status === 'gameOver' ? <RotateCcw className="mr-2" /> : <Play className="mr-2" />}
                                    {state.status === 'gameOver' ? 'Try Again' : 'Start (Space)'}
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <p className={styles.instructions}>Press Space or Click to Jump</p>
                </CardContent>
            </Card>
        </div>
    );
}
