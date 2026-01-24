'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startGame, updateBlock, dropBlock, resetGame, DEFAULT_CONFIG } from './game-logic';
import { GameState } from './types';

export function TowerBlocks({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const gameLoopRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const loop = () => {
                setGameState((prev) => updateBlock(prev));
                gameLoopRef.current = requestAnimationFrame(loop);
            };
            gameLoopRef.current = requestAnimationFrame(loop);
        }

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState.status]);

    React.useEffect(() => {
        if (gameState.status === 'gameOver') {
            onScoreUpdate?.(gameState.highScore);
        }
    }, [gameState.status, gameState.highScore, onScoreUpdate]);

    const handleDrop = () => {
        setGameState((prev) => dropBlock(prev));
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' && gameState.status === 'playing') {
                e.preventDefault();
                handleDrop();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.status]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <Card style={{ maxWidth: '400px', width: '100%' }}>
                <CardContent style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', padding: '0.75rem', background: 'hsl(var(--muted) / 0.5)', borderRadius: '0.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <motion.div key={gameState.score} initial={{ scale: 1.2 }} animate={{ scale: 1 }} style={{ fontSize: '1.5rem', fontWeight: 700 }}>{gameState.score}</motion.div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Height</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{gameState.highScore}</div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Best</div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', width: DEFAULT_CONFIG.canvasWidth, height: DEFAULT_CONFIG.canvasHeight, margin: '0 auto 1rem', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', borderRadius: '0.5rem', border: '2px solid hsl(var(--border))', overflow: 'hidden' }}>
                        {gameState.blocks.map((block, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    bottom: i * DEFAULT_CONFIG.blockHeight,
                                    left: block.x,
                                    width: block.width,
                                    height: DEFAULT_CONFIG.blockHeight,
                                    background: `hsl(${i * 20}, 70%, 60%)`,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}
                            />
                        ))}
                        {gameState.status === 'playing' && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: gameState.blocks.length * DEFAULT_CONFIG.blockHeight,
                                    left: gameState.currentBlock.x,
                                    width: gameState.currentBlock.width,
                                    height: DEFAULT_CONFIG.blockHeight,
                                    background: `hsl(${gameState.blocks.length * 20}, 70%, 60%)`,
                                    border: '1px solid rgba(255,255,255,0.4)',
                                }}
                            />
                        )}
                        {gameState.status !== 'playing' && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'hsl(0 0% 0% / 0.85)', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                                    {gameState.status === 'idle' ? '🏗️ Tower Blocks' : 'Game Over!'}
                                </div>
                                {gameState.status === 'gameOver' && (
                                    <div style={{ fontSize: '0.875rem', color: 'hsl(0 0% 70%)' }}>
                                        Height: {gameState.score}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        {gameState.status === 'idle' && (
                            <Button onClick={() => setGameState((prev) => startGame(prev))}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        )}
                        {gameState.status === 'playing' && (
                            <Button onClick={handleDrop}>
                                Drop Block
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
