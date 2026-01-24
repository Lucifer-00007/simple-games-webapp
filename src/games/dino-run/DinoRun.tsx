'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, updateGame } from './game-logic';
import { GameState, DINO_CONFIG, Difficulty } from './types';
import styles from './styles.module.css';

export function DinoRun({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>('medium');
    const [state, setState] = React.useState<GameState>(createInitialState('medium'));
    const [frame, setFrame] = React.useState(0);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>(0);
    
    // Parallax elements
    const clouds = React.useRef<{ x: number; y: number; speed: number }[]>([]);

    const handleJump = React.useCallback(() => {
        if (state.status === 'playing' && !state.dino.isJumping) {
            setState(prev => ({
                ...prev,
                dino: { ...prev.dino, velocity: DINO_CONFIG.JUMP_FORCE, isJumping: true }
            }));
        } else if (state.status !== 'playing') {
            setState(prev => ({ ...createInitialState(selectedDifficulty), status: 'playing', highScore: prev.highScore }));
        }
    }, [state.status, state.dino.isJumping, selectedDifficulty]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleJump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJump]);

    // Animation frame for dino run
    React.useEffect(() => {
        if (state.status !== 'playing') return;
        const interval = setInterval(() => setFrame(f => (f + 1) % 2), 100);
        return () => clearInterval(interval);
    }, [state.status]);

    const animate = () => {
        setState(prev => {
            const newState = updateGame(prev, 16);
            if (prev.status === 'playing' && newState.status === 'gameOver') {
                onScoreUpdate?.(newState.score);
            }
            return newState;
        });

        // Move clouds
        if (clouds.current.length < 3 && Math.random() < 0.01) {
            clouds.current.push({ x: 600, y: 30 + Math.random() * 50, speed: 0.5 + Math.random() * 0.5 });
        }
        clouds.current.forEach(c => { c.x -= c.speed; });
        clouds.current = clouds.current.filter(c => c.x > -100);

        requestRef.current = requestAnimationFrame(animate);
    };

    React.useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const isDark = (Math.floor(state.score / 1000) % 2) === 1;
        const bgColor = isDark ? '#1e293b' : '#f8fafc';
        const fgColor = isDark ? '#f1f5f9' : '#1e293b';

        // Draw Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Clouds
        ctx.fillStyle = isDark ? '#334155' : '#e2e8f0';
        clouds.current.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, 15, 0, Math.PI * 2);
            ctx.arc(c.x + 15, c.y - 5, 12, 0, Math.PI * 2);
            ctx.arc(c.x + 25, c.y, 15, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ground Line
        ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, DINO_CONFIG.GROUND_Y + 40);
        ctx.lineTo(canvas.width, DINO_CONFIG.GROUND_Y + 40);
        ctx.stroke();

        // Dino
        ctx.fillStyle = state.status === 'gameOver' ? '#ef4444' : '#3b82f6';
        const { x, y, width, height } = state.dino;
        
        // Simple Dino Shape
        ctx.fillRect(x, y, width, height); // Body
        ctx.fillRect(x + width - 10, y - 10, 15, 15); // Head
        
        // Animated Legs
        if (!state.dino.isJumping && state.status === 'playing') {
            ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
            if (frame === 0) {
                ctx.fillRect(x + 5, y + height, 8, 5);
                ctx.fillRect(x + width - 13, y + height, 8, 5);
            } else {
                ctx.fillRect(x + 10, y + height, 8, 5);
                ctx.fillRect(x + width - 18, y + height, 8, 5);
            }
        }

        // Obstacles
        state.obstacles.forEach(obs => {
            if (obs.type === 'cactus') {
                ctx.fillStyle = '#10b981';
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                // Cactus arms
                ctx.fillRect(obs.x - 5, obs.y + 10, 5, 10);
                ctx.fillRect(obs.x + obs.width, obs.y + 5, 5, 10);
            } else {
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.moveTo(obs.x, obs.y + obs.height/2);
                ctx.lineTo(obs.x + obs.width, obs.y);
                ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                ctx.fill();
            }
        });
    }, [state, frame]);

    const isNight = (Math.floor(state.score / 1000) % 2) === 1;

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className="flex items-center gap-2">
                            {isNight ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                {isNight ? 'Night' : 'Day'}
                            </span>
                        </div>
                        <div className="flex-1" />
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Score</span>
                            <span className={styles.statValue}>{state.score}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>HI</span>
                            <span className={styles.statValue}>{state.highScore}</span>
                        </div>
                    </div>

                    <div className={styles.canvasContainer} onClick={handleJump}>
                        <canvas ref={canvasRef} width={600} height={300} className={styles.canvas} />
                        
                        <AnimatePresence>
                            {state.status !== 'playing' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className={styles.overlay}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="bg-white/95 dark:bg-slate-900/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 text-center border border-border"
                                    >
                                        <h2 className={styles.overlayTitle}>
                                            {state.status === 'gameOver' ? 'WASTED' : 'Dino Run'}
                                        </h2>
                                        
                                        {state.status === 'idle' && (
                                            <div className="flex gap-2 mb-2">
                                                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                                                    <Button
                                                        key={d}
                                                        variant={selectedDifficulty === d ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); setSelectedDifficulty(d); }}
                                                        className="capitalize"
                                                    >
                                                        {d}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {state.status === 'gameOver' && (
                                            <div className="flex flex-col gap-1">
                                                <p className="text-muted-foreground">You survived for {state.score} points!</p>
                                                {state.score >= state.highScore && state.score > 0 && (
                                                    <span className="text-yellow-500 font-bold flex items-center justify-center gap-1">
                                                        <Trophy className="w-4 h-4" /> New High Score!
                                                    </span>
                                                )}
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    Difficulty: <span className="capitalize font-bold text-foreground">{state.difficulty}</span>
                                                </div>
                                            </div>
                                        )}
                                        <Button onClick={(e) => { e.stopPropagation(); handleJump(); }} size="lg" className="w-full font-bold px-8">
                                            {state.status === 'gameOver' ? <RotateCcw className="mr-2" /> : <Play className="mr-2" />}
                                            {state.status === 'gameOver' ? 'Try Again' : 'Start (Space)'}
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <p className={styles.instructions}>Press Space or Click to Jump</p>
                </CardContent>
            </Card>
        </div>
    );
}
