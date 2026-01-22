'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Bot, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, makeMove, getBestMove } from './game-logic';
import { GameState } from './types';
import styles from './styles.module.css';

interface TicTacToeProps {
    onScoreUpdate?: (score: number) => void;
}

export function TicTacToe({ onScoreUpdate }: TicTacToeProps) {
    const [gameState, setGameState] = React.useState<GameState>(createInitialState);
    const [scores, setScores] = React.useState({ X: 0, O: 0, draws: 0 });
    const [isVsComputer, setIsVsComputer] = React.useState(false);
    const [isComputerThinking, setIsComputerThinking] = React.useState(false);

    const processMove = (index: number) => {
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

    // AI Turn Effect
    React.useEffect(() => {
        if (isVsComputer && gameState.status === 'playing' && gameState.currentPlayer === 'O' && !isComputerThinking) {
            const timer = setTimeout(() => {
                setIsComputerThinking(true);
                const bestMove = getBestMove(gameState.board, 'O');
                processMove(bestMove);
                setIsComputerThinking(false);
            }, 600); // Natural delay
            return () => clearTimeout(timer);
        }
    }, [gameState.status, gameState.currentPlayer, isVsComputer, isComputerThinking, gameState.board]);

    const handleCellClick = (index: number) => {
        // Prevent interaction if it's computer's turn
        if (isVsComputer && (gameState.currentPlayer === 'O' || isComputerThinking)) return;
        processMove(index);
    };

    const handleRestart = () => {
        setGameState(createInitialState());
        setIsComputerThinking(false);
    };

    const toggleMode = () => {
        setIsVsComputer(!isVsComputer);
        handleRestart(); // Restart game when switching modes
    };

    const getStatusMessage = () => {
        if (isComputerThinking) return "Computer is thinking...";
        switch (gameState.status) {
            case 'won':
                return `🎉 ${isVsComputer && gameState.winner === 'O' ? 'Computer' : `Player ${gameState.winner}`} Wins!`;
            case 'draw':
                return "🤝 It's a Draw!";
            default:
                if (isVsComputer) {
                    return gameState.currentPlayer === 'X' ? "Your Turn" : "Computer's Turn";
                }
                return `Player ${gameState.currentPlayer}'s Turn`;
        }
    };

    const renderCell = (index: number) => {
        const cell = gameState.board[index];
        const isWinningCell = gameState.winningLine?.includes(index);
        const isEmpty = cell === null;
        const isClickable = isEmpty && gameState.status === 'playing' && !(isVsComputer && gameState.currentPlayer === 'O');

        return (
            <motion.button
                key={index}
                className={`
          ${styles.cell}
          ${isWinningCell ? styles.winning : ''}
          ${isEmpty && gameState.status === 'playing' ? styles.empty : ''}
        `}
                onClick={() => handleCellClick(index)}
                whileHover={isClickable ? { scale: 0.95 } : {}}
                whileTap={isClickable ? { scale: 0.9 } : {}}
                disabled={!isClickable}
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
                    {/* Mode Toggle */}
                    <div className="flex justify-center mb-4">
                        <Button
                            variant={isVsComputer ? "secondary" : "outline"}
                            onClick={toggleMode}
                            className="gap-2 text-xs h-8"
                        >
                            {isVsComputer ? <Bot className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                            {isVsComputer ? "Vs Computer" : "Vs Player"}
                        </Button>
                    </div>

                    {/* Status */}
                    <motion.div
                        key={gameState.status + gameState.currentPlayer + isComputerThinking}
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