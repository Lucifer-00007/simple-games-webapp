'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, RotateCcw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createInitialState, rollDice, updateStateWithRoll } from './game-logic';
import { GameState, DICE_FACES, DiceValue } from './types';
import styles from './styles.module.css';

interface DiceRollProps {
    onScoreUpdate?: (score: number) => void;
}

export function DiceRoll({ onScoreUpdate }: DiceRollProps) {
    const [gameState, setGameState] = React.useState<GameState>(createInitialState);
    const [displayValue, setDisplayValue] = React.useState<DiceValue | null>(null);

    const handleRoll = async () => {
        if (gameState.isRolling) return;

        setGameState((prev) => ({ ...prev, isRolling: true }));

        // Animate through random values
        const animationDuration = 800;
        const frameInterval = 100;
        const frames = animationDuration / frameInterval;

        for (let i = 0; i < frames; i++) {
            await new Promise((resolve) => setTimeout(resolve, frameInterval));
            setDisplayValue(rollDice());
        }

        // Final result
        const finalValue = rollDice();
        setDisplayValue(finalValue);
        setGameState((prev) => updateStateWithRoll(prev, finalValue));
        onScoreUpdate?.(gameState.totalRolls + 1);
    };

    const handleReset = () => {
        setGameState(createInitialState());
        setDisplayValue(null);
    };

    return (
        <div className={styles.container}>
            {/* Left Panel - Dice */}
            <div className={styles.leftPanel}>
                {/* Main Dice Display */}
                <Card className={styles.diceCard}>
                    <CardContent className={styles.diceContent}>
                        <motion.div
                            className={styles.dice}
                            animate={
                                gameState.isRolling
                                    ? {
                                        rotate: [0, 360, 720],
                                        scale: [1, 1.1, 1],
                                    }
                                    : {}
                            }
                            transition={{
                                duration: 0.8,
                                ease: 'easeInOut',
                            }}
                        >
                            {displayValue ? (
                                <span className={styles.diceFace}>{DICE_FACES[displayValue]}</span>
                            ) : (
                                <span className={styles.diceEmpty}>🎲</span>
                            )}
                        </motion.div>

                        {displayValue && !gameState.isRolling && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.result}
                            >
                                You rolled a <span className={styles.resultValue}>{displayValue}</span>!
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {/* Roll Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        size="lg"
                        onClick={handleRoll}
                        disabled={gameState.isRolling}
                        className={styles.rollButton}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        <Dices className="h-5 w-5 mr-2" style={{ color: 'white' }} />
                        {gameState.isRolling ? 'Rolling...' : 'Roll Dice'}
                    </Button>
                </motion.div>
            </div>

            {/* Right Panel - Stats, History, Reset */}
            <div className={styles.rightPanel}>
                {/* Stats */}
                <Card className={styles.statCard}>
                    <CardContent className={styles.statContent}>
                        <span className={styles.statLabel}>Total Rolls</span>
                        <span className={styles.statValue}>{gameState.totalRolls}</span>
                    </CardContent>
                </Card>

                {/* Roll History */}
                {gameState.history.length > 0 && (
                    <Card className={styles.historyCard}>
                        <CardHeader className={styles.historyHeader}>
                            <CardTitle className={styles.historyTitle}>
                                <History className="h-4 w-4 mr-2" />
                                Roll History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className={styles.historyContent}>
                            <ScrollArea className={styles.historyScroll}>
                                <AnimatePresence>
                                    {gameState.history.map((roll, index) => (
                                        <motion.div
                                            key={roll.rollNumber}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={styles.historyItem}
                                        >
                                            <span className={styles.historyRoll}>Roll #{roll.rollNumber}</span>
                                            <span className={styles.historyValue}>
                                                {DICE_FACES[roll.value]} ({roll.value})
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}

                {/* Reset Button */}
                <Button onClick={handleReset} variant="outline" className={styles.resetButton}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            </div>
        </div>
    );
}
