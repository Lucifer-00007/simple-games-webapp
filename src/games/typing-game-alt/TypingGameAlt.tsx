'use client';

import * as React from 'react';
import { Play, RotateCcw, Minus, Plus, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createInitialState, updateGame, checkInput, startGame, pauseGame, resumeGame, resetGame } from './game-logic';
import { GameState } from './types';
import styles from './styles.module.css';

export function TypingGameAlt({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const interval = setInterval(() => {
                setGameState((prev) => {
                    const newState = updateGame(prev);
                    if (newState.status === 'gameOver') onScoreUpdate?.(newState.highScore);
                    return newState;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [gameState.status, onScoreUpdate]);

    // Keep input focused when playing
    React.useEffect(() => {
        if (gameState.status === 'playing') {
            inputRef.current?.focus();
        }
    }, [gameState.status, gameState.words]);

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <CardContent style={{ padding: '1.5rem' }}>
                    <div className={styles.statsBar}>
                        <div>Score: <strong>{gameState.score}</strong></div>
                        <div>Lives: <strong>{'❤️'.repeat(gameState.lives)}</strong></div>
                        <div>Best: <strong>{gameState.highScore}</strong></div>
                    </div>

                    <div className={styles.gameArea}>
                        {gameState.words.map(word => (
                            <div 
                                key={word.id} 
                                className={styles.word}
                                style={{ top: word.y, left: `${word.x}%` }}
                            >
                                {word.text}
                            </div>
                        ))}

                        {gameState.status !== 'playing' && (
                            <div className={styles.overlay}>
                                <div className={styles.overlayTitle}>
                                    {gameState.status === 'idle' ? '⌨️ Typing Game' : 
                                     gameState.status === 'paused' ? 'Paused' : 'Game Over!'}
                                </div>
                                {gameState.status === 'gameOver' && (
                                    <div className={styles.overlayScore}>Final Score: {gameState.score}</div>
                                )}
                                
                                <div className={styles.speedControl}>
                                    <span className={styles.speedLabel}>Speed: {gameState.speedLevel}</span>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => setGameState(prev => ({ ...prev, speedLevel: Math.max(1, prev.speedLevel - 1) }))}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => setGameState(prev => ({ ...prev, speedLevel: Math.min(10, prev.speedLevel + 1) }))}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.controls}>
                        <Input
                            ref={inputRef}
                            value={gameState.currentInput}
                            onChange={(e) => setGameState((prev) => checkInput(prev, e.target.value))}
                            placeholder={gameState.status === 'playing' ? "Type here..." : "Press Start..."}
                            disabled={gameState.status !== 'playing'}
                            autoComplete="off"
                            className="flex-1"
                        />
                        
                        {gameState.status === 'idle' ? (
                            <Button onClick={() => setGameState((prev) => startGame(prev))}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        ) : gameState.status === 'playing' ? (
                            <Button onClick={() => setGameState((prev) => pauseGame(prev))}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                            </Button>
                        ) : gameState.status === 'paused' ? (
                            <Button onClick={() => setGameState((prev) => resumeGame(prev))}>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                            </Button>
                        ) : (
                            <Button onClick={() => setGameState((prev) => resetGame(prev))}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restart
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}