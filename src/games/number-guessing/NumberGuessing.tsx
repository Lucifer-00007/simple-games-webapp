'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, makeGuess, getRemainingAttempts, getHintMessage } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface NumberGuessingProps {
    onScoreUpdate?: (score: number) => void;
}

export function NumberGuessing({ onScoreUpdate }: NumberGuessingProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const [inputValue, setInputValue] = React.useState('');
    const [gamesWon, setGamesWon] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleGuess = () => {
        const guess = parseInt(inputValue, 10);
        if (isNaN(guess)) return;

        const newState = makeGuess(gameState, guess);
        setGameState(newState);
        setInputValue('');

        if (newState.status === 'won') {
            setGamesWon((prev) => prev + 1);
            onScoreUpdate?.(gamesWon + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    };

    const handleRestart = () => {
        setGameState(createInitialState());
        setInputValue('');
        inputRef.current?.focus();
    };

    const remaining = getRemainingAttempts(gameState);
    const hintMessage = getHintMessage(gameState);

    const getHintClass = () => {
        if (gameState.status === 'won') return styles.hintWon;
        if (gameState.status === 'lost') return styles.hintLost;
        if (gameState.hint === 'higher') return styles.hintHigher;
        if (gameState.hint === 'lower') return styles.hintLower;
        return '';
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Range Display */}
                    <div className={styles.rangeDisplay}>
                        Guess a number between {DEFAULT_CONFIG.minNumber} and {DEFAULT_CONFIG.maxNumber} !!
                    </div>

                    {/* Hint Display */}
                    <div className={styles.hintContainer}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={hintMessage}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`${styles.hint} ${getHintClass()}`}
                            >
                                {hintMessage}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className={styles.inputArea}>
                        <input
                            ref={inputRef}
                            type="number"
                            min={DEFAULT_CONFIG.minNumber}
                            max={DEFAULT_CONFIG.maxNumber}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter"
                            className={styles.numberInput}
                            disabled={gameState.status !== 'playing'}
                        />
                        <motion.button
                            className={styles.guessButton}
                            onClick={handleGuess}
                            disabled={gameState.status !== 'playing' || !inputValue}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Guess
                        </motion.button>
                    </div>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <motion.span
                                key={gameState.attempts}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={styles.statValue}
                            >
                                {gameState.attempts}
                            </motion.span>
                            <span className={styles.statLabel}>Attempts</span>
                        </div>
                        <div className={styles.statItem}>
                            <motion.span
                                key={remaining}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={styles.statValue}
                            >
                                {remaining}
                            </motion.span>
                            <span className={styles.statLabel}>Remaining</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gamesWon}</span>
                            <span className={styles.statLabel}>Wins</span>
                        </div>
                    </div>

                    {/* Guess History */}
                    {gameState.guessHistory.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={styles.historySection}
                        >
                            <div className={styles.historyTitle}>Your Guesses</div>
                            <div className={styles.historyList}>
                                {gameState.guessHistory.map((guess, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`${styles.historyItem} ${guess > gameState.secretNumber
                                            ? styles.historyItemHigh
                                            : guess < gameState.secretNumber
                                                ? styles.historyItemLow
                                                : ''
                                            }`}
                                    >
                                        {guess}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Restart Button */}
                    <Button
                        onClick={handleRestart}
                        variant="outline"
                        className={styles.restartButton}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {gameState.status !== 'playing' ? 'Play Again' : 'Restart'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
