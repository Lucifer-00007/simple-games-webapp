'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, whackMole, tick, showNewMole, resetGame } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface WhackAMoleProps {
    onScoreUpdate?: (score: number) => void;
}

export function WhackAMole({ onScoreUpdate }: WhackAMoleProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const [whackedMole, setWhackedMole] = React.useState<number | null>(null);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const moleRef = React.useRef<NodeJS.Timeout | null>(null);

    // Game timer
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            timerRef.current = setInterval(() => {
                setGameState((prev) => {
                    const newState = tick(prev);
                    if (newState.status === 'finished') {
                        onScoreUpdate?.(newState.highScore);
                    }
                    return newState;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState.status, onScoreUpdate]);

    // Mole spawner
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            moleRef.current = setInterval(() => {
                setGameState((prev) => showNewMole(prev));
            }, DEFAULT_CONFIG.moleInterval);
        }

        return () => {
            if (moleRef.current) clearInterval(moleRef.current);
        };
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
    };

    const handleWhack = (position: number) => {
        if (gameState.status !== 'playing') return;

        if (position === gameState.activeMole) {
            setWhackedMole(position);
            setTimeout(() => setWhackedMole(null), 200);
        }

        setGameState((prev) => whackMole(prev, position));
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const renderHole = (index: number) => {
        const isActive = gameState.activeMole === index;
        const isWhacked = whackedMole === index;

        return (
            <div key={index} className={styles.hole} onClick={() => handleWhack(index)}>
                <span
                    className={`${styles.mole} ${isActive && !isWhacked
                            ? styles.moleVisible
                            : isWhacked
                                ? styles.moleWhacked
                                : styles.moleHidden
                        }`}
                >
                    🐹
                </span>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Stats */}
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
                        <div className={`${styles.statItem} ${styles.timer}`}>
                            <span className={styles.statValue}>{gameState.timeLeft}s</span>
                            <span className={styles.statLabel}>Time</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={styles.board}>
                        {Array(DEFAULT_CONFIG.gridSize)
                            .fill(null)
                            .map((_, index) => renderHole(index))}
                    </div>

                    {/* Results */}
                    {gameState.status === 'finished' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.results}
                        >
                            <div className={styles.resultsTitle}>🎯 Time&apos;s Up!</div>
                            <div className={styles.resultsStat}>
                                Hits: {gameState.hits} | Misses: {gameState.misses}
                            </div>
                        </motion.div>
                    )}

                    {/* Controls */}
                    <div className={styles.controls}>
                        {gameState.status === 'idle' && (
                            <Button onClick={handleStart} className={styles.controlButton}>
                                <Play className="h-4 w-4 mr-2" />
                                Start Game
                            </Button>
                        )}
                        {gameState.status === 'finished' && (
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
