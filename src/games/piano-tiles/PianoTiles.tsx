'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, spawnRow, updateTiles, tapTile } from './game-logic';
import { GameState, PIANO_CONFIG } from './types';
import styles from './styles.module.css';

export function PianoTiles({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [state, setState] = React.useState<GameState>(createInitialState());
    const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleStart = () => {
        setState({ ...createInitialState(), status: 'playing' });
    };

    const addRipple = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples(prev => [...prev, { id, x, y }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    };

    const handleTap = (e: React.MouseEvent, tileId: number) => {
        e.stopPropagation();
        addRipple(e);
        setState(prev => tapTile(prev, tileId));
    };

    const handleMiss = (e: React.MouseEvent) => {
        if (state.status === 'playing') {
            addRipple(e);
            setState(prev => ({ ...prev, status: 'gameOver' }));
        }
    };

    React.useEffect(() => {
        if (state.status !== 'playing') return;

        const interval = setInterval(() => {
            setState(prev => {
                let s = updateTiles(prev);
                if (Date.now() - s.lastRowTime > (PIANO_CONFIG.TILE_SPAWN_INTERVAL / (s.speed / 3))) {
                    s = spawnRow(s);
                }
                if (prev.status === 'playing' && s.status === 'gameOver') {
                    onScoreUpdate?.(s.score);
                }
                return s;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [state.status, onScoreUpdate]);

    return (
        <div className={styles.container}>
            <Card className={styles.gameCard}>
                <CardContent className={styles.cardContent}>
                    <div className={styles.scoreBoard}>
                        <motion.span 
                            key={state.score}
                            initial={{ scale: 1.2, color: 'var(--primary)' }}
                            animate={{ scale: 1, color: 'var(--primary)' }}
                            className={styles.scoreValue}
                        >
                            {state.score}
                        </motion.span>
                    </div>

                    <div className={styles.gameArea} ref={containerRef} onMouseDown={handleMiss}>
                        {/* Ripple Effects */}
                        <AnimatePresence>
                            {ripples.map(ripple => (
                                <motion.div
                                    key={ripple.id}
                                    initial={{ scale: 0, opacity: 0.5 }}
                                    animate={{ scale: 4, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={styles.ripple}
                                    style={{ left: ripple.x, top: ripple.y }}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Columns/Grid Lines */}
                        {Array.from({ length: PIANO_CONFIG.COLS }).map((_, i) => (
                            <div key={i} className={styles.columnLine} style={{ left: `${(i / PIANO_CONFIG.COLS) * 100}%` }} />
                        ))}

                        {/* Tiles */}
                        {state.tiles.map(tile => (
                            <motion.div
                                key={tile.id}
                                initial={false}
                                animate={{
                                    backgroundColor: tile.status === 'tapped' ? 'rgba(0,0,0,0.1)' : 'var(--tile-bg)',
                                }}
                                className={`${styles.tile} ${tile.status === 'tapped' ? styles.tapped : ''}`}
                                style={{
                                    left: `${(tile.col / PIANO_CONFIG.COLS) * 100}%`,
                                    top: `${(tile.row / PIANO_CONFIG.ROWS) * 100}%`,
                                    width: `${100 / PIANO_CONFIG.COLS}%`,
                                    height: `${100 / PIANO_CONFIG.ROWS}%`,
                                }}
                                onMouseDown={(e) => handleTap(e, tile.id)}
                            />
                        ))}

                        {state.status !== 'playing' && (
                            <div className={styles.overlay}>
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-card p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 border border-border"
                                >
                                    <div className="p-4 rounded-full bg-primary/10">
                                        <Music className="w-12 h-12 text-primary" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h2 className={styles.overlayTitle}>
                                            {state.status === 'gameOver' ? 'Game Over' : 'Piano Tiles'}
                                        </h2>
                                        {state.status === 'gameOver' && (
                                            <p className="text-muted-foreground font-medium">Final Score: {state.score}</p>
                                        )}
                                    </div>
                                    <Button onClick={handleStart} size="lg" className="w-full font-bold h-12">
                                        {state.status === 'gameOver' ? <RotateCcw className="mr-2" /> : <Play className="mr-2" />}
                                        {state.status === 'gameOver' ? 'Try Again' : 'Start Game'}
                                    </Button>
                                </motion.div>
                            </div>
                        )}
                    </div>
                    
                    <p className={styles.instructions}>Tap only the black tiles as they fall!</p>
                </CardContent>
            </Card>
        </div>
    );
}
