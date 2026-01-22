'use client';

import * as React from 'react';
import { Play, RotateCcw, Minus, Plus, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createInitialState, updateGame, checkInput, startGame, pauseGame, resumeGame, resetGame } from './game-logic';
import { GameState } from './types';

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <Card style={{ maxWidth: '500px', width: '100%' }}>
                <CardContent style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>Score: <strong>{gameState.score}</strong></div>
                        <div>Lives: <strong>{'❤️'.repeat(gameState.lives)}</strong></div>
                        <div>Best: <strong>{gameState.highScore}</strong></div>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '400px', background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%)', border: '2px solid hsl(var(--border))', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
                        {gameState.words.map(word => (
                            <div key={word.id} style={{ 
                                position: 'absolute', 
                                top: word.y, 
                                left: `${word.x}%`, 
                                transform: 'translateX(-50%)', 
                                fontSize: '1.25rem', // Slightly smaller to prevent overlap
                                fontWeight: 700, 
                                color: '#1f2937', 
                                padding: '0.25rem 0.75rem', 
                                background: 'rgba(255,255,255,0.9)', 
                                borderRadius: '0.25rem', 
                                border: '2px solid #3b82f6',
                                whiteSpace: 'nowrap'
                            }}>
                                {word.text}
                            </div>
                        ))}

                        {gameState.status !== 'playing' && (
                            <div style={{ position: 'absolute', inset: 0, background: 'hsl(0 0% 0% / 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                                    {gameState.status === 'idle' ? '⌨️ Typing Game' : 
                                     gameState.status === 'paused' ? 'Paused' : 'Game Over!'}
                                </div>
                                {gameState.status === 'gameOver' && (
                                    <div style={{ color: 'white', marginBottom: '1rem', fontSize: '1.25rem' }}>Final Score: {gameState.score}</div>
                                )}
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                    <span style={{ color: 'white', fontWeight: 500 }}>Speed: {gameState.speedLevel}</span>
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

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
