'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, typeCharacter, resetGame } from './game-logic';
import { GameState } from './types';
import styles from './styles.module.css';

interface SpeedTypingProps {
    onScoreUpdate?: (score: number) => void;
}

export function SpeedTyping({ onScoreUpdate }: SpeedTypingProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (gameState.status === 'finished') {
            onScoreUpdate?.(gameState.wpm);
        }
    }, [gameState.status, gameState.wpm, onScoreUpdate]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGameState((prev) => typeCharacter(prev, e.target.value));
    };

    const handleRestart = () => {
        setGameState(resetGame());
    };

    const renderText = () => {
        return gameState.text.split('').map((char, i) => {
            let className = styles.charPending;
            if (i < gameState.typedText.length) {
                className = gameState.typedText[i] === char ? styles.charCorrect : styles.charIncorrect;
            } else if (i === gameState.typedText.length) {
                className = styles.charCurrent;
            }
            return (
                <span key={i} className={className}>
                    {char}
                </span>
            );
        });
    };

    if (gameState.status === 'idle') {
        return (
            <div className={styles.container}>
                <Card className={styles.gameCard}>
                    <CardContent className={styles.cardContent}>
                        <div className={styles.startScreen}>
                            <Keyboard className="h-12 w-12 opacity-50" />
                            <div className={styles.startTitle}>Speed Typing Test</div>
                            <div className={styles.startSubtitle}>
                                Type the text as fast and accurately as you can!
                            </div>
                            <Button onClick={handleStart} className={styles.controlButton}>
                                <Play className="h-4 w-4 mr-2" />
                                Start Typing
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (gameState.status === 'finished') {
        const emoji = gameState.wpm >= 60 ? '🚀' : gameState.wpm >= 40 ? '🔥' : gameState.wpm >= 25 ? '👍' : '💪';
        return (
            <div className={styles.container}>
                <Card className={styles.gameCard}>
                    <CardContent className={styles.cardContent}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.results}
                        >
                            <span className={styles.resultsEmoji}>{emoji}</span>
                            <div className={styles.resultsTitle}>Great Job!</div>
                            <div className={styles.statsBar}>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{gameState.wpm}</span>
                                    <span className={styles.statLabel}>WPM</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{gameState.accuracy}%</span>
                                    <span className={styles.statLabel}>Accuracy</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>{gameState.errors}</span>
                                    <span className={styles.statLabel}>Errors</span>
                                </div>
                            </div>
                            <Button onClick={handleRestart} className={styles.controlButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Stats */}
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <motion.span
                                key={gameState.wpm}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                className={styles.statValue}
                            >
                                {gameState.wpm}
                            </motion.span>
                            <span className={styles.statLabel}>WPM</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.accuracy}%</span>
                            <span className={styles.statLabel}>Accuracy</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.errors}</span>
                            <span className={styles.statLabel}>Errors</span>
                        </div>
                    </div>

                    {/* Text Display */}
                    <div className={styles.textDisplay}>
                        {renderText()}
                        
                        {/* Hidden Input Overlay */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={gameState.typedText}
                            onChange={handleChange}
                            className={styles.hiddenInput}
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>

                    {/* Reset Button */}
                    <Button onClick={handleRestart} variant="outline" className={styles.controlButton}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>

                    <p className={styles.instructions}>Click the text area and start typing!</p>
                </CardContent>
            </Card>
        </div>
    );
}
