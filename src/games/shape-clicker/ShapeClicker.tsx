'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, spawnShape, clickShape, removeShape, tick, resetGame } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface ShapeClickerProps {
    onScoreUpdate?: (score: number) => void;
}

export function ShapeClicker({ onScoreUpdate }: ShapeClickerProps) {
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

    // Spawn shapes
    React.useEffect(() => {
        if (gameState.status !== 'playing' || !gameAreaRef.current) return;
        const { offsetWidth: w, offsetHeight: h } = gameAreaRef.current;
        const spawner = setInterval(() => {
            setGameState((prev) => spawnShape(prev, w, h));
        }, DEFAULT_CONFIG.spawnInterval);
        return () => clearInterval(spawner);
    }, [gameState.status]);

    // Auto-remove shapes after lifetime
    React.useEffect(() => {
        if (gameState.status !== 'playing') return;

        const timeouts = gameState.shapes.map((shape) => {
            return setTimeout(() => {
                setGameState((prev) => removeShape(prev, shape.id));
            }, DEFAULT_CONFIG.shapeLifetime);
        });

        return () => timeouts.forEach(clearTimeout);
    }, [gameState.shapes.length, gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
    };

    const handleClick = (id: number) => {
        setGameState((prev) => clickShape(prev, id));
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const getShapeClass = (type: string) => {
        switch (type) {
            case 'circle': return styles.circle;
            case 'square': return styles.square;
            case 'triangle': return styles.triangle;
            case 'star': return styles.star;
            default: return styles.circle;
        }
    };

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
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    <div ref={gameAreaRef} className={styles.gameArea}>
                        {gameState.shapes.map((shape) => (
                            <motion.div
                                key={shape.id}
                                className={`${styles.shape} ${getShapeClass(shape.type)}`}
                                style={{
                                    left: shape.x,
                                    top: shape.y,
                                    width: shape.size,
                                    height: shape.size,
                                    backgroundColor: shape.color,
                                }}
                                onClick={() => handleClick(shape.id)}
                                whileTap={{ scale: 0, opacity: 0 }}
                            />
                        ))}

                        {gameState.status === 'idle' && (
                            <div className={styles.overlay}>
                                <div className={styles.overlayTitle}>🎯 Shape Clicker</div>
                                <div className={styles.overlaySubtitle}>Click shapes fast! Stars = 2x points</div>
                                <Button onClick={handleStart} className={styles.controlButton}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Game
                                </Button>
                            </div>
                        )}

                        {gameState.status === 'finished' && (
                            <div className={styles.overlay}>
                                <div className={styles.overlayTitle}>🏆 Final Score: {gameState.score}</div>
                                <div className={styles.overlaySubtitle}>
                                    Clicked: {gameState.shapesClicked} | Missed: {gameState.shapesMissed}
                                </div>
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
