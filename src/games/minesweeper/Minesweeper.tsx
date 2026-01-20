'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Flag, Bomb, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, revealCell, toggleFlag, resetGame } from './game-logic';
import { GameState, GameConfig, DIFFICULTY_LEVELS } from './types';
import styles from './styles.module.css';

interface MinesweeperProps {
    onScoreUpdate?: (score: number) => void;
}

export function Minesweeper({ onScoreUpdate }: MinesweeperProps) {
    const [difficulty, setDifficulty] = React.useState<string>('easy');
    const [config, setConfig] = React.useState<GameConfig>(DIFFICULTY_LEVELS.easy);
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState(config));
    const [time, setTime] = React.useState(0);

    // Timer
    React.useEffect(() => {
        if (gameState.status !== 'playing' || !gameState.startTime) return;
        const timer = setInterval(() => {
            setTime(Math.floor((Date.now() - gameState.startTime!) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState.status, gameState.startTime]);

    React.useEffect(() => {
        if (gameState.status === 'won') {
            onScoreUpdate?.(time);
        }
    }, [gameState.status, time, onScoreUpdate]);

    const handleCellClick = (row: number, col: number) => {
        setGameState((prev) => revealCell(prev, row, col, config));
    };

    const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        setGameState((prev) => toggleFlag(prev, row, col));
    };

    const handleReset = () => {
        setGameState(resetGame(config));
        setTime(0);
    };

    const handleDifficultyChange = (level: string) => {
        const newConfig = DIFFICULTY_LEVELS[level];
        setDifficulty(level);
        setConfig(newConfig);
        setGameState(createInitialState(newConfig));
        setTime(0);
    };

    const getStatusEmoji = () => {
        if (gameState.status === 'won') return '😎';
        if (gameState.status === 'lost') return '💀';
        return '🙂';
    };

    const getCellClass = (cell: typeof gameState.board[0][0]) => {
        let classes = styles.cell;
        if (cell.state === 'hidden') classes += ` ${styles.cellHidden}`;
        else if (cell.state === 'revealed') {
            classes += ` ${styles.cellRevealed}`;
            if (cell.isMine) classes += ` ${styles.cellMine}`;
            else if (cell.adjacentMines > 0) {
                classes += ` ${styles[`num${cell.adjacentMines}`]}`;
            }
        } else if (cell.state === 'flagged') classes += ` ${styles.cellFlagged}`;
        return classes;
    };

    const getCellContent = (cell: typeof gameState.board[0][0]) => {
        if (cell.state === 'flagged') return '🚩';
        if (cell.state === 'hidden') return '';
        if (cell.isMine) return '💣';
        if (cell.adjacentMines > 0) return cell.adjacentMines;
        return '';
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Difficulty Select */}
                    <div className={styles.difficultySelect}>
                        {Object.keys(DIFFICULTY_LEVELS).map((level) => (
                            <button
                                key={level}
                                className={`${styles.difficultyButton} ${difficulty === level ? styles.active : ''}`}
                                onClick={() => handleDifficultyChange(level)}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.statBox}>
                            <Flag className="h-4 w-4" />
                            <span className={styles.statValue}>{gameState.minesRemaining}</span>
                        </div>
                        <button className={styles.statusButton} onClick={handleReset}>
                            {getStatusEmoji()}
                        </button>
                        <div className={styles.statBox}>
                            <Timer className="h-4 w-4" />
                            <span className={styles.statValue}>{time}</span>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={styles.boardWrapper}>
                        <div
                            className={styles.board}
                            style={{
                                gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
                            }}
                        >
                            {gameState.board.map((row, r) =>
                                row.map((cell, c) => (
                                    <motion.button
                                        key={`${r}-${c}`}
                                        className={getCellClass(cell)}
                                        onClick={() => handleCellClick(r, c)}
                                        onContextMenu={(e) => handleCellRightClick(e, r, c)}
                                        whileTap={cell.state === 'hidden' ? { scale: 0.9 } : {}}
                                        disabled={gameState.status !== 'playing' && cell.state === 'hidden'}
                                    >
                                        {getCellContent(cell)}
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Status Message */}
                    {gameState.status !== 'playing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${styles.overlayTitle} ${gameState.status === 'won' ? styles.won : styles.lost}`}
                        >
                            {gameState.status === 'won' ? '🎉 You Won!' : '💥 Game Over!'}
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
