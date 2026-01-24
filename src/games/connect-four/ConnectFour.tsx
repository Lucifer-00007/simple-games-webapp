'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Bot, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, dropPiece, resetGame, getBestMove } from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface ConnectFourProps {
    onScoreUpdate?: (score: number) => void;
}

export function ConnectFour({ onScoreUpdate }: ConnectFourProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const [isVsComputer, setIsVsComputer] = React.useState(false);
    const [isComputerThinking, setIsComputerThinking] = React.useState(false);

    const processMove = React.useCallback((col: number) => {
        if (gameState.status !== 'playing') return;

        setGameState((prev) => {
            const newState = dropPiece(prev, col);
            if (newState.status === 'won') {
                onScoreUpdate?.(newState.scores.red + newState.scores.yellow);
            }
            return newState;
        });
    }, [gameState.status, onScoreUpdate]);

    // AI Turn Effect
    React.useEffect(() => {
        if (isVsComputer && gameState.status === 'playing' && gameState.currentPlayer === 'yellow' && !isComputerThinking) {
            const timer = setTimeout(() => {
                setIsComputerThinking(true);
                const bestMove = getBestMove(gameState.board, 'yellow');
                processMove(bestMove);
                setIsComputerThinking(false);
            }, 800); // Slightly longer delay for "thinking" feel
            return () => clearTimeout(timer);
        }
    }, [gameState.status, gameState.currentPlayer, isVsComputer, isComputerThinking, gameState.board, processMove]);

    const handleColumnClick = (col: number) => {
        // Prevent interaction if it's computer's turn
        if (isVsComputer && (gameState.currentPlayer === 'yellow' || isComputerThinking)) return;
        processMove(col);
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
        setIsComputerThinking(false);
    };

    const toggleMode = () => {
        setIsVsComputer(!isVsComputer);
        handleRestart();
    };

    const getStatusMessage = () => {
        if (isComputerThinking) return "Computer is thinking...";
        if (gameState.status === 'won') {
            const winner = gameState.winner === 'red' ? '🔴 Red' : '🟡 Yellow';
            if (isVsComputer && gameState.winner === 'yellow') return "🤖 Computer Wins!";
            return `${winner} Wins!`;
        }
        if (gameState.status === 'draw') {
            return "🤝 It's a Draw!";
        }
        if (isVsComputer) {
            return gameState.currentPlayer === 'red' ? "Your Turn (Red)" : "Computer's Turn";
        }
        const player = gameState.currentPlayer === 'red' ? '🔴 Red' : '🟡 Yellow';
        return `${player}'s Turn`;
    };

    const isWinningCell = (row: number, col: number) => {
        return gameState.winningCells?.some(
            (cell) => cell.row === row && cell.col === col
        );
    };

    const renderBoard = () => {
        const cols = [];
        for (let col = 0; col < DEFAULT_CONFIG.cols; col++) {
            const cells = [];
            for (let row = 0; row < DEFAULT_CONFIG.rows; row++) {
                const cell = gameState.board[row][col];
                const isWinning = isWinningCell(row, col);

                let cellClass = styles.cell;
                if (cell === 'red') cellClass += ` ${styles.cellRed}`;
                if (cell === 'yellow') cellClass += ` ${styles.cellYellow}`;
                if (isWinning) cellClass += ` ${styles.cellWinning}`;

                cells.push(
                    <motion.div
                        key={`${row}-${col}`}
                        className={cellClass}
                        initial={cell ? { y: -50 * (row + 1) } : false}
                        animate={{ y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                );
            }

            const isClickable = gameState.status === 'playing' && !(isVsComputer && gameState.currentPlayer === 'yellow');

            cols.push(
                <div
                    key={col}
                    className={`${styles.column} ${!isClickable ? styles.disabled : ''}`}
                    onClick={() => handleColumnClick(col)}
                >
                    {cells}
                </div>
            );
        }
        return cols;
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
                        key={`${gameState.status}-${gameState.currentPlayer}-${isComputerThinking}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.status} ${gameState.status === 'won'
                                ? styles.statusWon
                                : gameState.status === 'draw'
                                    ? styles.statusDraw
                                    : gameState.currentPlayer === 'red'
                                        ? styles.statusRed
                                        : styles.statusYellow
                            }`}
                    >
                        {getStatusMessage()}
                    </motion.div>

                    {/* Score Board */}
                    <div className={styles.scoreBoard}>
                        <div className={styles.scoreItem}>
                            <div className={`${styles.scoreDisc} ${styles.redDisc}`} />
                            <motion.span
                                key={gameState.scores.red}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={styles.scoreValue}
                            >
                                {gameState.scores.red}
                            </motion.span>
                        </div>
                        <div className={styles.scoreItem}>
                            <div className={`${styles.scoreDisc} ${styles.yellowDisc}`} />
                            <motion.span
                                key={gameState.scores.yellow}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={styles.scoreValue}
                            >
                                {gameState.scores.yellow}
                            </motion.span>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={styles.boardWrapper}>
                        <div
                            className={styles.board}
                            style={{
                                gridTemplateColumns: `repeat(${DEFAULT_CONFIG.cols}, 1fr)`,
                            }}
                        >
                            {renderBoard()}
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