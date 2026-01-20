// Games registry - maps game slugs to their React components
// This allows dynamic loading of game components

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

export interface GameComponentProps {
    onScoreUpdate?: (score: number) => void;
    onRestart?: () => void;
}

// Lazy load game components to reduce initial bundle size
const gameComponents: Record<string, ComponentType<GameComponentProps>> = {
    'tic-tac-toe': dynamic(() => import('@/games/tic-tac-toe').then((mod) => mod.TicTacToe), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'rock-paper-scissors': dynamic(() => import('@/games/rock-paper-scissors').then((mod) => mod.RockPaperScissors), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'dice-roll': dynamic(() => import('@/games/dice-roll').then((mod) => mod.DiceRoll), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'memory-card': dynamic(() => import('@/games/memory-card').then((mod) => mod.MemoryCard), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    // Add more games here as they are implemented
};

function GameLoadingPlaceholder() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading game...</div>
        </div>
    );
}

export function getGameComponent(slug: string): ComponentType<GameComponentProps> | null {
    return gameComponents[slug] || null;
}

export function isGameImplemented(slug: string): boolean {
    return slug in gameComponents;
}

export function getImplementedGameSlugs(): string[] {
    return Object.keys(gameComponents);
}
