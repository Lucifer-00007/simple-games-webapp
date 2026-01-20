'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, flipCard, checkMatch } from './game-logic';
import { GameState, CARD_EMOJIS } from './types';
import styles from './styles.module.css';

interface MemoryCardProps {
    onScoreUpdate?: (score: number) => void;
}

export function MemoryCard({ onScoreUpdate }: MemoryCardProps) {
    const [gameState, setGameState] = React.useState<GameState>(createInitialState);

    const handleCardClick = (cardId: number) => {
        if (gameState.isLocked || gameState.status === 'won') return;

        const newState = flipCard(gameState, cardId);
        setGameState(newState);

        // Check for match after second card flip
        if (newState.flippedCards.length === 2) {
            setTimeout(() => {
                setGameState((prev) => {
                    const checkedState = checkMatch(prev);
                    onScoreUpdate?.(checkedState.matchedPairs);
                    return checkedState;
                });
            }, 1000);
        }
    };

    const handleRestart = () => {
        setGameState(createInitialState());
        onScoreUpdate?.(0);
    };

    return (
        <div className={styles.container}>
            {/* Stats */}
            <div className={styles.stats}>
                <Card className={styles.statCard}>
                    <CardContent className={styles.statContent}>
                        <span className={styles.statLabel}>Moves</span>
                        <span className={styles.statValue}>{gameState.moves}</span>
                    </CardContent>
                </Card>
                <Card className={styles.statCard}>
                    <CardContent className={styles.statContent}>
                        <span className={styles.statLabel}>Pairs Found</span>
                        <span className={styles.statValue}>
                            {gameState.matchedPairs}/{CARD_EMOJIS.length}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Win Message */}
            <AnimatePresence>
                {gameState.status === 'won' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={styles.winMessage}
                    >
                        <Trophy className={styles.winIcon} />
                        <h3 className={styles.winTitle}>Congratulations!</h3>
                        <p className={styles.winText}>
                            You found all pairs in {gameState.moves} moves!
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Grid */}
            <div className={styles.grid}>
                {gameState.cards.map((card) => (
                    <motion.div
                        key={card.id}
                        className={`${styles.cardContainer} ${card.isMatched ? styles.matched : ''
                            }`}
                        whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                        whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                    >
                        <div
                            className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.flipped : ''}`}
                            onClick={() => handleCardClick(card.id)}
                        >
                            {/* Front - Question mark */}
                            <div className={styles.cardFront}>
                                <span className={styles.cardQuestion}>?</span>
                            </div>
                            {/* Back - Emoji */}
                            <div className={styles.cardBack}>
                                <span className={styles.cardEmoji}>{card.emoji}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Restart Button */}
            <Button onClick={handleRestart} variant="outline" className={styles.restartButton}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {gameState.status === 'won' ? 'Play Again' : 'Restart'}
            </Button>
        </div>
    );
}
