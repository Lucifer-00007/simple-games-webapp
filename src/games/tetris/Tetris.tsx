'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    createInitialState,
    startGame,
    togglePause,
    resetGame,
    movePiece,
    rotate,
    hardDrop,
    tick,
    getSpeed,
} from './game-logic';
import { GameState, DEFAULT_CONFIG } from './types';
import styles from './styles.module.css';

interface TetrisProps {
    onScoreUpdate?: (score: number) => void;
}

export function Tetris({ onScoreUpdate }: TetrisProps) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const gameLoopRef = React.useRef<NodeJS.Timeout | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Game loop
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const speed = getSpeed(gameState.level);
            gameLoopRef.current = setInterval(() => {
                setGameState((prev) => {
                    const newState = tick(prev);
                    if (newState.status === 'gameOver' && prev.status === 'playing') {
                        onScoreUpdate?.(newState.highScore);
                    }
                    return newState;
                });
            }, speed);
        }

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [gameState.status, gameState.level, onScoreUpdate]);

    // Keyboard controls
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState.status !== 'playing') {
                if (e.key === ' ' && gameState.status === 'idle') {
                    e.preventDefault();
                    setGameState((prev) => startGame(prev));
                }
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    e.preventDefault();
                    setGameState((prev) => movePiece(prev, -1, 0));
                    break;
                case 'ArrowRight':
                case 'd':
                    e.preventDefault();
                    setGameState((prev) => movePiece(prev, 1, 0));
                    break;
                case 'ArrowDown':
                case 's':
                    e.preventDefault();
                    setGameState((prev) => movePiece(prev, 0, 1));
                    break;
                case 'ArrowUp':
                case 'w':
                    e.preventDefault();
                    setGameState((prev) => rotate(prev));
                    break;
                case ' ':
                    e.preventDefault();
                    setGameState((prev) => hardDrop(prev));
                    break;
                case 'p':
                case 'Escape':
                    e.preventDefault();
                    setGameState((prev) => togglePause(prev));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.status]);

    const handleStart = () => {
        setGameState((prev) => startGame(prev));
        containerRef.current?.focus();
    };

    const handlePauseToggle = () => {
        setGameState((prev) => togglePause(prev));
    };

    const handleRestart = () => {
        setGameState((prev) => resetGame(prev));
    };

    const renderBoard = () => {
        const cells = [];
        const { boardWidth, boardHeight } = DEFAULT_CONFIG;

        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                let cellColor: string | null = gameState.board[y][x];
                let isGhost = false;
                let isCurrent = false;

                // Check if current piece occupies this cell
                if (gameState.currentPiece) {
                    const piece = gameState.currentPiece;
                    const pieceX = x - piece.position.x;
                    const pieceY = y - piece.position.y;

                    if (
                        pieceX >= 0 &&
                        pieceX < piece.shape[0].length &&
                        pieceY >= 0 &&
                        pieceY < piece.shape.length &&
                        piece.shape[pieceY][pieceX]
                    ) {
                        cellColor = piece.color;
                        isCurrent = true;
                    }

                    // Check ghost position
                    if (gameState.ghostPosition && !isCurrent) {
                        const ghostX = x - gameState.ghostPosition.x;
                        const ghostY = y - gameState.ghostPosition.y;

                        if (
                            ghostX >= 0 &&
                            ghostX < piece.shape[0].length &&
                            ghostY >= 0 &&
                            ghostY < piece.shape.length &&
                            piece.shape[ghostY][ghostX]
                        ) {
                            isGhost = true;
                            cellColor = piece.color;
                        }
                    }
                }

                const cellStyle: React.CSSProperties = cellColor
                    ? { backgroundColor: cellColor }
                    : {};

                cells.push(
                    <div
                        key={`${x}-${y}`}
                        className={`${styles.cell} ${cellColor && !isGhost ? styles.cellFilled : ''} ${isGhost ? styles.cellGhost : ''}`}
                        style={cellStyle}
                    />
                );
            }
        }

        return cells;
    };

    const renderNextPiece = () => {
        if (!gameState.nextPiece) return null;

        const cells = [];
        const shape = gameState.nextPiece.shape;
        const color = gameState.nextPiece.color;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                const isFilled = shape[y][x] === 1;
                cells.push(
                    <div
                        key={`next-${x}-${y}`}
                        className={`${styles.nextCell} ${isFilled ? styles.nextCellFilled : ''}`}
                        style={isFilled ? { backgroundColor: color } : {}}
                    />
                );
            }
        }

        return (
            <div
                className={styles.nextPieceGrid}
                style={{
                    gridTemplateColumns: `repeat(${shape[0].length}, 1fr)`,
                }}
            >
                {cells}
            </div>
        );
    };

    return (
        <div className={styles.container} ref={containerRef} tabIndex={0}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Stats Bar */}
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <motion.span
                                key={gameState.score}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={styles.statValue}
                            >
                                {gameState.score}
                            </motion.span>
                            <span className={styles.statLabel}>Score</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.level}</span>
                            <span className={styles.statLabel}>Level</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.linesCleared}</span>
                            <span className={styles.statLabel}>Lines</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{gameState.highScore}</span>
                            <span className={styles.statLabel}>Best</span>
                        </div>
                    </div>

                    {/* Main Game Layout */}
                    <div className={styles.gameLayout}>
                        {/* Left - Game Board */}
                        <div className={styles.leftPanel}>
                            <div className={styles.boardWrapper}>
                                <div className={styles.boardContainer}>
                                    <div
                                        className={styles.board}
                                        style={{
                                            gridTemplateColumns: `repeat(${DEFAULT_CONFIG.boardWidth}, 1fr)`,
                                            gridTemplateRows: `repeat(${DEFAULT_CONFIG.boardHeight}, 1fr)`,
                                        }}
                                    >
                                        {renderBoard()}
                                    </div>

                                    {/* Overlay for idle/paused/gameOver */}
                                    {gameState.status !== 'playing' && (
                                        <div className={styles.overlay}>
                                            {gameState.status === 'idle' && (
                                                <>
                                                    <div className={styles.overlayTitle}>🧱 Tetris</div>
                                                    <div className={styles.overlaySubtitle}>Press Space or Start</div>
                                                </>
                                            )}
                                            {gameState.status === 'paused' && (
                                                <div className={styles.overlayTitle}>⏸️ Paused</div>
                                            )}
                                            {gameState.status === 'gameOver' && (
                                                <>
                                                    <div className={`${styles.overlayTitle} ${styles.gameOverText}`}>
                                                        Game Over!
                                                    </div>
                                                    <div className={styles.overlaySubtitle}>
                                                        Score: {gameState.score}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right - Controls Panel */}
                        <div className={styles.rightPanel}>
                            {/* Next Piece */}
                            <div className={styles.nextPieceContainer}>
                                <div className={styles.nextPieceLabel}>Next</div>
                                {renderNextPiece()}
                            </div>

                            {/* Game Controls */}
                            <div className={styles.controls}>
                                {gameState.status === 'idle' && (
                                    <Button onClick={handleStart} className={styles.controlButton}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Start
                                    </Button>
                                )}
                                {gameState.status === 'playing' && (
                                    <Button onClick={handlePauseToggle} variant="outline" className={styles.controlButton}>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                    </Button>
                                )}
                                {gameState.status === 'paused' && (
                                    <Button onClick={handlePauseToggle} className={styles.controlButton}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Resume
                                    </Button>
                                )}
                                {gameState.status === 'gameOver' && (
                                    <Button onClick={handleRestart} className={styles.controlButton}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Play Again
                                    </Button>
                                )}
                                {gameState.status !== 'idle' && gameState.status !== 'gameOver' && (
                                    <Button onClick={handleRestart} variant="outline" className={styles.controlButton}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Restart
                                    </Button>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className={styles.instructions}>
                                <div className={styles.instructionsTitle}>Controls</div>
                                <ul className={styles.instructionsList}>
                                    <li><kbd>←</kbd> <kbd>→</kbd> Move</li>
                                    <li><kbd>↑</kbd> Rotate</li>
                                    <li><kbd>↓</kbd> Soft Drop</li>
                                    <li><kbd>Space</kbd> Hard Drop</li>
                                    <li><kbd>P</kbd> Pause</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
