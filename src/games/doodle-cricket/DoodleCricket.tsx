'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, startNewBall, updateCricket } from './game-logic';
import { GameState, CRICKET_CONFIG } from './types';
import styles from './styles.module.css';

export function DoodleCricket({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [state, setState] = React.useState<GameState>(createInitialState());
    const [bestScore, setBestScore] = React.useState(0);
    const [hitText, setHitText] = React.useState<{ text: string; x: number; y: number; opacity: number } | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const requestRef = React.useRef<number>(0);

    // Load best score
    React.useEffect(() => {
        const saved = localStorage.getItem('doodle-cricket-best');
        if (saved) setBestScore(parseInt(saved, 10));
    }, []);

    // Update best score
    React.useEffect(() => {
        if (state.score > bestScore) {
            setBestScore(state.score);
            localStorage.setItem('doodle-cricket-best', state.score.toString());
        }
    }, [state.score]);

    const handleAction = () => {
        if (state.status === 'idle') {
            setState(prev => startNewBall(prev));
        } else if (state.status === 'bowling' && !state.isSwinging) {
            setState(prev => ({ ...prev, isSwinging: true, lastSwingTime: Date.now() }));
            // Reset swinging state after a short delay
            setTimeout(() => {
                setState(prev => ({ ...prev, isSwinging: false }));
            }, 300);
        } else if (state.status === 'gameOver') {
            setState(createInitialState());
        }
    };

    // Effect to handle hit feedback when score changes
    const lastScore = React.useRef(state.score);
    const lastWickets = React.useRef(state.wickets);

    React.useEffect(() => {
        if (state.score > lastScore.current) {
            const runs = state.score - lastScore.current;
            setHitText({ text: runs === 6 ? 'SIX!' : runs === 4 ? 'FOUR!' : `+${runs}`, x: 300, y: 100, opacity: 1 });
            setTimeout(() => setHitText(null), 1000);
        }
        if (state.wickets > lastWickets.current) {
            setHitText({ text: 'OUT!', x: 300, y: 100, opacity: 1 });
            setTimeout(() => setHitText(null), 1000);
        }
        lastScore.current = state.score;
        lastWickets.current = state.wickets;
    }, [state.score, state.wickets]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.status, state.isSwinging]);

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

        // --- BACKGROUND ---
        // Sky gradient (light blue at top to slightly lighter at horizon)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 170);
        skyGradient.addColorStop(0, '#4fb8e8');
        skyGradient.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, 170);

        // --- CLOUDS ---
        const drawCloud = (x: number, y: number, scale: number = 1) => {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
            ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
            ctx.arc(x + 60 * scale, y, 25 * scale, 0, Math.PI * 2);
            ctx.arc(x + 30 * scale, y + 5 * scale, 20 * scale, 0, Math.PI * 2);
            ctx.fill();
        };
        drawCloud(80, 50, 0.8);
        drawCloud(450, 40, 1);

        // --- SCOREBOARD TOWER ---
        // Tower structure (behind pitch)
        ctx.fillStyle = '#8ba88b';
        ctx.fillRect(265, 60, 70, 80);
        // Tower frame lines
        ctx.strokeStyle = '#5a7a5a';
        ctx.lineWidth = 2;
        // Vertical supports
        ctx.beginPath();
        ctx.moveTo(275, 140); ctx.lineTo(260, 170);
        ctx.moveTo(325, 140); ctx.lineTo(340, 170);
        ctx.stroke();
        // Cross beams
        ctx.beginPath();
        ctx.moveTo(265, 100); ctx.lineTo(335, 100);
        ctx.moveTo(265, 120); ctx.lineTo(335, 120);
        ctx.stroke();
        // Scoreboard display
        ctx.fillStyle = '#2c4a7c';
        ctx.fillRect(275, 70, 50, 50);
        ctx.strokeStyle = '#1a3050';
        ctx.lineWidth = 2;
        ctx.strokeRect(275, 70, 50, 50);
        // Trophy on top
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(300, 55); ctx.lineTo(290, 68); ctx.lineTo(310, 68);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(296, 50, 8, 8);

        // --- WHEAT DECORATIONS (along the top) ---
        const drawWheat = (x: number, y: number) => {
            ctx.strokeStyle = '#d4a24c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y); ctx.lineTo(x, y - 20);
            ctx.stroke();
            // Wheat grains
            ctx.fillStyle = '#e8c55a';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.ellipse(x - 3, y - 5 - (i * 4), 3, 2, -0.3, 0, Math.PI * 2);
                ctx.ellipse(x + 3, y - 5 - (i * 4), 3, 2, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        for (let x = 20; x < canvas.width; x += 35) {
            if (x < 240 || x > 360) { // Skip area behind scoreboard
                drawWheat(x, 140);
            }
        }

        // --- STADIUM CROWD ---
        // Stadium wall (brown/tan barrier)
        ctx.fillStyle = '#c4a35a';
        ctx.fillRect(0, 145, canvas.width, 25);
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 145, canvas.width, 25);

        // Crowd rows with colorful bugs
        const bugColors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
        const drawBugHead = (x: number, y: number, color: string, scale: number = 1) => {
            // Body
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(x, y, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x - 2 * scale, y - 2 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.arc(x + 2 * scale, y - 2 * scale, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x - 2 * scale, y - 2 * scale, 1 * scale, 0, Math.PI * 2);
            ctx.arc(x + 2 * scale, y - 2 * scale, 1 * scale, 0, Math.PI * 2);
            ctx.fill();
        };
        // Front row (larger bugs)
        for (let x = 10; x < canvas.width; x += 20) {
            if (x < 240 || x > 360) {
                const color = bugColors[Math.floor(x / 20) % bugColors.length];
                drawBugHead(x + (x % 7), 158, color, 0.9);
            }
        }
        // Back row (smaller/partial bugs)
        for (let x = 20; x < canvas.width; x += 25) {
            if (x < 230 || x > 370) {
                const color = bugColors[(Math.floor(x / 25) + 3) % bugColors.length];
                drawBugHead(x + (x % 5), 149, color, 0.6);
            }
        }

        // Grass with horizontal stripes
        const stripeHeight = 25;
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#679f1f' : '#5e911c';
            ctx.fillRect(0, 170 + (i * stripeHeight), canvas.width, stripeHeight);
        }

        // Pitch (Perspective Trapezoid)
        ctx.fillStyle = '#d4c4a8';
        ctx.beginPath();
        ctx.moveTo(275, 170);
        ctx.lineTo(325, 170);
        ctx.lineTo(540, 420);
        ctx.lineTo(60, 420);
        ctx.closePath();
        ctx.fill();

        // Pitch border
        ctx.strokeStyle = '#a0927a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // White Pitch Lines (creases)
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        // Top crease
        ctx.beginPath();
        ctx.moveTo(282, 195); ctx.lineTo(318, 195);
        ctx.stroke();
        // Bottom crease
        ctx.beginPath();
        ctx.moveTo(140, 385); ctx.lineTo(460, 385);
        ctx.stroke();

        // --- STUMPS ---
        const drawStumps = (x: number, y: number, scale: number = 1) => {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x + i * (7 * scale), y, 3 * scale, 38 * scale);
            }
            // Bails
            ctx.fillRect(x - 2, y, 18 * scale, 3 * scale);
            ctx.shadowBlur = 0;
        };
        drawStumps(CRICKET_CONFIG.STUMPS_X - 8, CRICKET_CONFIG.STUMPS_Y, 1.2);

        // --- BATTER (Cricket) ---
        const drawBatter = (x: number, y: number, isSwinging: boolean) => {
            ctx.save();
            ctx.translate(x, y);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(0, 35, 30, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Legs (Thin and jointed)
            ctx.strokeStyle = '#14532d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, 5); ctx.lineTo(-20, 35);
            ctx.moveTo(10, 5); ctx.lineTo(20, 35);
            ctx.stroke();

            // Body (Pear shaped)
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.moveTo(-15, 10);
            ctx.quadraticCurveTo(-20, -10, 0, -25);
            ctx.quadraticCurveTo(20, -10, 15, 10);
            ctx.closePath();
            ctx.fill();

            // Head
            ctx.beginPath();
            ctx.arc(0, -50, 16, 0, Math.PI * 2);
            ctx.fill();

            // Eyes (Large white circles with black pupils)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-7, -53, 7, 0, Math.PI * 2);
            ctx.arc(7, -53, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(-7, -53, 3, 0, Math.PI * 2);
            ctx.arc(7, -53, 3, 0, Math.PI * 2);
            ctx.fill();

            // Antennae
            ctx.strokeStyle = '#14532d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-5, -65); ctx.lineTo(-25, -85);
            ctx.moveTo(5, -65); ctx.lineTo(25, -85);
            ctx.stroke();

            // Bat
            ctx.save();
            ctx.translate(0, 0);
            if (isSwinging) {
                ctx.rotate(-Math.PI / 1.4);
            } else {
                ctx.rotate(0.7);
            }
            // Bat blade
            ctx.fillStyle = '#fde047';
            ctx.fillRect(-10, 0, 20, 65);
            // Bat handle
            ctx.fillStyle = '#854d0e';
            ctx.fillRect(-3, -25, 6, 25);
            ctx.restore();

            ctx.restore();
        };
        drawBatter(CRICKET_CONFIG.STUMPS_X + 60, CRICKET_CONFIG.STUMPS_Y + 15, state.isSwinging);

        // --- BOWLER/FIELDERS (Snail) ---
        const drawSnail = (x: number, y: number) => {
            ctx.save();
            ctx.translate(x, y);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(5, 12, 18, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Shell
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Shell spiral
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI);
            ctx.stroke();

            // Body
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.ellipse(18, 6, 18, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eyes on stalks
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(25, 0); ctx.lineTo(28, -15);
            ctx.moveTo(30, 0); ctx.lineTo(33, -15);
            ctx.stroke();
            // Eye dots
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(28, -15, 2, 0, Math.PI * 2);
            ctx.arc(33, -15, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };
        drawSnail(CRICKET_CONFIG.BOWLER_X, CRICKET_CONFIG.BOWLER_Y - 30);

        // Fielders (more snails around the field)
        const fielders = [
            { x: 80, y: 220 }, { x: 520, y: 220 },
            { x: 50, y: 300 }, { x: 550, y: 300 },
            { x: 70, y: 360 }, { x: 530, y: 360 },
            { x: 150, y: 260 }, { x: 450, y: 260 },
            { x: 40, y: 380 }, { x: 560, y: 380 }
        ];
        fielders.forEach(f => drawSnail(f.x, f.y));

        // --- BALL ---
        if (state.ball.active) {
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(state.ball.x, state.ball.y + 12, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // --- HIT FEEDBACK ---
        if (hitText) {
            ctx.save();
            ctx.fillStyle = '#fde047';
            ctx.strokeStyle = '#854d0e';
            ctx.lineWidth = 8;
            ctx.font = 'bold 84px Inter, system-ui';
            ctx.textAlign = 'center';
            ctx.lineJoin = 'round';
            ctx.strokeText(hitText.text, canvas.width / 2, 120);
            ctx.fillText(hitText.text, canvas.width / 2, 120);
            ctx.restore();
        }
    }, [state, hitText, bestScore]);



    return (
        <div className={styles.container}>
            <div className={styles.gameWrapper}>
                <div className={styles.scoreBoard}>
                    <Trophy className={styles.trophyIcon} size={28} />
                    <div className={styles.scoreRow}>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>SCORE</span>
                            <div className={styles.scoreValue}>{state.score}</div>
                        </div>
                        <div className={styles.scoreDivider} />
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreLabel}>BEST</span>
                            <div className={styles.scoreValueSmall}>{bestScore}</div>
                        </div>
                    </div>
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
                                <Trophy className="w-16 h-16 text-yellow-500 mb-2" />
                                <h2 className={styles.gameOverTitle}>Match Over</h2>
                                <div className={styles.gameOverScores}>
                                    <p className={styles.gameOverScore}>SCORE: <span>{state.score}</span></p>
                                    <p className={styles.gameOverScore}>BEST: <span>{bestScore}</span></p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={(e) => { e.stopPropagation(); setState(createInitialState()); }}
                                    className="rounded-full px-12 py-8 text-xl font-black bg-[#fde047] hover:bg-[#facc15] text-[#854d0e] border-4 border-white shadow-[0_6px_0px_0px_#ca8a04]"
                                >
                                    <RotateCcw className="mr-3 h-6 w-6 stroke-[3px]" /> REPLAY
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </div>

                <div className={styles.controlsHelp}>
                    {state.status === 'bowling' ? (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAction}
                            className={styles.swingButton}
                        >
                            <Hand />
                        </motion.button>
                    ) : state.status === 'idle' ? (
                        <p className={styles.instructions}>Click to start, then swing!</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

