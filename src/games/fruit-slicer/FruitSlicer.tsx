'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, resetGame, tick, checkSlice, addSlicePoint } from './game-logic';
import { GameState, DEFAULT_CONFIG, FRUIT_EMOJIS } from './types';
import styles from './styles.module.css';

interface FruitSlicerProps {
    onScoreUpdate?: (score: number) => void;
}

export function FruitSlicer({ onScoreUpdate }: FruitSlicerProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isSlicing = React.useRef(false);

    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, DEFAULT_CONFIG.canvasWidth, DEFAULT_CONFIG.canvasHeight);

        // Draw slice trail
        if (gameState.sliceTrail.length > 1) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 1; i < gameState.sliceTrail.length; i++) {
                const prev = gameState.sliceTrail[i - 1];
                const curr = gameState.sliceTrail[i];
                const alpha = 1 - curr.age / 10;

                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        // Draw fruits
        gameState.fruits.forEach((fruit) => {
            if (fruit.sliced) {
                ctx.globalAlpha = 0.3;
            }

            ctx.save();
            ctx.translate(fruit.x, fruit.y);
            ctx.rotate((fruit.rotation * Math.PI) / 180);
            ctx.font = `${fruit.radius * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(FRUIT_EMOJIS[fruit.type], 0, 0);
            ctx.restore();

            ctx.globalAlpha = 1;
        });

        // Draw bombs
        gameState.bombs.forEach((bomb) => {
            ctx.font = `${bomb.radius * 2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', bomb.x, bomb.y);
        });
    }, [gameState]);

    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const loop = () => {
                setGameState((prev) => {
                    const newState = tick(prev);
                    if (newState.status === 'gameOver' && prev.status === 'playing') {
                        onScoreUpdate?.(newState.highScore);
                    }
                    return newState;
                });
                gameLoopRef.current = requestAnimationFrame(loop);
            };
            gameLoopRef.current = requestAnimationFrame(loop);
        }

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState.status, onScoreUpdate]);

    React.useEffect(() => {
        draw();
    }, [draw]);

    const handleSlice = (clientX: number, clientY: number) => {
        if (gameState.status !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = DEFAULT_CONFIG.canvasWidth / rect.width;
        const scaleY = DEFAULT_CONFIG.canvasHeight / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        setGameState((prev) => {
            let state = checkSlice(prev, x, y);
            state = addSlicePoint(state, x, y);
            return state;
        });
    };

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = () => {
            isSlicing.current = true;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isSlicing.current) {
                handleSlice(e.clientX, e.clientY);
            }
        };

        const handleMouseUp = () => {
            isSlicing.current = false;
            setGameState((prev) => ({ ...prev, sliceTrail: [] }));
        };

        const handleTouchStart = () => {
            isSlicing.current = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isSlicing.current && e.touches[0]) {
                e.preventDefault();
                handleSlice(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleTouchEnd = () => {
            isSlicing.current = false;
            setGameState((prev) => ({ ...prev, sliceTrail: [] }));
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    return (
        <div className={styles.container} ref={containerRef} tabIndex={0}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <motion.span
                                key={gameState.score}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={styles.statValue}
                            >
                                {gameState.score}
                            </motion.span>
                            <span className={styles.statLabel}>Score</span>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.lives}>
                                {Array.from({ length: gameState.lives }).map((_, i) => (
                                    <span key={i} className={styles.lifeIcon}>
                                        ❤️
                                    </span>
                                ))}
                            </div>
                            <span className={styles.statLabel}>Lives</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    <div className={styles.canvasContainer}>
                        <canvas
                            ref={canvasRef}
                            width={DEFAULT_CONFIG.canvasWidth}
                            height={DEFAULT_CONFIG.canvasHeight}
                            className={styles.canvas}
                        />

                        {gameState.status !== 'playing' && (
                            <div className={styles.overlay}>
                                {gameState.status === 'idle' && (
                                    <>
                                        <div className={styles.overlayTitle}>🔪 Fruit Slicer</div>
                                        <div className={styles.overlaySubtitle}>
                                            Swipe to slice fruits, avoid bombs!
                                        </div>
                                    </>
                                )}
                                {gameState.status === 'gameOver' && (
                                    <>
                                        <div className={`${styles.overlayTitle} ${styles.gameOverText}`}>
                                            Game Over!
                                        </div>
                                        <div className={styles.overlaySubtitle}>
                                            Score: {gameState.score}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.controls}>
                        {gameState.status === 'idle' && (
                            <Button onClick={handleStart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        )}
                        {gameState.status === 'gameOver' && (
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                    </div>

                    <div className={styles.instructions}>
                        Swipe or drag to slice fruits
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
