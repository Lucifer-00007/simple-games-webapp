'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInitialState, getBestMove, getLegalMoves, makeMove } from './game-logic';
import { GameMode, GameState } from './types';
import styles from './styles.module.css';

interface ChessProps {
    onScoreUpdate?: (score: number) => void;
}

const PIECE_SYMBOLS: Record<string, string> = {
    'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖', 'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
    'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜', 'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟',
};

export function Chess({ onScoreUpdate }: ChessProps) {
    const [gameState, setGameState] = React.useState<GameState>(createInitialState);
    const [gameMode, setGameMode] = React.useState<GameMode>('human-vs-cpu');

    // AI Turn
    React.useEffect(() => {
        if (gameState.status !== 'playing') return;

        let timer: NodeJS.Timeout;

        const makeAIMove = () => {
            // Depth 2 provides a decent challenge without blocking the main thread too long
            const bestMove = getBestMove(gameState, 2);
            if (bestMove) {
                setGameState(prev => {
                    // Check again if still playing inside the callback to avoid race conditions
                    if (prev.status !== 'playing') return prev;
                    return makeMove(prev, bestMove.from, bestMove.to);
                });
            }
        };

        if (gameMode === 'cpu-vs-cpu') {
            timer = setTimeout(makeAIMove, 500);
        } else if (gameMode === 'human-vs-cpu' && gameState.turn === 'black') {
            timer = setTimeout(makeAIMove, 500);
        }

        return () => clearTimeout(timer);
    }, [gameState, gameMode]);

    const handleSquareClick = (row: number, col: number) => {
        if (gameState.status !== 'playing') return;
        if (gameMode === 'cpu-vs-cpu') return;
        if (gameMode === 'human-vs-cpu' && gameState.turn === 'black') return;

        const clickedPos = { row, col };
        const piece = gameState.board[row][col];

        // If a piece is already selected
        if (gameState.selectedPosition) {
            // If clicked on the same piece, deselect
            if (gameState.selectedPosition.row === row && gameState.selectedPosition.col === col) {
                setGameState(prev => ({ ...prev, selectedPosition: null, possibleMoves: [] }));
                return;
            }

            // Check if it's a valid move
            const isMove = gameState.possibleMoves.some(m => m.row === row && m.col === col);
            if (isMove) {
                setGameState(prev => {
                    const newState = makeMove(prev, prev.selectedPosition!, clickedPos);
                    if (newState.status === 'checkmate') {
                        onScoreUpdate?.(100); // Simple score for winning
                    }
                    return newState;
                });
                return;
            }

            // If clicked on another own piece, select it instead
            if (piece && piece.color === gameState.turn) {
                const moves = getLegalMoves(gameState.board, clickedPos);
                setGameState(prev => ({ ...prev, selectedPosition: clickedPos, possibleMoves: moves }));
                return;
            }

            // Clicked on empty square or invalid move -> deselect
            setGameState(prev => ({ ...prev, selectedPosition: null, possibleMoves: [] }));
        } else {
            // Select piece
            if (piece && piece.color === gameState.turn) {
                const moves = getLegalMoves(gameState.board, clickedPos);
                setGameState(prev => ({ ...prev, selectedPosition: clickedPos, possibleMoves: moves }));
            }
        }
    };

    const handleRestart = () => {
        setGameState(createInitialState());
    };

    const togglePause = () => {
        setGameState(prev => {
            if (prev.status === 'playing') return { ...prev, status: 'paused' };
            if (prev.status === 'paused') return { ...prev, status: 'playing' };
            return prev;
        });
    };

    const isSelected = (r: number, c: number) => {
        return gameState.selectedPosition?.row === r && gameState.selectedPosition?.col === c;
    };

    const isPossibleMove = (r: number, c: number) => {
        return gameState.possibleMoves.some(m => m.row === r && m.col === c);
    };

    const isLastMove = (r: number, c: number) => {
        const lastMove = gameState.history[gameState.history.length - 1];
        if (!lastMove) return false;
        return (lastMove.from.row === r && lastMove.from.col === c) || (lastMove.to.row === r && lastMove.to.col === c);
    };

    const renderBoard = () => {
        const board = [];
        for (let r = 0; r < 8; r++) {
            const row = [];
            for (let c = 0; c < 8; c++) {
                const isLight = (r + c) % 2 === 0;
                const piece = gameState.board[r][c];
                const selected = isSelected(r, c);
                const possible = isPossibleMove(r, c);
                const last = isLastMove(r, c);
                const inCheck = piece?.type === 'king' && gameState.inCheck === piece.color;

                row.push(
                    <div
                        key={`${r}-${c}`}
                        className={`
                            ${styles.square} 
                            ${isLight ? styles.light : styles.dark}
                            ${selected ? styles.selected : ''}
                            ${last ? styles.lastMove : ''}
                            ${inCheck ? styles.check : ''}
                        `}
                        onClick={() => handleSquareClick(r, c)}
                    >
                        {possible && (
                            <div className={`${styles.marker} ${piece ? styles.captureMarker : ''}`} />
                        )}
                        {piece && (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`${styles.piece} ${piece.color === 'white' ? styles.whitePiece : styles.blackPiece}`}
                            >
                                {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                            </motion.span>
                        )}
                    </div>
                );
            }
            board.push(<div key={r} className={styles.row}>{row}</div>);
        }
        return board;
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <Select value={gameMode} onValueChange={(v) => { setGameMode(v as GameMode); handleRestart(); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="human-vs-human">Human vs Human</SelectItem>
                                <SelectItem value="human-vs-cpu">Human vs Computer</SelectItem>
                                <SelectItem value="cpu-vs-cpu">Computer vs Computer</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${gameState.turn === 'white' ? 'text-primary' : 'text-muted-foreground'}`}>
                                {gameState.turn === 'white' ? "White's Turn" : "Black's Turn"}
                            </span>
                            {gameState.inCheck && <span className="text-red-500 font-bold animate-pulse">CHECK!</span>}
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={togglePause} variant="outline" size="icon" disabled={gameState.status !== 'playing' && gameState.status !== 'paused'}>
                                {gameState.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </Button>
                            <Button onClick={handleRestart} variant="outline" size="sm">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restart
                            </Button>
                        </div>
                    </div>

                    {/* Board */}
                    <div className={styles.boardWrapper}>
                        <div className={styles.board}>
                            {renderBoard()}
                        </div>
                    </div>

                    {/* Game Over Overlay */}
                    {(gameState.status === 'checkmate' || gameState.status === 'stalemate' || gameState.status === 'draw') && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.overlay}
                        >
                            <div className={styles.resultCard}>
                                <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                                <h2 className="text-2xl font-bold mb-1">
                                    {gameState.status === 'checkmate'
                                        ? `${gameState.winner === 'white' ? 'White' : 'Black'} Wins!`
                                        : 'Draw!'}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {gameState.status === 'checkmate' ? 'Checkmate' : 'Stalemate'}
                                </p>
                                <Button onClick={handleRestart}>Play Again</Button>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
