'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, selectInsect, spawnInsect, catchInsect, tick, resetGame, startSelecting } from './game-logic';
import { GameState, INSECTS, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface InsectCatchProps {
    onScoreUpdate?: (score: number) => void;
}

export function InsectCatch({ onScoreUpdate }: InsectCatchProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const gameAreaRef = React.useRef<HTMLDivElement>(null);

    // Timer
    React.useEffect(() => {
        if (gameState.status !== 'playing') return;
        const timer = setInterval(() => {
            setGameState((prev) => {
                const newState = tick(prev);
                if (newState.status === 'finished') {
                    onScoreUpdate?.(newState.highScore);
                }
                return newState;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.status, onScoreUpdate]);

    // Spawn insects
    React.useEffect(() => {
        if (gameState.status !== 'playing' || !gameAreaRef.current) return;
        const { offsetWidth: w, offsetHeight: h } = gameAreaRef.current;
        const spawner = setInterval(() => {
            setGameState((prev) => spawnInsect(prev, w, h));
        }, DEFAULT_CONFIG.spawnInterval);
        return () => clearInterval(spawner);
    }, [gameState.status]);

    const handleSelectInsect = (emoji: string) => {
        setGameState((prev) => selectInsect(prev, emoji));
    };

    const handleCatch = (id: number) => {
        setGameState((prev) => catchInsect(prev, id));
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const handleStart = () => {
        setGameState((prev) => startSelecting(prev));
    };

    if (gameState.status === 'idle') {
        return (
            <div className={styles.container}>
                <Card className={styles.gameCard}>
                    <CardContent className={styles.cardContent}>
                        <div className={styles.selectionScreen}>
                            <div className={styles.selectionTitle}>🐛 Insect Catch</div>
                            <Button onClick={handleStart} className={styles.controlButton}>
                                Start Game
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (gameState.status === 'selecting') {
        return (
            <div className={styles.container}>
                <Card className={styles.gameCard}>
                    <CardContent className={styles.cardContent}>
                        <div className={styles.selectionScreen}>
                            <div className={styles.selectionTitle}>Choose your target!</div>
                            <div className={styles.insectGrid}>
                                {INSECTS.map((insect) => (
                                    <button
                                        key={insect.emoji}
                                        className={styles.insectOption}
                                        onClick={() => handleSelectInsect(insect.emoji)}
                                    >
                                        <span className={styles.insectEmoji}>{insect.emoji}</span>
                                        <span className={styles.insectName}>{insect.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <motion.span key={gameState.score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={styles.statValue}>
                                {gameState.score}
                            </motion.span>
                            <span className={styles.statLabel}>Score</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.timeLeft}s</span>
                            <span className={styles.statLabel}>Time</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.selectedInsect}</span>
                            <span className={styles.statLabel}>Target</span>
                        </div>
                    </div>

                    <div ref={gameAreaRef} className={styles.gameArea}>
                        {gameState.insects.map((insect) => (
                            <motion.div
                                key={insect.id}
                                className={styles.insect}
                                style={{ left: insect.x, top: insect.y }}
                                onClick={() => handleCatch(insect.id)}
                                whileTap={{ scale: 0, opacity: 0 }}
                            >
                                {insect.type}
                            </motion.div>
                        ))}

                        {gameState.status === 'finished' && (
                            <div className={styles.overlay}>
                                <div className={styles.resultsTitle}>🎯 Final Score: {gameState.score}</div>
                                <Button onClick={handleRestart} className={styles.controlButton}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Play Again
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
