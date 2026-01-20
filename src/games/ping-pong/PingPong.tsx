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
    movePlayerPaddle,
    movePlayerPaddleToPosition,
    tick,
} from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface PingPongProps {
    onScoreUpdate?: (score: number) => void;
}

export function PingPong({ onScoreUpdate }: PingPongProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const keysPressed = React.useRef<Set<string>>(new Set());

    // Draw game
    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { canvasWidth, canvasHeight } = DEFAULT_CONFIG;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw center line
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw player paddle (green)
        const playerGradient = ctx.createLinearGradient(
            gameState.playerPaddle.x,
            0,
            gameState.playerPaddle.x + gameState.playerPaddle.width,
            0
        );
        playerGradient.addColorStop(0, '#22c55e');
        playerGradient.addColorStop(1, '#16a34a');
        ctx.fillStyle = playerGradient;
        ctx.beginPath();
        ctx.roundRect(
            gameState.playerPaddle.x,
            gameState.playerPaddle.y,
            gameState.playerPaddle.width,
            gameState.playerPaddle.height,
            4
        );
        ctx.fill();

        // Draw AI paddle (red)
        const aiGradient = ctx.createLinearGradient(
            gameState.aiPaddle.x,
            0,
            gameState.aiPaddle.x + gameState.aiPaddle.width,
            0
        );
        aiGradient.addColorStop(0, '#ef4444');
        aiGradient.addColorStop(1, '#dc2626');
        ctx.fillStyle = aiGradient;
        ctx.beginPath();
        ctx.roundRect(
            gameState.aiPaddle.x,
            gameState.aiPaddle.y,
            gameState.aiPaddle.width,
            gameState.aiPaddle.height,
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
                // Handle continuous keyboard input
                if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
                    setGameState((prev) => movePlayerPaddle(prev, 'up'));
                }
                if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
                    setGameState((prev) => movePlayerPaddle(prev, 'down'));
                }

                setGameState((prev) => {
                    const newState = tick(prev);
                    if (newState.status === 'gameOver' && prev.status === 'playing') {
                        onScoreUpdate?.(newState.playerScore);
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

    // Mouse controls
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleY = DEFAULT_CONFIG.canvasHeight / rect.height;
            const y = (e.clientY - rect.top) * scaleY;
            setGameState((prev) => movePlayerPaddleToPosition(prev, y));
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleY = DEFAULT_CONFIG.canvasHeight / rect.height;
            const y = (e.touches[0].clientY - rect.top) * scaleY;
            setGameState((prev) => movePlayerPaddleToPosition(prev, y));
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
            keysPressed.current.add(e.key);

            if (e.key === ' ' && gameState.status === 'idle') {
                e.preventDefault();
                setGameState((prev) => startGame(prev));
            } else if (e.key === 'p' || e.key === 'Escape') {
                e.preventDefault();
                setGameState((prev) => togglePause(prev));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.key);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handlePauseToggle = () => {
        setGameState((prev) => togglePause(prev));
    };

    const handleRestart = () => {
        setGameState(resetGame());
    };

    return (
        <div className={styles.container} ref={containerRef} tabIndex={0}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Score Board */}
                    <div className={styles.scoreBoard}>
                        <div className={styles.scoreItem}>
                            <motion.span
                                key={gameState.playerScore}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className={`${styles.scoreValue} ${styles.playerScore}`}
                            >
                                {gameState.playerScore}
                            </motion.span>
                            <span className={styles.scoreLabel}>You</span>
                        </div>
                        <span className={styles.scoreDivider}>:</span>
                        <div className={styles.scoreItem}>
                            <motion.span
                                key={gameState.aiScore}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className={`${styles.scoreValue} ${styles.aiScore}`}
                            >
                                {gameState.aiScore}
                            </motion.span>
                            <span className={styles.scoreLabel}>AI</span>
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
                                        <div className={styles.overlayTitle}>🏓 Ping Pong</div>
                                        <div className={styles.overlaySubtitle}>
                                            First to {DEFAULT_CONFIG.winScore} wins!
                                        </div>
                                    </>
                                )}
                                {gameState.status === 'paused' && (
                                    <div className={styles.overlayTitle}>⏸️ Paused</div>
                                )}
                                {gameState.status === 'gameOver' && (
                                    <>
                                        <div
                                            className={`${styles.overlayTitle} ${gameState.winner === 'player'
                                                    ? styles.winText
                                                    : styles.loseText
                                                }`}
                                        >
                                            {gameState.winner === 'player'
                                                ? '🎉 You Win!'
                                                : '😢 You Lose'}
                                        </div>
                                        <div className={styles.overlaySubtitle}>
                                            {gameState.playerScore} - {gameState.aiScore}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
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
                        {gameState.status === 'gameOver' && (
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                        {gameState.status !== 'idle' && gameState.status !== 'gameOver' && (
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

                    <div className={styles.instructions}>
                        Move paddle with mouse or ↑↓ arrow keys
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
