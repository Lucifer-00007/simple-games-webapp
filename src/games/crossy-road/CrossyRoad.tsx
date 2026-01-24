'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createInitialState,
    movePlayer,
    startGame,
    resetGame,
    setTrafficDensity,
    tick,
    DEFAULT_CONFIG,
    LANE_COLORS
} from './game-logic';
import { GameState, LaneType, TrafficDensity } from './types';
import styles from './styles.module.css';

interface CrossyRoadProps {
    onScoreUpdate?: (score: number) => void;
}

export function CrossyRoad({ onScoreUpdate }: CrossyRoadProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameLoopRef = React.useRef<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Draw game
    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { canvasWidth, canvasHeight, gridSize, playerSize } = DEFAULT_CONFIG;

        // Clear canvas
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate visible lanes
        const startLane = Math.max(0, Math.floor(gameState.cameraY) - 2);
        const endLane = Math.min(gameState.lanes.length, startLane + DEFAULT_CONFIG.visibleLanes + 4);

        // Draw lanes
        for (let i = startLane; i < endLane; i++) {
            const lane = gameState.lanes[i];
            if (!lane) continue;

            const screenY = canvasHeight - ((i - gameState.cameraY + 1) * gridSize);

            // Draw lane background
            ctx.fillStyle = LANE_COLORS[lane.type as LaneType];
            ctx.fillRect(0, screenY, canvasWidth, gridSize);

            // Draw lane markings for roads
            if (lane.type === 'road') {
                ctx.strokeStyle = '#fbbf24';
                ctx.setLineDash([20, 20]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, screenY + gridSize / 2);
                ctx.lineTo(canvasWidth, screenY + gridSize / 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw water waves
            if (lane.type === 'water') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                for (let w = 0; w < canvasWidth; w += 30) {
                    ctx.beginPath();
                    ctx.arc(w + (Date.now() / 50 % 30), screenY + gridSize / 2, 5, 0, Math.PI);
                    ctx.fill();
                }
            }

            // Draw objects (cars, trucks, logs)
            for (const obj of lane.objects) {
                const objY = screenY + (gridSize - 30) / 2;

                if (obj.type === 'log') {
                    // Draw log
                    ctx.fillStyle = '#8B4513';
                    ctx.beginPath();
                    ctx.roundRect(obj.x, objY, obj.width, 30, 8);
                    ctx.fill();

                    // Wood grain
                    ctx.strokeStyle = '#654321';
                    ctx.lineWidth = 1;
                    for (let g = obj.x + 15; g < obj.x + obj.width - 10; g += 20) {
                        ctx.beginPath();
                        ctx.arc(g, objY + 15, 5, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                } else {
                    // Draw vehicle
                    ctx.fillStyle = obj.color;
                    const vehicleWidth = obj.type === 'truck' ? obj.width : obj.width;
                    const vehicleHeight = 30;

                    ctx.beginPath();
                    ctx.roundRect(obj.x, objY, vehicleWidth, vehicleHeight, 6);
                    ctx.fill();

                    // Windows
                    ctx.fillStyle = '#87CEEB';
                    const windowOffset = obj.direction === 'right' ? 8 : vehicleWidth - 20;
                    ctx.fillRect(obj.x + windowOffset, objY + 4, 12, 10);

                    // Wheels
                    ctx.fillStyle = '#1f2937';
                    ctx.beginPath();
                    ctx.arc(obj.x + 10, objY + vehicleHeight, 5, 0, Math.PI * 2);
                    ctx.arc(obj.x + vehicleWidth - 10, objY + vehicleHeight, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Draw player (chicken)
        const playerScreenY = canvasHeight - ((gameState.player.y - gameState.cameraY + 1) * gridSize);
        const playerScreenX = gameState.player.x * gridSize + (gridSize - playerSize) / 2;

        // Player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(playerScreenX + playerSize / 2, playerScreenY + playerSize - 5, playerSize / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Player body (chicken)
        const gradient = ctx.createRadialGradient(
            playerScreenX + playerSize / 2,
            playerScreenY + playerSize / 2,
            0,
            playerScreenX + playerSize / 2,
            playerScreenY + playerSize / 2,
            playerSize / 2
        );
        gradient.addColorStop(0, '#fef3c7');
        gradient.addColorStop(1, '#fbbf24');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(playerScreenX + playerSize / 2, playerScreenY + playerSize / 2, playerSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(playerScreenX + playerSize / 2 - 6, playerScreenY + playerSize / 2 - 5, 6, 0, Math.PI * 2);
        ctx.arc(playerScreenX + playerSize / 2 + 6, playerScreenY + playerSize / 2 - 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(playerScreenX + playerSize / 2 - 5, playerScreenY + playerSize / 2 - 5, 3, 0, Math.PI * 2);
        ctx.arc(playerScreenX + playerSize / 2 + 7, playerScreenY + playerSize / 2 - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(playerScreenX + playerSize / 2, playerScreenY + playerSize / 2);
        ctx.lineTo(playerScreenX + playerSize / 2 - 5, playerScreenY + playerSize / 2 + 8);
        ctx.lineTo(playerScreenX + playerSize / 2 + 5, playerScreenY + playerSize / 2 + 8);
        ctx.closePath();
        ctx.fill();

        // Comb (red thing on top)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(playerScreenX + playerSize / 2 - 5, playerScreenY + playerSize / 2 - playerSize / 2 + 5, 4, 0, Math.PI * 2);
        ctx.arc(playerScreenX + playerSize / 2, playerScreenY + playerSize / 2 - playerSize / 2 + 3, 5, 0, Math.PI * 2);
        ctx.arc(playerScreenX + playerSize / 2 + 5, playerScreenY + playerSize / 2 - playerSize / 2 + 5, 4, 0, Math.PI * 2);
        ctx.fill();

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

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState.status !== 'playing') return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    setGameState((prev) => movePlayer(prev, 0, 1));
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    setGameState((prev) => movePlayer(prev, 0, -1));
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    setGameState((prev) => movePlayer(prev, -1, 0));
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    setGameState((prev) => movePlayer(prev, 1, 0));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handleRestart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handleMove = (dx: number, dy: number) => {
        if (gameState.status === 'playing') {
            setGameState((prev) => movePlayer(prev, dx, dy));
        }
    };

    const handleDensityChange = (density: TrafficDensity) => {
        setGameState((prev) => setTrafficDensity(prev, density));
        containerRef.current?.focus();
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
                                            <div className={styles.overlayTitle}>🐔 Crossy Road</div>
                                            <div className={styles.overlaySubtitle}>
                                                Help the chicken cross!
                                            </div>
                                            <Button onClick={handleStart} className={styles.startButton}>
                                                <Play className="h-4 w-4 mr-2" />
                                                Start Game
                                            </Button>
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
                                            <Button onClick={handleRestart} className={styles.restartButton}>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Play Again
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Controls */}
                        <div className={styles.controlsPanel}>
                            {/* Stats */}
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

                            {/* D-Pad Controls */}
                            <div className={styles.dpadContainer}>
                                <div className={styles.dpadRow}>
                                    <div className={styles.dpadSpacer} />
                                    <Button
                                        onClick={() => handleMove(0, 1)}
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
                                        onClick={() => handleMove(-1, 0)}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        onClick={() => handleMove(0, -1)}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronDown className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        onClick={() => handleMove(1, 0)}
                                        size="sm"
                                        className={styles.dpadButton}
                                        disabled={gameState.status !== 'playing'}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Traffic Density Controls */}
                            <div className={styles.densityControls}>
                                <span className={styles.controlLabel}>Traffic</span>
                                <div className={styles.densityButtons}>
                                    {(['low', 'medium', 'high'] as const).map((density) => (
                                        <Button
                                            key={density}
                                            variant={gameState.trafficDensity === density ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleDensityChange(density)}
                                            className={styles.densityButton}
                                            disabled={gameState.status === 'playing'}
                                        >
                                            {density.charAt(0).toUpperCase() + density.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.instructions}>
                                Use Arrow Keys<br />or WASD to move
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
