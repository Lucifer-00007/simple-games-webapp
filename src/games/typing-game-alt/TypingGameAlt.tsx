'use client';

import * as React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createInitialState, updateGame, typeCharacter, startGame, resetGame } from './game-logic';
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            setGameState((prev) => typeCharacter(prev, e.key.toLowerCase()));
        }
    };

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
                            <div key={word.id} style={{ position: 'absolute', top: word.y, left: '50%', transform: 'translateX(-50%)', fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.9)', borderRadius: '0.25rem', border: '2px solid #3b82f6' }}>
                                {word.text}
                            </div>
                        ))}

                        {gameState.status !== 'playing' && (
                            <div style={{ position: 'absolute', inset: 0, background: 'hsl(0 0% 0% / 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
                                    {gameState.status === 'idle' ? '⌨️ Typing Game' : 'Game Over!'}
                                </div>
                                {gameState.status === 'gameOver' && (
                                    <div style={{ color: 'white', marginTop: '0.5rem' }}>Score: {gameState.score}</div>
                                )}
                            </div>
                        )}
                    </div>

                    {gameState.status === 'playing' && (
                        <Input
                            ref={inputRef}
                            value={gameState.currentInput}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setGameState((prev) => ({ ...prev, currentInput: e.target.value }))}
                            placeholder="Type the falling words..."
                            autoFocus
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        {gameState.status === 'idle' && (
                            <Button onClick={() => setGameState((prev) => startGame(prev))}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        )}
                        {gameState.status === 'gameOver' && (
                            <Button onClick={() => setGameState((prev) => resetGame(prev))}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
