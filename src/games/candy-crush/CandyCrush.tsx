'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, resetGame, selectCandy } from './game-logic';
import { GameState, DEFAULT_CONFIG, CANDY_EMOJIS } from './types';
import styles from './styles.module.css';

interface CandyCrushProps {
    onScoreUpdate?: (score: number) => void;
}

export function CandyCrush({ onScoreUpdate }: CandyCrushProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Update high score callback
    React.useEffect(() => {
        if (gameState.status === 'gameOver') {
            onScoreUpdate?.(gameState.highScore);
        }
    }, [gameState.status, gameState.highScore, onScoreUpdate]);

    const handleCellClick = (row: number, col: number) => {
        if (gameState.status !== 'playing') return;
        setGameState((prev) => selectCandy(prev, { row, col }));
    };

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const renderBoard = () => {
        const cells = [];

        for (let row = 0; row < DEFAULT_CONFIG.rows; row++) {
            for (let col = 0; col < DEFAULT_CONFIG.cols; col++) {
                const candy = gameState.board[row][col];
                const isSelected =
                    gameState.selected?.row === row && gameState.selected?.col === col;

                cells.push(
                    <motion.div
                        key={`${row}-${col}`}
                        className={`${styles.cell} ${isSelected ? styles.cellSelected : ''}`}
                        onClick={() => handleCellClick(row, col)}
                        whileTap={{ scale: 0.9 }}
                    >
                        {candy && (
                            <motion.span
                                key={candy.id}
                                className={styles.candy}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {CANDY_EMOJIS[candy.type]}
                            </motion.span>
                        )}
                    </motion.div>
                );
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
                            <span className={styles.statValue}>{gameState.movesLeft}</span>
                            <span className={styles.statLabel}>Moves</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={styles.boardContainer}>
                        <div
                            className={styles.board}
                            style={{
                                gridTemplateColumns: `repeat(${DEFAULT_CONFIG.cols}, 1fr)`,
                            }}
                        >
                            {renderBoard()}
                        </div>

                        {/* Overlay */}
                        {gameState.status !== 'playing' && (
                            <div className={styles.overlay}>
                                {gameState.status === 'idle' && (
                                    <>
                                        <div className={styles.overlayTitle}>🍬 Candy Crush</div>
                                        <div className={styles.overlaySubtitle}>
                                            Match 3+ candies to score!
                                        </div>
                                    </>
                                )}
                                {gameState.status === 'gameOver' && (
                                    <>
                                        <div className={`${styles.overlayTitle} ${styles.gameOverText}`}>
                                            No Moves Left!
                                        </div>
                                        <div className={styles.overlaySubtitle}>
                                            Final Score: {gameState.score}
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
                        {gameState.status === 'gameOver' && (
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                        {gameState.status === 'playing' && (
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
