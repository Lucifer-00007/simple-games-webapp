'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, makeMove } from './game-logic';
import { GameState } from './types';
import styles from './styles.module.css';

interface TicTacToeProps {
    onScoreUpdate?: (score: number) => void;
}

export function TicTacToe({ onScoreUpdate }: TicTacToeProps) {
    const [gameState, setGameState] = React.useState<GameState>(createInitialState);
    const [scores, setScores] = React.useState({ X: 0, O: 0, draws: 0 });

    const handleCellClick = (index: number) => {
        if (gameState.status !== 'playing' || gameState.board[index] !== null) {
            return;
        }

        const newState = makeMove(gameState, index);
        setGameState(newState);

        // Update scores when game ends
        if (newState.status === 'won') {
            setScores((prev) => ({
                ...prev,
                [newState.winner!]: prev[newState.winner!] + 1,
            }));
            onScoreUpdate?.(scores.X + scores.O + scores.draws + 1);
        } else if (newState.status === 'draw') {
            setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
            onScoreUpdate?.(scores.X + scores.O + scores.draws + 1);
        }
    };

    const handleRestart = () => {
        setGameState(createInitialState());
    };

    const getStatusMessage = () => {
        switch (gameState.status) {
            case 'won':
                return `🎉 Player ${gameState.winner} Wins!`;
            case 'draw':
                return "🤝 It's a Draw!";
            default:
                return `Player ${gameState.currentPlayer}'s Turn`;
        }
    };

    const renderCell = (index: number) => {
        const cell = gameState.board[index];
        const isWinningCell = gameState.winningLine?.includes(index);
        const isEmpty = cell === null;

        return (
            <motion.button
                key={index}
                className={`
          ${styles.cell}
          ${isWinningCell ? styles.winning : ''}
          ${isEmpty && gameState.status === 'playing' ? styles.empty : ''}
        `}
                onClick={() => handleCellClick(index)}
                whileHover={isEmpty && gameState.status === 'playing' ? { scale: 0.95 } : {}}
                whileTap={isEmpty && gameState.status === 'playing' ? { scale: 0.9 } : {}}
                disabled={!isEmpty || gameState.status !== 'playing'}
            >
                <AnimatePresence mode="wait">
                    {cell && (
                        <motion.span
                            key={cell}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={cell === 'X' ? styles.x : styles.o}
                        >
                            {cell}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        );
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Status */}
                    <motion.div
                        key={gameState.status + gameState.currentPlayer}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.status} ${gameState.status === 'won' ? styles.statusWon :
                            gameState.status === 'draw' ? styles.statusDraw : ''
                            }`}
                    >
                        {getStatusMessage()}
                    </motion.div>

                    {/* Game Board */}
                    <div className={styles.boardWrapper}>
                        <div className={styles.board}>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderCell(index))}
                        </div>
                    </div>

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
