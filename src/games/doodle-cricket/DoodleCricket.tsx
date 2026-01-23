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
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, 150);

        // Grass with stripes (perspective)
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#4CAF50' : '#45a049';
            const yStart = 150 + (i * 25);
            ctx.fillRect(0, yStart, canvas.width, 25);
            
            // Add some grass blades for texture
            ctx.fillStyle = i % 2 === 0 ? '#45a049' : '#4CAF50';
            for (let j = 0; j < 5; j++) {
                ctx.fillRect(Math.random() * canvas.width, yStart + Math.random() * 25, 2, 4);
            }
        }

        // Pitch (Perspective Trapezoid)
        ctx.fillStyle = '#f0e68c'; // Khaki/Sand
        ctx.beginPath();
        ctx.moveTo(250, 150); // Top left
        ctx.lineTo(350, 150); // Top right
        ctx.lineTo(550, 400); // Bottom right
        ctx.lineTo(50, 400);  // Bottom left
        ctx.closePath();
        ctx.fill();

        // Pitch lines
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(260, 170);
        ctx.lineTo(340, 170);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(100, 350);
        ctx.lineTo(500, 350);
        ctx.stroke();

        // --- STUMPS (Batter side) ---
        const drawStumps = (x: number, y: number, scale: number = 1) => {
            ctx.fillStyle = '#ffffff'; // White stumps in doodle
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x + i * (8 * scale), y, 3 * scale, 40 * scale);
            }
            // Bails
            ctx.fillRect(x - 2, y, 20 * scale, 3 * scale);
        };
        drawStumps(CRICKET_CONFIG.STUMPS_X - 10, CRICKET_CONFIG.STUMPS_Y, 1.2);

        // --- BATTER (Cricket) ---
        const drawBatter = (x: number, y: number, isSwinging: boolean) => {
            ctx.save();
            ctx.translate(x, y);

            // Legs
            ctx.strokeStyle = '#2d5a27';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-5, 10); ctx.lineTo(-10, 30);
            ctx.moveTo(5, 10); ctx.lineTo(10, 30);
            ctx.stroke();

            // Body (Green Cricket)
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.ellipse(0, 0, 15, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.arc(0, -25, 12, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-5, -28, 4, 0, Math.PI * 2);
            ctx.arc(5, -28, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(-5, -28, 2, 0, Math.PI * 2);
            ctx.arc(5, -28, 2, 0, Math.PI * 2);
            ctx.fill();

            // Antennae
            ctx.strokeStyle = '#2d5a27';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-5, -35); ctx.lineTo(-12, -45);
            ctx.moveTo(5, -35); ctx.lineTo(12, -45);
            ctx.stroke();

            // Bat
            ctx.save();
            ctx.translate(0, 5);
            if (isSwinging) {
                ctx.rotate(-Math.PI / 1.5);
            } else {
                ctx.rotate(0.3);
            }
            ctx.fillStyle = '#FFD700'; // Golden Bat
            ctx.fillRect(-5, 0, 10, 50);
            ctx.fillStyle = '#8B4513'; // Handle
            ctx.fillRect(-2, -15, 4, 15);
            ctx.restore();

            ctx.restore();
        };
        drawBatter(CRICKET_CONFIG.STUMPS_X + 40, CRICKET_CONFIG.STUMPS_Y + 10, state.isSwinging);

        // --- BOWLER (Snail) ---
        const drawBowler = (x: number, y: number) => {
            ctx.save();
            ctx.translate(x, y);
            
            // Snail Shell
            ctx.fillStyle = '#DEB887';
            ctx.beginPath();
            ctx.arc(0, 0, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Snail Body
            ctx.fillStyle = '#F5DEB3';
            ctx.beginPath();
            ctx.ellipse(12, 4, 10, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };
        drawBowler(CRICKET_CONFIG.BOWLER_X, CRICKET_CONFIG.BOWLER_Y - 30);

        // --- FIELDERS (Snails) ---
        const fielders = [
            { x: 150, y: 200 },
            { x: 450, y: 200 },
            { x: 100, y: 350 },
            { x: 500, y: 350 },
        ];
        fielders.forEach(f => drawBowler(f.x, f.y));

        // --- BALL ---
        if (state.ball.active) {
            // Ball Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(state.ball.x, state.ball.y + 10, 6, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ball Body
            ctx.fillStyle = '#ffffff'; // White ball
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- HIT FEEDBACK ---
        if (hitText) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${hitText.opacity})`;
            ctx.font = 'bold 48px Inter, system-ui';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(hitText.text, canvas.width / 2, 100);
            ctx.restore();
        }
    }, [state, hitText]);

    return (
        <div className={styles.container}>
            <div className={styles.gameWrapper}>
                <div className={styles.scoreBoard}>
                    <div className={styles.scoreValue}>{state.score}</div>
                    <div className={styles.wicketDisplay}>
                        {[...Array(3)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`${styles.wicketDot} ${i < state.wickets ? styles.wicketOut : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.canvasContainer} onClick={handleAction}>
                    <canvas ref={canvasRef} width={600} height={400} className={styles.canvas} />
                    
                    {state.status === 'idle' && (
                        <div className={styles.overlay}>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleAction}
                                className={styles.playButton}
                            >
                                <Play fill="currentColor" className="w-12 h-12 ml-1" />
                            </motion.button>
                        </div>
                    )}

                    {state.status === 'gameOver' && (
                        <div className={styles.overlay}>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className={styles.gameOverCard}
                            >
                                <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                                <h2 className={styles.gameOverTitle}>Match Over</h2>
                                <p className={styles.gameOverScore}>Score: <span>{state.score}</span></p>
                                <Button 
                                    size="lg" 
                                    onClick={(e) => { e.stopPropagation(); setState(createInitialState()); }} 
                                    className="rounded-full px-8 font-bold"
                                >
                                    <RotateCcw className="mr-2 h-5 w-5" /> REPLAY
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className={styles.controlsHelp}>
                    {state.status === 'bowling' ? (
                        <div className={styles.swingHint}>CLICK TO SWING!</div>
                    ) : (
                        <p className={styles.instructions}>Wait for the ball, then click to swing!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
