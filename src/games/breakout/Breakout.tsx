'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createInitialState,
    startGame,
    togglePause,
    resetGame,
    movePaddle,
    tick,
    setSpeed,
} from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface BreakoutProps {
    onScoreUpdate?: (score: number) => void;
}

export function Breakout({ onScoreUpdate }: BreakoutProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Draw game
    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, DEFAULT_CONFIG.canvasWidth, DEFAULT_CONFIG.canvasHeight);

        // Draw bricks
        gameState.bricks.forEach((brick) => {
            if (!brick.destroyed) {
                ctx.fillStyle = brick.color;
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
                ctx.fill();

                // Brick highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(brick.x, brick.y, brick.width, 3);
            }
        });

        // Draw paddle
        const gradient = ctx.createLinearGradient(
            gameState.paddle.x,
            gameState.paddle.y,
            gameState.paddle.x,
            gameState.paddle.y + gameState.paddle.height
        );
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
            gameState.paddle.x,
            gameState.paddle.y,
            gameState.paddle.width,
            gameState.paddle.height,
            4
        );
        ctx.fill();

        // Draw ball
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
        const ballGradient = ctx.createRadialGradient(
            gameState.ball.x - 2,
            gameState.ball.y - 2,
            0,
            gameState.ball.x,
            gameState.ball.y,
            gameState.ball.radius
        );
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = ballGradient;
        ctx.fill();
    }, [gameState]);

    // Game loop
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const loop = () => {
                setGameState((prev) => {
                    const newState = tick(prev);
                    if (
                        (newState.status === 'gameOver' || newState.status === 'won') &&
                        prev.status === 'playing'
                    ) {
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

    // Draw on state change
    React.useEffect(() => {
        draw();
    }, [draw]);

    // Mouse/touch controls
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = DEFAULT_CONFIG.canvasWidth / rect.width;
            const x = (e.clientX - rect.left) * scaleX;
            setGameState((prev) => movePaddle(prev, x));
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleX = DEFAULT_CONFIG.canvasWidth / rect.width;
            const x = (e.touches[0].clientX - rect.left) * scaleX;
            setGameState((prev) => movePaddle(prev, x));
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' && gameState.status === 'idle') {
                e.preventDefault();
                setGameState((prev) => startGame(prev));
            } else if (e.key === 'p' || e.key === 'Escape') {
                e.preventDefault();
                setGameState((prev) => togglePause(prev));
            } else if (e.key === 'ArrowLeft' || e.key === 'a') {
                e.preventDefault();
                setGameState((prev) =>
                    movePaddle(prev, prev.paddle.x + prev.paddle.width / 2 - 20)
                );
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                e.preventDefault();
                setGameState((prev) =>
                    movePaddle(prev, prev.paddle.x + prev.paddle.width / 2 + 20)
                );
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handlePauseToggle = () => {
        setGameState((prev) => togglePause(prev));
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const handleSpeedChange = (speed: number) => {
        setGameState((prev) => setSpeed(prev, speed));
        // Remove focus from button to prevent spacebar triggering it
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        // Return focus to container for keyboard controls
        containerRef.current?.focus();
    };

    return (
        <div className={styles.container} ref={containerRef} tabIndex={0}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Stats Bar */}
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

                    {/* Canvas */}
                    <div className={styles.canvasContainer}>
                        <canvas
                            ref={canvasRef}
                            width={DEFAULT_CONFIG.canvasWidth}
                            height={DEFAULT_CONFIG.canvasHeight}
                            className={styles.canvas}
                        />

                        {/* Overlay */}
                        {gameState.status !== 'playing' && (
                            <div className={styles.overlay}>
                                {gameState.status === 'idle' && (
                                    <>
                                        <div className={styles.overlayTitle}>🧱 Breakout</div>
                                        <div className={styles.overlaySubtitle}>
                                            Move mouse to control paddle
                                        </div>
                                    </>
                                )}
                                {gameState.status === 'paused' && (
                                    <div className={styles.overlayTitle}>⏸️ Paused</div>
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
                                {gameState.status === 'won' && (
                                    <>
                                        <div className={`${styles.overlayTitle} ${styles.wonText}`}>
                                            🎉 You Win!
                                        </div>
                                        <div className={styles.overlaySubtitle}>
                                            Score: {gameState.score}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Speed Controls */}
                    <div className={styles.speedControls}>
                        <span className={styles.controlLabel}>Speed:</span>
                        <Button
                            variant={gameState.speed === 0.75 ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSpeedChange(0.75)}
                            className={styles.speedButton}
                        >
                            Slow
                        </Button>
                        <Button
                            variant={gameState.speed === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSpeedChange(1)}
                            className={styles.speedButton}
                        >
                            Normal
                        </Button>
                        <Button
                            variant={gameState.speed === 1.5 ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSpeedChange(1.5)}
                            className={styles.speedButton}
                        >
                            Fast
                        </Button>
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        {gameState.status === 'idle' && (
                            <Button onClick={handleStart} className={styles.controlButton}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        )}
                        {gameState.status === 'playing' && (
                            <Button
                                onClick={handlePauseToggle}
                                variant="outline"
                                className={styles.controlButton}
                            >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                            </Button>
                        )}
                        {gameState.status === 'paused' && (
                            <Button onClick={handlePauseToggle} className={styles.controlButton}>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                            </Button>
                        )}
                        {(gameState.status === 'gameOver' || gameState.status === 'won') && (
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                        {gameState.status !== 'idle' &&
                            gameState.status !== 'gameOver' &&
                            gameState.status !== 'won' && (
                                <Button
                                    onClick={handleRestart}
                                    variant="outline"
                                    className={styles.controlButton}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restart
                                </Button>
                            )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
