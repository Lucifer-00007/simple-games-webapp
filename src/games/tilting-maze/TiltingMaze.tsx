'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, updateBall, startGame, DEFAULT_CONFIG } from './game-logic';
import { GameState } from './types';

export function TiltingMaze({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [gameState, setGameState] = React.useState<GameState>(() => createInitialState());
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const keysPressed = React.useRef<Set<string>>(new Set());

    const draw = React.useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, DEFAULT_CONFIG.canvasWidth, DEFAULT_CONFIG.canvasHeight);

        // Draw ball
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, DEFAULT_CONFIG.ballRadius, 0, Math.PI * 2);
        ctx.fill();
    }, [gameState]);

    React.useEffect(() => {
        if (gameState.status === 'playing') {
            const loop = () => {
                let tiltX = 0, tiltY = 0;
                if (keysPressed.current.has('ArrowLeft')) tiltX = -1;
                if (keysPressed.current.has('ArrowRight')) tiltX = 1;
                if (keysPressed.current.has('ArrowUp')) tiltY = -1;
                if (keysPressed.current.has('ArrowDown')) tiltY = 1;

                setGameState((prev) => updateBall(prev, tiltX, tiltY));
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }
    }, [gameState.status]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current.add(e.key); };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current.delete(e.key); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    React.useEffect(() => { draw(); }, [draw]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
            <Card style={{ maxWidth: '450px' }}>
                <CardContent style={{ padding: '1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
                        🎯 Tilting Maze
                    </div>

                    <canvas ref={canvasRef} width={DEFAULT_CONFIG.canvasWidth} height={DEFAULT_CONFIG.canvasHeight} style={{ background: 'liner-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)', border: '2px solid hsl(var(--border))', borderRadius: '0.5rem', margin: '0 auto 1rem', display: 'block' }} />

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {gameState.status === 'idle' && (
                            <Button onClick={() => setGameState((prev) => startGame(prev))}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                        Use arrow keys to tilt
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
