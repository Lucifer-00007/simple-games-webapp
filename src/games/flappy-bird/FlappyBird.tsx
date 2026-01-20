'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, jump, resetGame, tick } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface FlappyBirdProps {
    onScoreUpdate?: (score: number) => void;
}

export function FlappyBird({ onScoreUpdate }: FlappyBirdProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Draw game
    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { canvasWidth, canvasHeight } = DEFAULT_CONFIG;

        // Sky gradient background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#98D8E8');
        skyGradient.addColorStop(1, '#B8E8B8');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudPositions = [
            { x: 50, y: 80 },
            { x: 200, y: 120 },
            { x: 320, y: 60 },
        ];
        cloudPositions.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.arc(x + 25, y - 10, 20, 0, Math.PI * 2);
            ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, canvasHeight - 25, canvasWidth, 8);

        // Draw pipes
        gameState.pipes.forEach((pipe) => {
            // Pipe gradient
            const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
            pipeGradient.addColorStop(0, '#2d8f2d');
            pipeGradient.addColorStop(0.5, '#3cb043');
            pipeGradient.addColorStop(1, '#2d8f2d');

            // Top pipe
            ctx.fillStyle = pipeGradient;
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);

            // Top pipe cap
            ctx.fillStyle = '#228B22';
            ctx.fillRect(pipe.x - 4, pipe.topHeight - 20, pipe.width + 8, 20);

            // Bottom pipe
            ctx.fillStyle = pipeGradient;
            ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvasHeight - pipe.bottomY);

            // Bottom pipe cap
            ctx.fillStyle = '#228B22';
            ctx.fillRect(pipe.x - 4, pipe.bottomY, pipe.width + 8, 20);
        });

        // Draw bird
        ctx.save();
        ctx.translate(gameState.bird.x, gameState.bird.y);
        ctx.rotate((gameState.bird.rotation * Math.PI) / 180);

        // Bird body
        const birdGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gameState.bird.radius);
        birdGradient.addColorStop(0, '#FFD700');
        birdGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = birdGradient;
        ctx.beginPath();
        ctx.arc(0, 0, gameState.bird.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bird eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(6, -4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(8, -4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Bird beak
        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.moveTo(gameState.bird.radius - 2, 0);
        ctx.lineTo(gameState.bird.radius + 10, 3);
        ctx.lineTo(gameState.bird.radius - 2, 6);
        ctx.closePath();
        ctx.fill();

        // Bird wing
        ctx.fillStyle = '#E6A700';
        ctx.beginPath();
        ctx.ellipse(-5, 5, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }, [gameState]);

    // Game loop
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

    // Draw on state change
    React.useEffect(() => {
        draw();
    }, [draw]);

    // Handle jump
    const handleJump = React.useCallback(() => {
        setGameState((prev) => {
            if (prev.status === 'gameOver') return prev;
            return jump(prev);
        });
    }, []);

    // Keyboard/touch controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault();
                handleJump();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJump]);

    const handleCanvasClick = () => {
        handleJump();
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
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
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className={styles.statValue}
                            >
                                {gameState.score}
                            </motion.span>
                            <span className={styles.statLabel}>Score</span>
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
                            onClick={handleCanvasClick}
                        />

                        {/* Overlay */}
                        {gameState.status !== 'playing' && (
                            <div className={styles.overlay} onClick={handleCanvasClick}>
                                {gameState.status === 'idle' && (
                                    <>
                                        <div className={styles.overlayTitle}>🐦 Flappy Bird</div>
                                        <div className={styles.overlaySubtitle}>
                                            Tap or press Space to fly!
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

                    {/* Controls */}
                    <div className={styles.controls}>
                        {gameState.status === 'gameOver' && (
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                    </div>

                    <div className={styles.instructions}>
                        Tap, click, or press Space/↑ to flap
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
