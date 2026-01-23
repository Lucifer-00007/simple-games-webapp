'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startNewBall, updateCricket } from './game-logic';
import { GameState, CRICKET_CONFIG } from './types';
import styles from './styles.module.css';

export function DoodleCricket({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [state, setState] = React.useState<GameState>(createInitialState());
    const [hitText, setHitText] = React.useState<{ text: string; x: number; y: number; opacity: number } | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>(0);

    const handleAction = () => {
        if (state.status === 'idle') {
            setState(prev => startNewBall(prev));
        } else if (state.status === 'bowling') {
            const prevState = state;
            setState(prev => ({ ...prev, isSwinging: true, lastSwingTime: Date.now() }));
            
            // Temporary feedback for hit
            setTimeout(() => {
                setState(prev => {
                    if (prev.score > prevState.score) {
                        const runs = prev.score - prevState.score;
                        setHitText({ text: runs === 6 ? 'SIX!' : runs === 4 ? 'FOUR!' : `${runs} RUNS`, x: 500, y: 200, opacity: 1 });
                        setTimeout(() => setHitText(null), 1000);
                    }
                    return { ...prev, isSwinging: false };
                });
            }, 200);
        } else if (state.status === 'gameOver') {
            setState(createInitialState());
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.status, state.score]);

    const animate = () => {
        setState(prev => {
            const next = updateCricket(prev);
            if (prev.status !== 'gameOver' && next.status === 'gameOver') {
                onScoreUpdate?.(next.score);
            }
            return next;
        });
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

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- STADIUM BACKGROUND ---
        // Sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 300);
        skyGradient.addColorStop(0, '#7dd3fc'); // Sky blue
        skyGradient.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, 300);

        // Grass/Pitch
        const pitchGradient = ctx.createLinearGradient(0, 300, 0, 400);
        pitchGradient.addColorStop(0, '#4ade80'); // Green
        pitchGradient.addColorStop(1, '#16a34a');
        ctx.fillStyle = pitchGradient;
        ctx.fillRect(0, 300, canvas.width, 100);

        // Pitch dirt area
        ctx.fillStyle = '#fde68a'; // Sandy color
        ctx.beginPath();
        ctx.ellipse(300, 320, 250, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- STUMPS ---
        const drawStumps = (x: number, y: number) => {
            ctx.fillStyle = '#78350f'; // Dark wood
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x + i * 10, y, 4, 50);
            }
            // Bails
            ctx.fillRect(x - 2, y, 28, 3);
        };
        drawStumps(CRICKET_CONFIG.STUMPS_X, CRICKET_CONFIG.STUMPS_Y);

        // --- BATTER ---
        const batterX = 530;
        const batterY = 230;
        
        // Body (Simple character)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(batterX, batterY, 15, 70); // Legs/Torso
        ctx.fillStyle = '#f87171'; // Shirt
        ctx.fillRect(batterX - 2, batterY + 15, 19, 30);
        ctx.fillStyle = '#ffedd5'; // Head
        ctx.beginPath();
        ctx.arc(batterX + 7, batterY + 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Bat
        ctx.save();
        ctx.translate(batterX, batterY + 40);
        if (state.isSwinging) {
            ctx.rotate(-Math.PI / 1.5);
        } else {
            ctx.rotate(0.2); // Idle angle
        }
        ctx.fillStyle = '#fbbf24'; // Bat yellow
        ctx.fillRect(-4, -5, 8, 45); // Bat body
        ctx.fillStyle = '#451a03'; // Handle
        ctx.fillRect(-2, -15, 4, 15);
        ctx.restore();

        // --- BOWLER (Visual only) ---
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, 230, 15, 70);
        ctx.fillStyle = '#60a5fa'; // Bowler shirt
        ctx.fillRect(38, 245, 19, 30);
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.arc(47, 235, 8, 0, Math.PI * 2);
        ctx.fill();

        // --- BALL ---
        if (state.ball.active) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(state.ball.x, 320, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ball body
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, 7, 0, Math.PI * 2);
            ctx.fill();
            // Stitching detail
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, 7, 0, Math.PI);
            ctx.stroke();
        }

        // --- HIT FEEDBACK ---
        if (hitText) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${hitText.opacity})`;
            ctx.font = 'bold 48px Inter, system-ui';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.fillText(hitText.text, canvas.width / 2, 150);
            ctx.strokeText(hitText.text, canvas.width / 2, 150);
            ctx.restore();
        }
    }, [state, hitText]);

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Score</span>
                            <span className={styles.statValue}>{state.score}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Out</span>
                            <span className={styles.statValue}>{state.wickets}/3</span>
                        </div>
                    </div>

                    <div className={styles.canvasContainer} onClick={handleAction}>
                        <canvas ref={canvasRef} width={600} height={400} className={styles.canvas} />
                        
                        {state.status === 'idle' && (
                            <div className={styles.overlay}>
                                <motion.div 
                                    initial={{ scale: 0.9 }} 
                                    animate={{ scale: 1 }} 
                                    transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                                >
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-full shadow-lg">
                                        READY? CLICK TO BOWL
                                    </Button>
                                </motion.div>
                            </div>
                        )}

                        {state.status === 'gameOver' && (
                            <div className={styles.overlay}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/95 dark:bg-slate-900/95 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 text-center"
                                >
                                    <Trophy className="w-16 h-16 text-yellow-500" />
                                    <h2 className={styles.overlayTitle}>Match Over!</h2>
                                    <p className={styles.overlaySubtitle}>Final Score: <span className="text-primary font-black text-3xl">{state.score}</span></p>
                                    <Button size="lg" onClick={() => setState(createInitialState())} className="w-full font-bold">
                                        <RotateCcw className="mr-2 h-5 w-5" /> Play Again
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </div>
                    
                    <p className={styles.instructions}>Wait for the ball, then click or press Space to swing!</p>
                </CardContent>
            </Card>
        </div>
    );
}
