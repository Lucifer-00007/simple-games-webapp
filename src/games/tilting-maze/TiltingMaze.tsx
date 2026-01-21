'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ChevronRight, ChevronUp, ChevronDown, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createInitialState,
    updateBall,
    startGame,
    resetGame,
    nextLevel,
    getLevel,
    DEFAULT_CONFIG
} from './game-logic';
import { GameState, Level } from './types';
import styles from './styles.module.css';

interface TiltingMazeProps {
    onScoreUpdate?: (score: number) => void;
}

export function TiltingMaze({ onScoreUpdate }: TiltingMazeProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);
    const keysPressed = React.useRef<Set<string>>(new Set());
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Draw game
    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { canvasWidth, canvasHeight, ballRadius } = DEFAULT_CONFIG;
        const level: Level = getLevel(gameState.level);

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw walls
        ctx.fillStyle = '#64748b';
        for (const wall of level.walls) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

            // Wall highlight
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(wall.x, wall.y, wall.width, 3);
            ctx.fillStyle = '#64748b';
        }

        // Draw holes
        for (const hole of level.holes) {
            ctx.fillStyle = '#0f0f0f';
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fill();

            // Hole edge
            ctx.strokeStyle = '#1f1f1f';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Draw goal
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(level.goal.x, level.goal.y, level.goal.radius, 0, Math.PI * 2);
        ctx.fill();

        // Goal glow effect
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(level.goal.x, level.goal.y, level.goal.radius - 5, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Goal flag
        ctx.fillStyle = 'white';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏁', level.goal.x, level.goal.y);

        // Draw ball
        const ballGradient = ctx.createRadialGradient(
            gameState.ball.x - 3, gameState.ball.y - 3, 0,
            gameState.ball.x, gameState.ball.y, ballRadius
        );
        ballGradient.addColorStop(0, '#60a5fa');
        ballGradient.addColorStop(1, '#2563eb');
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        // Ball shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(gameState.ball.x - 3, gameState.ball.y - 3, ballRadius / 3, 0, Math.PI * 2);
        ctx.fill();

    }, [gameState]);

    // Game loop
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const loop = () => {
                let tiltX = 0, tiltY = 0;
                if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) tiltX = -1;
                if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) tiltX = 1;
                if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has('W')) tiltY = -1;
                if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s') || keysPressed.current.has('S')) tiltY = 1;

                setGameState((prev) => {
                    const newState = updateBall(prev, tiltX, tiltY);
                    if (newState.status === 'won' && prev.status === 'playing') {
                        onScoreUpdate?.(newState.level + 1);
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

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
                keysPressed.current.add(e.key);
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
    }, []);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const handleNextLevel = () => {
        setGameState((prev) => nextLevel(prev));
    };

    const handleTilt = (dx: number, dy: number) => {
        if (gameState.status === 'playing') {
            setGameState((prev) => updateBall(prev, dx, dy));
        }
    };

    const formatTime = (frames: number) => {
        const seconds = Math.floor(frames / 60);
        return `${seconds}s`;
    };

    return (
        <div className={styles.container} ref={containerRef} tabIndex={0}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.gameLayout}>
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
                                            <div className={styles.overlayTitle}>🎯 Tilting Maze</div>
                                            <div className={styles.overlaySubtitle}>
                                                Level {gameState.level + 1}
                                            </div>
                                            <Button onClick={handleStart} className={styles.startButton}>
                                                <Play className="h-4 w-4 mr-2" />
                                                Start
                                            </Button>
                                        </>
                                    )}
                                    {gameState.status === 'won' && (
                                        <>
                                            <div className={`${styles.overlayTitle} ${styles.wonText}`}>
                                                🎉 Level Complete!
                                            </div>
                                            <div className={styles.overlaySubtitle}>
                                                Time: {formatTime(gameState.time)}
                                            </div>
                                            <div className={styles.buttonGroup}>
                                                <Button onClick={handleNextLevel}>
                                                    Next Level
                                                    <ChevronRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    {gameState.status === 'gameOver' && (
                                        <>
                                            <div className={`${styles.overlayTitle} ${styles.gameOverText}`}>
                                                💀 Fell in Hole!
                                            </div>
                                            <Button onClick={handleRestart} className={styles.restartButton}>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Try Again
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Panel */}
                        <div className={styles.controlsPanel}>
                            {/* Stats */}
                            <div className={styles.statsBar}>
                                <div className={styles.statItem}>
                                    <motion.span
                                        key={gameState.level}
                                        initial={{ scale: 1.3 }}
                                        animate={{ scale: 1 }}
                                        className={styles.statValue}
                                    >
                                        {gameState.level + 1}
                                    </motion.span>
                                    <span className={styles.statLabel}>Level</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{formatTime(gameState.time)}</span>
                                    <span className={styles.statLabel}>Time</span>
                                </div>
                            </div>

                            {/* D-Pad Controls */}
                            <div className={styles.dpadContainer}>
                                <div className={styles.dpadRow}>
                                    <div className={styles.dpadSpacer} />
                                    <Button
                                        onMouseDown={() => keysPressed.current.add('ArrowUp')}
                                        onMouseUp={() => keysPressed.current.delete('ArrowUp')}
                                        onMouseLeave={() => keysPressed.current.delete('ArrowUp')}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronUp className="h-5 w-5" />
                                    </Button>
                                    <div className={styles.dpadSpacer} />
                                </div>
                                <div className={styles.dpadRow}>
                                    <Button
                                        onMouseDown={() => keysPressed.current.add('ArrowLeft')}
                                        onMouseUp={() => keysPressed.current.delete('ArrowLeft')}
                                        onMouseLeave={() => keysPressed.current.delete('ArrowLeft')}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        onMouseDown={() => keysPressed.current.add('ArrowDown')}
                                        onMouseUp={() => keysPressed.current.delete('ArrowDown')}
                                        onMouseLeave={() => keysPressed.current.delete('ArrowDown')}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronDown className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        onMouseDown={() => keysPressed.current.add('ArrowRight')}
                                        onMouseUp={() => keysPressed.current.delete('ArrowRight')}
                                        onMouseLeave={() => keysPressed.current.delete('ArrowRight')}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className={styles.legend}>
                                <div className={styles.legendItem}>
                                    <span className={styles.legendBall}></span>
                                    <span>Ball</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={styles.legendGoal}></span>
                                    <span>Goal</span>
                                </div>
                                <div className={styles.legendItem}>
                                    <span className={styles.legendHole}></span>
                                    <span>Hole</span>
                                </div>
                            </div>

                            <div className={styles.instructions}>
                                Tilt to roll the ball<br />to the goal. Avoid holes!
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
