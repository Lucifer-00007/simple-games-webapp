'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, spawnEmoji, updateEmojis, catchEmoji, tick, resetGame } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface EmojiCatcherProps {
    onScoreUpdate?: (score: number) => void;
}

export function EmojiCatcher({ onScoreUpdate }: EmojiCatcherProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const gameAreaRef = React.useRef<HTMLDivElement>(null);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const spawnRef = React.useRef<NodeJS.Timeout | null>(null);
    const updateRef = React.useRef<NodeJS.Timeout | null>(null);

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

    // Spawn emojis
    React.useEffect(() => {
        if (gameState.status === 'playing' && gameAreaRef.current) {
            const width = gameAreaRef.current.offsetWidth;
            spawnRef.current = setInterval(() => {
                setGameState((prev) => spawnEmoji(prev, width));
            }, DEFAULT_CONFIG.spawnInterval);
        }

        return () => {
            if (spawnRef.current) clearInterval(spawnRef.current);
        };
    }, [gameState.status]);

    // Update emoji positions
    React.useEffect(() => {
        if (gameState.status === 'playing' && gameAreaRef.current) {
            const height = gameAreaRef.current.offsetHeight;
            updateRef.current = setInterval(() => {
                setGameState((prev) => updateEmojis(prev, height));
            }, 50);
        }

        return () => {
            if (updateRef.current) clearInterval(updateRef.current);
        };
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
    };

    const handleCatch = (emojiId: number) => {
        setGameState((prev) => catchEmoji(prev, emojiId));
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
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
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.timeLeft}s</span>
                            <span className={styles.statLabel}>Time</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div ref={gameAreaRef} className={styles.gameArea}>
                        {gameState.emojis.map((emoji) => (
                            <motion.div
                                key={emoji.id}
                                className={styles.emoji}
                                style={{ left: emoji.x, top: emoji.y }}
                                onClick={() => handleCatch(emoji.id)}
                                whileTap={{ scale: 0.5, opacity: 0 }}
                            >
                                {emoji.emoji}
                            </motion.div>
                        ))}

                        {/* Idle Overlay */}
                        {gameState.status === 'idle' && (
                            <div className={styles.overlay}>
                                <span className={styles.overlayEmoji}>🎯</span>
                                <div className={styles.overlayTitle}>Emoji Catcher</div>
                                <Button onClick={handleStart} className={styles.controlButton}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Game
                                </Button>
                            </div>
                        )}

                        {/* Results Overlay */}
                        {gameState.status === 'finished' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={styles.overlay}
                            >
                                <div className={styles.results}>
                                    <span className={styles.overlayEmoji}>🏆</span>
                                    <div className={styles.resultsTitle}>Time's Up!</div>
                                    <div className={styles.resultsStat}>
                                        Caught: {gameState.caught} | Missed: {gameState.missed}
                                    </div>
                                </div>
                                <Button onClick={handleRestart} className={styles.controlButton}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Play Again
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
