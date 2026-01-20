'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Hand, Scissors, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, playRound, updateState } from './game-logic';
import { GameState, Choice } from './types';
import styles from './styles.module.css';

interface RockPaperScissorsProps {
    onScoreUpdate?: (score: number) => void;
}

const choiceIcons: Record<Choice, React.ReactNode> = {
    rock: <span className={styles.choiceIcon}>✊</span>,
    paper: <span className={styles.choiceIcon}>✋</span>,
    scissors: <span className={styles.choiceIcon}>✌️</span>,
};

const choiceLabels: Record<Choice, string> = {
    rock: 'Rock',
    paper: 'Paper',
    scissors: 'Scissors',
};

export function RockPaperScissors({ onScoreUpdate }: RockPaperScissorsProps) {
    const [gameState, setGameState] = React.useState<GameState>(createInitialState);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [showResult, setShowResult] = React.useState(false);

    const handleChoice = async (choice: Choice) => {
        if (isAnimating) return;

        setIsAnimating(true);
        setShowResult(false);

        // Simulate suspense with animation
        await new Promise((resolve) => setTimeout(resolve, 500));

        const roundResult = playRound(choice);
        const newState = updateState(gameState, roundResult);
        setGameState(newState);
        setShowResult(true);
        setIsAnimating(false);

        onScoreUpdate?.(newState.playerScore);
    };

    const handleReset = () => {
        setGameState(createInitialState());
        setShowResult(false);
    };

    return (
        <div className={styles.container}>
            {/* Scoreboard */}
            <div className={styles.scoreboard}>
                <Card className={styles.scoreCard}>
                    <CardContent className={styles.scoreCardContent}>
                        <span className={styles.scoreLabel}>You</span>
                        <span className={styles.scoreValue}>{gameState.playerScore}</span>
                    </CardContent>
                </Card>
                <div className={styles.vs}>VS</div>
                <Card className={styles.scoreCard}>
                    <CardContent className={styles.scoreCardContent}>
                        <span className={styles.scoreLabel}>Computer</span>
                        <span className={styles.scoreValue}>{gameState.computerScore}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Battle Arena */}
            <div className={styles.arena}>
                <div className={styles.playerSide}>
                    <AnimatePresence mode="wait">
                        {gameState.lastRound && showResult ? (
                            <motion.div
                                key="player-choice"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className={styles.choiceDisplay}
                            >
                                {choiceIcons[gameState.lastRound.playerChoice]}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="player-waiting"
                                animate={isAnimating ? { rotate: [0, 15, -15, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 0.3 }}
                                className={styles.choiceDisplay}
                            >
                                <span className={styles.questionMark}>?</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <span className={styles.sideLabel}>You</span>
                </div>

                <div className={styles.computerSide}>
                    <AnimatePresence mode="wait">
                        {gameState.lastRound && showResult ? (
                            <motion.div
                                key="computer-choice"
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: -180 }}
                                className={styles.choiceDisplay}
                            >
                                {choiceIcons[gameState.lastRound.computerChoice]}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="computer-waiting"
                                animate={isAnimating ? { rotate: [0, -15, 15, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 0.3 }}
                                className={styles.choiceDisplay}
                            >
                                <span className={styles.questionMark}>?</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <span className={styles.sideLabel}>Computer</span>
                </div>
            </div>

            {/* Result Message */}
            <AnimatePresence>
                {gameState.lastRound && showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`${styles.result} ${gameState.lastRound.result === 'win'
                                ? styles.resultWin
                                : gameState.lastRound.result === 'lose'
                                    ? styles.resultLose
                                    : styles.resultTie
                            }`}
                    >
                        {gameState.lastRound.result === 'win' && '🎉 '}
                        {gameState.lastRound.message}
                        {gameState.lastRound.result === 'lose' && ' 😢'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Choice Buttons */}
            <div className={styles.choices}>
                {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
                    <motion.button
                        key={choice}
                        onClick={() => handleChoice(choice)}
                        disabled={isAnimating}
                        className={styles.choiceButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {choiceIcons[choice]}
                        <span className={styles.choiceLabel}>{choiceLabels[choice]}</span>
                    </motion.button>
                ))}
            </div>

            {/* Reset Button */}
            <Button onClick={handleReset} variant="outline" className={styles.resetButton}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Score
            </Button>
        </div>
    );
}
