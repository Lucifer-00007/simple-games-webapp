'use client';

import * as React from 'react';
import { notFound } from 'next/navigation';
import { Game } from '@/types/game';
import { getGameComponent } from '@/lib/games-registry';
import { GameShell } from '@/components/games/game-shell';

interface GameClientPageProps {
    game: Game;
}

export function GameClientPage({ game }: GameClientPageProps) {
    // Dynamically load the game component
    const GameComponent = getGameComponent(game.slug);

    if (!GameComponent) {
        // Fallback if registry is missing the game but config has it
        // This shouldn't happen if maintained correctly
        return (
            <div className="container py-24 text-center">
                <h2 className="text-2xl font-bold mb-4">Game Component Not Found</h2>
                <p className="text-muted-foreground">
                    The game "{game.title}" is listed but not yet implemented.
                </p>
            </div>
        );
    }

    return (
        <div className="container py-8 px-4 md:px-6 max-w-5xl mx-auto">
            <GameShell game={game}>
                <GameComponent />
            </GameShell>
            
            {/* Game Description / Footer Content */}
            <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold">About {game.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {game.description}
                    </p>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="font-semibold mb-3">Game Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <span className="capitalize font-medium">{game.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Difficulty</span>
                                <span className="text-yellow-500">{'★'.repeat(game.difficulty)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
