'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createInitialState, spawnRow, updateTiles, tapTile } from './game-logic';
import { GameState, PIANO_CONFIG } from './types';
import styles from './styles.module.css';

export function PianoTiles({ onScoreUpdate }: { onScoreUpdate?: (score: number) => void }) {
    const [state, setState] = React.useState<GameState>(createInitialState());
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleStart = () => {
        setState({ ...createInitialState(), status: 'playing' });
    };

    const handleTap = (tileId: number) => {
        setState(prev => tapTile(prev, tileId));
    };

    const handleMiss = (e: React.MouseEvent) => {
        if (state.status === 'playing' && e.target === e.currentTarget) {
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
                        <span className={styles.scoreValue}>{state.score}</span>
                    </div>

                    <div className={styles.gameArea} ref={containerRef} onClick={handleMiss}>
                        {/* Columns/Grid Lines */}
                        {Array.from({ length: PIANO_CONFIG.COLS }).map((_, i) => (
                            <div key={i} className={styles.columnLine} style={{ left: `${(i / PIANO_CONFIG.COLS) * 100}%` }} />
                        ))}

                        {/* Tiles */}
                        {state.tiles.map(tile => (
                            <div
                                key={tile.id}
                                className={`${styles.tile} ${tile.status === 'tapped' ? styles.tapped : ''}`}
                                style={{
                                    left: `${(tile.col / PIANO_CONFIG.COLS) * 100}%`,
                                    top: `${(tile.row / PIANO_CONFIG.ROWS) * 100}%`,
                                    width: `${100 / PIANO_CONFIG.COLS}%`,
                                    height: `${100 / PIANO_CONFIG.ROWS}%`,
                                }}
                                onMouseDown={() => handleTap(tile.id)}
                            />
                        ))}

                        {state.status !== 'playing' && (
                            <div className={styles.overlay}>
                                <h2 className={styles.overlayTitle}>
                                    {state.status === 'gameOver' ? 'Game Over' : 'Piano Tiles'}
                                </h2>
                                <Button onClick={handleStart} size="lg" className={styles.startButton}>
                                    {state.status === 'gameOver' ? <RotateCcw className="mr-2" /> : <Play className="mr-2" />}
                                    {state.status === 'gameOver' ? 'Try Again' : 'Start Game'}
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <p className={styles.instructions}>Tap only the black tiles as they fall!</p>
                </CardContent>
            </Card>
        </div>
    );
}
