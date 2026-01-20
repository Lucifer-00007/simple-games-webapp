'use client';

import * as React from 'react';
import { Play, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, movePlayer, startGame, resetGame, DEFAULT_CONFIG } from './game-logic';
import { GameState } from './types';

export function CrossyRoad({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <Card style={{ maxWidth: '450px' }}>
                <CardContent style={{ padding: '1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Score: {gameState.score}</div>
                    </div>

                    <div style={{ width: DEFAULT_CONFIG.canvasWidth, height: DEFAULT_CONFIG.canvasHeight, background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)', border: '2px solid hsl(var(--border))', borderRadius: '0.5rem', position: 'relative', margin: '0 auto 1rem' }}>
                        <div style={{ position: 'absolute', left: gameState.player.x * DEFAULT_CONFIG.gridSize, top: DEFAULT_CONFIG.canvasHeight - (gameState.player.y + 1) * DEFAULT_CONFIG.gridSize, width: DEFAULT_CONFIG.gridSize, height: DEFAULT_CONFIG.gridSize, background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🐔
                        </div>

                        {gameState.status !== 'playing' && (
                            <div style={{ position: 'absolute', inset: 0, background: 'hsl(0 0% 0% / 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem' }}>
                                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
                                    {gameState.status === 'idle' ? '🐔 Crossy Road' : 'Game Over!'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        {gameState.status === 'idle' && (
                            <Button onClick={() => setGameState((prev) => startGame(prev))}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        )}
                        {gameState.status === 'playing' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gap: '0.25rem' }}>
                                <div />
                                <Button onClick={() => setGameState((prev) => movePlayer(prev, 0, -1))} size="sm">
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                                <div />
                                <Button onClick={() => setGameState((prev) => movePlayer(prev, -1, 0))} size="sm">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setGameState((prev) => movePlayer(prev, 0, 1))} size="sm">
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setGameState((prev) => movePlayer(prev, 1, 0))} size="sm">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
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
