'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, makeMove, resetGame, continueGame } from './game-logic';
import { GameState, Direction, TILE_COLORS } from './types';
import styles from './styles.module.css';

interface Game2048Props {
    onScoreUpdate?: (score: number) => void;
}

export function Game2048({ onScoreUpdate }: Game2048Props) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const containerRef = React.useRef<HTMLDivElement>(null);
    const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

    const handleMove = React.useCallback((direction: Direction) => {
        setGameState((prev) => {
            const newState = makeMove(prev, direction);
            if (newState.score !== prev.score) {
                onScoreUpdate?.(newState.bestScore);
            }
            return newState;
        });
    }, [onScoreUpdate]);

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const keyDirectionMap: Record<string, Direction> = {
                ArrowUp: 'UP',
                ArrowDown: 'DOWN',
                ArrowLeft: 'LEFT',
                ArrowRight: 'RIGHT',
            };

            const direction = keyDirectionMap[e.key];
            if (direction) {
                e.preventDefault();
                handleMove(direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    // Touch controls
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current) return;

            const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
            const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
            const minSwipe = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipe) {
                    handleMove(deltaX > 0 ? 'RIGHT' : 'LEFT');
                }
            } else {
                if (Math.abs(deltaY) > minSwipe) {
                    handleMove(deltaY > 0 ? 'DOWN' : 'UP');
                }
            }

            touchStartRef.current = null;
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMove]);

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const handleContinue = () => {
        setGameState((prev) => continueGame(prev));
    };

    const getTileStyle = (value: number) => {
        const colors = TILE_COLORS[value] || TILE_COLORS[2048];
        return {
            backgroundColor: colors.bg,
            color: colors.text,
        };
    };

    const getTileSizeClass = (value: number) => {
        if (value < 100) return styles.cellSmall;
        if (value < 1000) return styles.cellMedium;
        if (value < 10000) return styles.cellLarge;
        return styles.cellXlarge;
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Header */}
                    <div className={styles.header}>
                        <span className={styles.title}>2048</span>
                        <div className={styles.scores}>
                            <div className={styles.scoreBox}>
                                <span className={styles.scoreLabel}>Score</span>
                                <motion.span
                                    key={gameState.score}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    className={styles.scoreValue}
                                >
                                    {gameState.score}
                                </motion.span>
                            </div>
                            <div className={styles.scoreBox}>
                                <span className={styles.scoreLabel}>Best</span>
                                <span className={styles.scoreValue}>{gameState.bestScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={styles.boardWrapper}>
                        <div className={styles.board}>
                            <AnimatePresence>
                                {gameState.board.flat().map((value, index) => (
                                    <motion.div
                                        key={index}
                                        className={`${styles.cell} ${value === 0 ? styles.cellEmpty : getTileSizeClass(value)}`}
                                        style={value > 0 ? getTileStyle(value) : undefined}
                                        initial={value > 0 ? { scale: 0.8 } : false}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        {value > 0 ? value : ''}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Win/Lose Overlay */}
                        {(gameState.status === 'won' || gameState.status === 'lost') && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={styles.overlay}
                            >
                                <div className={`${styles.overlayTitle} ${gameState.status === 'won' ? styles.wonText : styles.lostText
                                    }`}>
                                    {gameState.status === 'won' ? 'You Win!' : 'Game Over!'}
                                </div>
                                <div className={styles.controls}>
                                    {gameState.status === 'won' && (
                                        <Button onClick={handleContinue} className={styles.controlButton}>
                                            <Play className="h-4 w-4 mr-2" />
                                            Continue
                                        </Button>
                                    )}
                                    <Button onClick={handleRestart} variant="outline" className={styles.controlButton}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        New Game
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <Button onClick={handleRestart} variant="outline" className={styles.controlButton}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            New Game
                        </Button>
                    </div>

                    <p className={styles.instructions}>
                        Use arrow keys or swipe to move tiles
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
