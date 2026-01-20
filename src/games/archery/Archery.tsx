'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startAiming, updatePower, shoot, updateArrow, nextShot, resetGame } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface ArcheryProps {
    onScoreUpdate?: (score: number) => void;
}

export function Archery({ onScoreUpdate }: ArcheryProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);

    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, DEFAULT_CONFIG.canvasWidth, DEFAULT_CONFIG.canvasHeight);

        // Draw target
        const targetX = DEFAULT_CONFIG.targetX;
        const targetY = DEFAULT_CONFIG.targetY;

        for (let i = 5; i > 0; i--) {
            ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#fff';
            ctx.beginPath();
            ctx.arc(targetX, targetY, i * 20, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw arrow
        if (gameState.status === 'shooting' || gameState.status === 'result') {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(gameState.arrow.x, gameState.arrow.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw wind indicator
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText(`Wind: ${gameState.wind.toFixed(1)}`, 10, 20);
    }, [gameState]);

    React.useEffect(() => {
        if (gameState.status === 'shooting') {
            const loop = () => {
                setGameState((prev) => {
                    const newState = updateArrow(prev);
                    if (newState.status === 'gameOver') {
                        onScoreUpdate?.(newState.highScore);
                    }
                    return newState;
                });
                if (gameState.arrow.flying) {
                    gameLoopRef.current = requestAnimationFrame(loop);
                }
            };
            gameLoopRef.current = requestAnimationFrame(loop);
        }

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState.status, gameState.arrow.flying, onScoreUpdate]);

    React.useEffect(() => {
        draw();
    }, [draw]);

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <motion.span key={gameState.score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={styles.statValue}>
                                {gameState.score}
                            </motion.span>
                            <span className={styles.statLabel}>Score</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.arrowsLeft}</span>
                            <span className={styles.statLabel}>Arrows</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    <canvas ref={canvasRef} width={DEFAULT_CONFIG.canvasWidth} height={DEFAULT_CONFIG.canvasHeight} className={styles.canvas} />

                    {gameState.status === 'aiming' && (
                        <div className={styles.powerBar}>
                            <div className={styles.powerLabel}>Power: {gameState.arrow.power}%</div>
                            <input
                                type="range"
                                value={gameState.arrow.power}
                                onChange={(e) => setGameState((prev) => updatePower(prev, Number(e.target.value)))}
                                max={100}
                                step={1}
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}

                    <div className={styles.controls}>
                        {(gameState.status === 'idle' || gameState.status === 'result') && (
                            <Button onClick={() => setGameState((prev) => startAiming(prev))} className={styles.controlButton}>
                                Aim
                            </Button>
                        )}
                        {gameState.status === 'aiming' && (
                            <Button onClick={() => setGameState((prev) => shoot(prev))} className={styles.controlButton}>
                                Shoot
                            </Button>
                        )}
                        {gameState.status === 'result' && (
                            <div className={styles.powerLabel}>Hit: {gameState.lastHitScore} points!</div>
                        )}
                        {gameState.status === 'gameOver' && (
                            <Button onClick={() => setGameState((prev) => resetGame(prev))} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
