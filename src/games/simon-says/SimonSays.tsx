'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createInitialState,
    startGame,
    addToSequence,
    playerMove,
    setActiveColor,
    startPlayerTurn,
    resetGame,
} from './game-logic';
import { GameState, Color, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface SimonSaysProps {
    onScoreUpdate?: (score: number) => void;
}

export function SimonSays({ onScoreUpdate }: SimonSaysProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Show sequence effect
    React.useEffect(() => {
        if (gameState.status === 'showingSequence') {
            const showSequence = async () => {
                // Wait before starting
                await new Promise((r) => setTimeout(r, 500));

                for (let i = 0; i < gameState.sequence.length; i++) {
                    // Show color
                    setGameState((prev) => setActiveColor(prev, gameState.sequence[i]));
                    await new Promise((r) => setTimeout(r, DEFAULT_CONFIG.showDelay));

                    // Hide color
                    setGameState((prev) => setActiveColor(prev, null));
                    await new Promise((r) => setTimeout(r, DEFAULT_CONFIG.pauseDelay));
                }

                // Start player turn
                setGameState((prev) => startPlayerTurn(prev));
            };

            showSequence();
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [gameState.status, gameState.sequence.length]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
    };

    const handleColorClick = (color: Color) => {
        if (gameState.status !== 'playerTurn') return;

        // Flash the color briefly
        setGameState((prev) => setActiveColor(prev, color));
        setTimeout(() => {
            setGameState((prev) => {
                const newState = playerMove(setActiveColor(prev, null), color);

                // If player completed sequence successfully, add next round
                if (
                    newState.status === 'showingSequence' &&
                    newState.playerSequence.length === newState.sequence.length
                ) {
                    onScoreUpdate?.(newState.score);
                    return addToSequence(newState);
                }

                if (newState.status === 'gameOver') {
                    onScoreUpdate?.(newState.highScore);
                }

                return newState;
            });
        }, 200);
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const getStatusMessage = () => {
        switch (gameState.status) {
            case 'idle':
                return 'Press Start to begin!';
            case 'showingSequence':
                return 'Watch the sequence...';
            case 'playerTurn':
                return 'Your turn!';
            case 'gameOver':
                return `Game Over! Score: ${gameState.score}`;
        }
    };

    const renderColorButton = (color: Color) => {
        const isActive = gameState.activeColor === color;
        const isDisabled = gameState.status !== 'playerTurn';

        const colorClassName = {
            red: styles.colorRed,
            green: styles.colorGreen,
            blue: styles.colorBlue,
            yellow: styles.colorYellow,
        }[color];

        return (
            <button
                key={color}
                className={`${styles.colorButton} ${colorClassName} ${isActive ? styles.active : ''}`}
                onClick={() => handleColorClick(color)}
                disabled={isDisabled}
            />
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
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    {/* Game Board */}
                    <div className={styles.board}>
                        {DEFAULT_CONFIG.colors.map((color) => renderColorButton(color))}
                    </div>

                    {/* Status */}
                    <div
                        className={`${styles.status} ${gameState.status === 'gameOver' ? styles.statusGameOver : ''
                            }`}
                    >
                        {getStatusMessage()}
                    </div>

                    {/* Controls */}
                    {gameState.status === 'idle' && (
                        <Button onClick={handleStart} className={styles.controlButton}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Game
                        </Button>
                    )}
                    {gameState.status === 'gameOver' && (
                        <Button onClick={handleRestart} className={styles.controlButton}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Play Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
