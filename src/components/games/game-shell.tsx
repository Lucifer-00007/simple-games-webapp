'use client';

import * as React from 'react';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Pause,
    Play,
    RotateCcw,
    Info,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Game } from '@/types/game';

interface GameShellProps {
    game: Game;
    children: ReactNode;
    onRestart?: () => void;
}

export function GameShell({ game, children, onRestart }: GameShellProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            await containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative bg-background">
            {/* Game Container */}
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
                {/* Game Controls */}
                <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
                    <h2 className="font-semibold">{game.title}</h2>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowInfo(!showInfo)}
                        >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Game info</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle sound</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsPaused(!isPaused)}
                        >
                            {isPaused ? (
                                <Play className="h-4 w-4" />
                            ) : (
                                <Pause className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle pause</span>
                        </Button>
                        {onRestart && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onRestart}
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">Restart game</span>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4" />
                            ) : (
                                <Maximize className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle fullscreen</span>
                        </Button>
                    </div>
                </div>

                {/* Game Content */}
                <div className="relative aspect-[4/3] sm:aspect-video bg-black">
                    {children}

                    {/* Pause Overlay */}
                    <AnimatePresence>
                        {isPaused && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                            >
                                <div className="text-center">
                                    <Pause className="h-16 w-16 mx-auto mb-4 text-white" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Paused</h3>
                                    <Button onClick={() => setIsPaused(false)}>Resume</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>

            {/* Info Panel */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-0 right-0 mt-16 mr-4 z-10"
                    >
                        <Card className="w-72 p-4 bg-card/95 backdrop-blur">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">How to Play</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setShowInfo(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {game.controls.map((control, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        {control}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
