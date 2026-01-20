'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, guessLetter, getDisplayWord, getWrongLetters, resetGame } from './game-logic';
import { GameState } from './types';
import styles from './styles.module.css';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface HangmanProps {
    onScoreUpdate?: (score: number) => void;
}

export function Hangman({ onScoreUpdate }: HangmanProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const [wins, setWins] = React.useState(0);

    // Keyboard listener
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const letter = e.key.toUpperCase();
            if (ALPHABET.includes(letter)) {
                handleGuess(letter);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.guessedLetters, gameState.status]);

    const handleGuess = (letter: string) => {
        if (gameState.status !== 'playing') return;
        if (gameState.guessedLetters.has(letter)) return;

        setGameState((prev) => {
            const newState = guessLetter(prev, letter);
            if (newState.status === 'won' && prev.status === 'playing') {
                setWins((w) => w + 1);
                onScoreUpdate?.(wins + 1);
            }
            return newState;
        });
    };

    const handleRestart = () => {
        setGameState(resetGame());
    };

    const displayWord = getDisplayWord(gameState.word, gameState.guessedLetters);
    const wrongLetters = getWrongLetters(gameState.word, gameState.guessedLetters);

    const renderHangman = () => {
        const parts = [
            <circle key="head" cx="50" cy="30" r="12" className={styles.hangmanPart} />,
            <line key="body" x1="50" y1="42" x2="50" y2="75" className={styles.hangmanPart} />,
            <line key="leftArm" x1="50" y1="50" x2="35" y2="65" className={styles.hangmanPart} />,
            <line key="rightArm" x1="50" y1="50" x2="65" y2="65" className={styles.hangmanPart} />,
            <line key="leftLeg" x1="50" y1="75" x2="35" y2="95" className={styles.hangmanPart} />,
            <line key="rightLeg" x1="50" y1="75" x2="65" y2="95" className={styles.hangmanPart} />,
        ];

        return (
            <svg className={styles.hangmanSvg} viewBox="0 0 100 110">
                {/* Gallows */}
                <line x1="10" y1="105" x2="90" y2="105" className={styles.gallows} />
                <line x1="30" y1="105" x2="30" y2="5" className={styles.gallows} />
                <line x1="30" y1="5" x2="50" y2="5" className={styles.gallows} />
                <line x1="50" y1="5" x2="50" y2="18" className={styles.gallows} />
                {/* Body parts */}
                {parts.slice(0, gameState.wrongGuesses)}
            </svg>
        );
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Hangman Drawing */}
                    {renderHangman()}

                    {/* Hint */}
                    <div className={styles.hint}>💡 {gameState.hint}</div>

                    {/* Word Display */}
                    <div className={styles.wordDisplay}>
                        <AnimatePresence mode="popLayout">
                            {displayWord.map((letter, index) => (
                                <motion.div
                                    key={index}
                                    className={`${styles.letterSlot} ${letter !== '_' ? styles.letterRevealed : ''}`}
                                    initial={letter !== '_' ? { scale: 0.5, opacity: 0 } : false}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    {letter}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Status Message */}
                    {gameState.status !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.status} ${gameState.status === 'won' ? styles.statusWon : styles.statusLost
                                }`}
                        >
                            {gameState.status === 'won'
                                ? '🎉 You Won!'
                                : `😢 The word was: ${gameState.word}`}
                        </motion.div>
                    )}

                    {/* Wrong Letters */}
                    {wrongLetters.length > 0 && (
                        <div className={styles.wrongLetters}>
                            {wrongLetters.map((letter) => (
                                <motion.span
                                    key={letter}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={styles.wrongLetter}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </div>
                    )}

                    {/* Keyboard */}
                    <div className={styles.keyboard}>
                        {ALPHABET.map((letter) => {
                            const isGuessed = gameState.guessedLetters.has(letter);
                            const isCorrect = isGuessed && gameState.word.includes(letter);
                            const isWrong = isGuessed && !gameState.word.includes(letter);

                            return (
                                <motion.button
                                    key={letter}
                                    className={`${styles.keyButton} ${isCorrect ? styles.keyCorrect : ''
                                        } ${isWrong ? styles.keyWrong : ''}`}
                                    onClick={() => handleGuess(letter)}
                                    disabled={isGuessed || gameState.status !== 'playing'}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {letter}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Restart Button */}
                    <Button
                        onClick={handleRestart}
                        variant="outline"
                        className={styles.restartButton}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {gameState.status !== 'playing' ? 'Play Again' : 'New Word'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
