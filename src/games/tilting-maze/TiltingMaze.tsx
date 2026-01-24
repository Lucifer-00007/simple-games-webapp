'use client';

import * as React from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    createInitialState,
    updateBall,
    startGame,
    resetGame,
    DEFAULT_CONFIG,
    MAZE_WALLS,
    GOAL_POSITION,
    CORNER_DOTS,
    COLORS_LIGHT,
    COLORS_DARK,
} from './types';
import { GameState } from './types';
import styles from './styles.module.css';

// Clamp value between -limit and +limit
const minmax = (value: number, limit: number) => Math.max(Math.min(value, limit), -limit);

export function TiltingMaze({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const animationFrameRef = React.useRef<number>(0);
    const [isDark, setIsDark] = React.useState(false);

    // Track theme changes
    React.useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        // Initial check
        checkTheme();

        // Observer for class changes on html element
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkTheme();
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true, // Configure it to listen to attribute changes
        });

        return () => observer.disconnect();
    }, []);

    const currentColors = isDark ? COLORS_DARK : COLORS_LIGHT;

    // Joystick state
    const [isDragging, setIsDragging] = React.useState(false);
    const [joystickPos, setJoystickPos] = React.useState({ x: 0, y: 0 });
    const [mazeRotation, setMazeRotation] = React.useState({ x: 0, y: 0 });
    const mouseStartRef = React.useRef({ x: 0, y: 0 });
    const accelerationRef = React.useRef({ x: 0, y: 0 });

    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // 1. Clear and fill background
        ctx.fillStyle = currentColors.background;
        ctx.fillRect(0, 0, DEFAULT_CONFIG.canvasWidth, DEFAULT_CONFIG.canvasHeight);

        // 2. Draw maze walls
        ctx.fillStyle = currentColors.wall;
        for (const wall of MAZE_WALLS) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }

        // 3. Draw corner decorations (small red dots at all 4 corners)
        ctx.fillStyle = currentColors.cornerDot;
        for (const dot of CORNER_DOTS) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. Draw goal indicator (dotted circle) in CENTER
        ctx.strokeStyle = currentColors.goalDash;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(GOAL_POSITION.x, GOAL_POSITION.y, GOAL_POSITION.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 5. Draw ball shadow
        ctx.fillStyle = currentColors.ballShadow;
        ctx.beginPath();
        ctx.ellipse(
            gameState.ball.x + 2,
            gameState.ball.y + 3,
            DEFAULT_CONFIG.ballRadius,
            DEFAULT_CONFIG.ballRadius * 0.6,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // 6. Draw ball with gradient
        const gradient = ctx.createRadialGradient(
            gameState.ball.x - 2,
            gameState.ball.y - 2,
            0,
            gameState.ball.x,
            gameState.ball.y,
            DEFAULT_CONFIG.ballRadius
        );
        
        if (isDark) {
            gradient.addColorStop(0, '#ffbb8a');
            gradient.addColorStop(0.7, currentColors.ball);
            gradient.addColorStop(1, '#cc703d');
        } else {
            gradient.addColorStop(0, '#ff9a6c');
            gradient.addColorStop(0.7, currentColors.ball);
            gradient.addColorStop(1, '#e05a2a');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, DEFAULT_CONFIG.ballRadius, 0, Math.PI * 2);
        ctx.fill();

        // Add a subtle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(
            gameState.ball.x - 2,
            gameState.ball.y - 2,
            DEFAULT_CONFIG.ballRadius * 0.3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }, [gameState, currentColors, isDark]);

    // Game loop - uses acceleration from joystick
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const loop = () => {
                const tiltX = accelerationRef.current.x;
                const tiltY = accelerationRef.current.y;

                setGameState((prev) => {
                    const newState = updateBall(prev, tiltX, tiltY);
                    if (newState.status === 'won' && onScoreUpdate) {
                        onScoreUpdate(Math.floor(10000 / (newState.time / 1000)));
                    }
                    return newState;
                });

                animationFrameRef.current = requestAnimationFrame(loop);
            };
            animationFrameRef.current = requestAnimationFrame(loop);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
    }, [gameState.status, onScoreUpdate]);

    // Handle joystick mousedown
    const handleJoystickMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        if (gameState.status === 'idle') {
            // Start the game
            setGameState(startGame(gameState));
        }
        setIsDragging(true);
        mouseStartRef.current = { x: e.clientX, y: e.clientY };
    };

    // Handle mouse move (global)
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            // Calculate joystick position (clamped to ±15px)
            const deltaX = minmax(e.clientX - mouseStartRef.current.x, 15);
            const deltaY = minmax(e.clientY - mouseStartRef.current.y, 15);

            setJoystickPos({ x: deltaX, y: deltaY });

            // Calculate maze rotation (each pixel = 0.8 degrees)
            const rotationY = deltaX * 0.8;
            const rotationX = -deltaY * 0.8;
            setMazeRotation({ x: rotationX, y: rotationY });

            // Calculate acceleration based on rotation angle
            const gravity = 2;
            accelerationRef.current = {
                x: gravity * Math.sin((rotationY / 180) * Math.PI),
                y: gravity * Math.sin((-rotationX / 180) * Math.PI),
            };
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                // Don't reset joystick position - keep the tilt
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Draw on state change
    React.useEffect(() => {
        draw();
    }, [draw]);

    const handleRestart = () => {
        setGameState(resetGame());
        setJoystickPos({ x: 0, y: 0 });
        setMazeRotation({ x: 0, y: 0 });
        accelerationRef.current = { x: 0, y: 0 };
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const decimals = Math.floor((ms % 1000) / 100);
        return `${seconds}.${decimals}s`;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.gameWrapper}>
                {/* Maze Canvas with 3D rotation */}
                <div className={styles.mazeSection}>
                    <canvas
                        ref={canvasRef}
                        width={DEFAULT_CONFIG.canvasWidth}
                        height={DEFAULT_CONFIG.canvasHeight}
                        className={styles.canvas}
                        style={{
                            transform: `perspective(600px) rotateX(${mazeRotation.x}deg) rotateY(${mazeRotation.y}deg)`,
                        }}
                    />

                    {/* Win overlay */}
                    {gameState.status === 'won' && (
                        <div className={styles.overlay}>
                            <div className={styles.overlayContent}>
                                <Trophy className={styles.trophyIcon} />
                                <div className={styles.winTitle}>You Won!</div>
                                <div className={styles.winTime}>
                                    Time: {formatTime(gameState.time)}
                                </div>
                                <Button onClick={handleRestart} className={styles.restartBtn}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Play Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Joystick and Instructions */}
                <div className={styles.controlSection}>
                    {/* Joystick */}
                    <div className={styles.joystickContainer}>
                        {/* Arrow indicators */}
                        <div className={`${styles.joystickArrow} ${styles.arrowUp}`} />
                        <div className={`${styles.joystickArrow} ${styles.arrowDown}`} />
                        <div className={`${styles.joystickArrow} ${styles.arrowLeft}`} />
                        <div className={`${styles.joystickArrow} ${styles.arrowRight}`} />

                        {/* Joystick base */}
                        <div className={styles.joystickBase}>
                            {/* Joystick head (draggable) */}
                            <div
                                className={`${styles.joystickHead} ${isDragging ? styles.grabbing : ''} ${gameState.status === 'idle' ? styles.pulsing : ''}`}
                                onMouseDown={handleJoystickMouseDown}
                                style={{
                                    transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className={styles.instructions}>
                        {gameState.status === 'idle' && (
                            <p className={styles.instructionText}>Click the joystick to start!</p>
                        )}
                        {gameState.status === 'playing' && (
                            <p className={styles.instructionText}>Drag to tilt the maze!</p>
                        )}
                        <p className={styles.instructionSubtext}>
                            Move the ball to the center.
                        </p>
                    </div>

                    {/* Restart button when playing */}
                    {gameState.status === 'playing' && (
                        <Button variant="outline" onClick={handleRestart} className={styles.restartBtnSmall}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restart
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
