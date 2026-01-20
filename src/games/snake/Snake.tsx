'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createInitialState,
    moveSnake,
    changeDirection,
    startGame,
    togglePause,
    resetGame,
} from './game-logic';
import { GameState, Direction, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface SnakeProps {
    onScoreUpdate?: (score: number) => void;
}

export function Snake({ onScoreUpdate }: SnakeProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const gameLoopRef = React.useRef<NodeJS.Timeout | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Game loop
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            gameLoopRef.current = setInterval(() => {
                setGameState((prev) => {
                    const newState = moveSnake(prev);
                    if (newState.status === 'gameOver' && prev.status === 'playing') {
                        onScoreUpdate?.(newState.highScore);
                    }
                    return newState;
                });
            }, gameState.speed);
        }

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [gameState.status, gameState.speed, onScoreUpdate]);

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const keyDirectionMap: Record<string, Direction> = {
                ArrowUp: 'UP',
                ArrowDown: 'DOWN',
                ArrowLeft: 'LEFT',
                ArrowRight: 'RIGHT',
                w: 'UP',
                s: 'DOWN',
                a: 'LEFT',
                d: 'RIGHT',
            };

            const direction = keyDirectionMap[e.key];
            if (direction) {
                e.preventDefault();
                setGameState((prev) => changeDirection(prev, direction));
            }

            if (e.key === ' ') {
                e.preventDefault();
                if (gameState.status === 'idle') {
                    setGameState((prev) => startGame(prev));
                } else {
                    setGameState((prev) => togglePause(prev));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.status]);

    const handleDirectionClick = (direction: Direction) => {
        setGameState((prev) => changeDirection(prev, direction));
    };

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

    const renderBoard = () => {
        const cells = [];
        const { gridSize } = DEFAULT_CONFIG;

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const isHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;
                const isSnake = gameState.snake.some((segment) => segment.x === x && segment.y === y);
                const isFood = gameState.food.x === x && gameState.food.y === y;

                let cellClass = styles.cell;
                if (isHead) cellClass += ` ${styles.cellHead}`;
                else if (isSnake) cellClass += ` ${styles.cellSnake}`;
                if (isFood) cellClass += ` ${styles.cellFood}`;

                cells.push(<div key={`${x}-${y}`} className={cellClass} />);
            }
        }

        return cells;
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
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>High Score</span>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className={styles.boardWrapper}>
                        <div className={styles.boardContainer}>
                            <div
                                className={styles.board}
                                style={{
                                    gridTemplateColumns: `repeat(${DEFAULT_CONFIG.gridSize}, 1fr)`,
                                    gridTemplateRows: `repeat(${DEFAULT_CONFIG.gridSize}, 1fr)`,
                                }}
                            >
                                {renderBoard()}
                            </div>

                            {/* Overlay for idle/paused/gameOver */}
                            {gameState.status !== 'playing' && (
                                <div className={styles.overlay}>
                                    {gameState.status === 'idle' && (
                                        <>
                                            <div className={styles.overlayTitle}>🐍 Snake</div>
                                            <div className={styles.overlaySubtitle}>Press Space or Start to play</div>
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
                                            <div className={styles.overlaySubtitle}>Score: {gameState.score}</div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
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
                            <Button onClick={handlePauseToggle} variant="outline" className={styles.controlButton}>
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
                            <Button onClick={handleRestart} variant="outline" className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restart
                            </Button>
                        )}
                    </div>

                    {/* Mobile Direction Controls */}
                    <div className={styles.mobileControls}>
                        <div className={styles.mobileRow}>
                            <button
                                className={styles.directionButton}
                                onClick={() => handleDirectionClick('UP')}
                            >
                                <ChevronUp className="h-6 w-6" />
                            </button>
                        </div>
                        <div className={styles.mobileRow}>
                            <button
                                className={styles.directionButton}
                                onClick={() => handleDirectionClick('LEFT')}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                className={styles.directionButton}
                                onClick={() => handleDirectionClick('DOWN')}
                            >
                                <ChevronDown className="h-6 w-6" />
                            </button>
                            <button
                                className={styles.directionButton}
                                onClick={() => handleDirectionClick('RIGHT')}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
