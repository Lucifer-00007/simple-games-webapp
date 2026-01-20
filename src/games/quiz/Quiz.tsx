'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, selectAnswer, nextQuestion, getProgress, resetGame } from './game-logic';
import { GameState } from './types';
import styles from './styles.module.css';

interface QuizProps {
    onScoreUpdate?: (score: number) => void;
}

export function Quiz({ onScoreUpdate }: QuizProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());

    const handleSelectAnswer = (answerIndex: number) => {
        setGameState((prev) => selectAnswer(prev, answerIndex));
    };

    const handleNextQuestion = () => {
        setGameState((prev) => {
            const newState = nextQuestion(prev);
            if (newState.status === 'finished') {
                onScoreUpdate?.(newState.score);
            }
            return newState;
        });
    };

    const handleRestart = () => {
        setGameState(resetGame());
    };

    if (gameState.status === 'finished') {
        const percentage = Math.round((gameState.score / gameState.questions.length) * 100);
        const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '😊' : percentage >= 40 ? '🤔' : '😅';

        return (
            <div className={styles.container}>
                <Card className={styles.gameCard}>
                    <CardContent className={styles.cardContent}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.results}
                        >
                            <span className={styles.emoji}>{emoji}</span>
                            <h2 className={styles.resultsTitle}>Quiz Complete!</h2>
                            <p className={styles.finalScore}>
                                You got <span className={styles.scoreHighlight}>{gameState.score}</span> out of{' '}
                                <span className={styles.scoreHighlight}>{gameState.questions.length}</span> correct
                            </p>
                            <span className={styles.percentage}>{percentage}%</span>
                            <Button onClick={handleRestart} className={styles.nextButton}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = gameState.questions[gameState.currentIndex];
    const progress = getProgress(gameState);

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Header */}
                    <div className={styles.header}>
                        <span className={styles.progress}>
                            Question {gameState.currentIndex + 1} of {gameState.questions.length}
                        </span>
                        <span className={styles.score}>Score: {gameState.score}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={gameState.currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {currentQuestion.category && (
                                <span className={styles.category}>{currentQuestion.category}</span>
                            )}
                            <h2 className={styles.question}>{currentQuestion.question}</h2>
                        </motion.div>
                    </AnimatePresence>

                    {/* Options */}
                    <div className={styles.options}>
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = gameState.selectedAnswer === index;
                            const isCorrect = index === currentQuestion.correctIndex;
                            const showCorrect = gameState.showResult && isCorrect;
                            const showWrong = gameState.showResult && isSelected && !isCorrect;

                            return (
                                <motion.button
                                    key={index}
                                    className={`${styles.option} ${showCorrect ? styles.optionCorrect : ''} ${showWrong ? styles.optionWrong : ''
                                        }`}
                                    onClick={() => handleSelectAnswer(index)}
                                    disabled={gameState.showResult}
                                    whileHover={!gameState.showResult ? { scale: 1.01 } : {}}
                                    whileTap={!gameState.showResult ? { scale: 0.99 } : {}}
                                >
                                    <span className={styles.optionLetter}>
                                        {showCorrect ? (
                                            <Check className="h-4 w-4" />
                                        ) : showWrong ? (
                                            <X className="h-4 w-4" />
                                        ) : (
                                            String.fromCharCode(65 + index)
                                        )}
                                    </span>
                                    <span>{option}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    {gameState.showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.controls}
                        >
                            <Button onClick={handleNextQuestion} className={styles.nextButton}>
                                {gameState.currentIndex === gameState.questions.length - 1 ? (
                                    <>See Results</>
                                ) : (
                                    <>
                                        Next Question
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
