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
    'number-guessing': dynamic(() => import('@/games/number-guessing').then((mod) => mod.NumberGuessing), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'snake': dynamic(() => import('@/games/snake').then((mod) => mod.Snake), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    '2048': dynamic(() => import('@/games/2048').then((mod) => mod.Game2048), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'connect-four': dynamic(() => import('@/games/connect-four').then((mod) => mod.ConnectFour), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'hangman': dynamic(() => import('@/games/hangman').then((mod) => mod.Hangman), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'quiz': dynamic(() => import('@/games/quiz').then((mod) => mod.Quiz), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'whack-a-mole': dynamic(() => import('@/games/whack-a-mole').then((mod) => mod.WhackAMole), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'simon-says': dynamic(() => import('@/games/simon-says').then((mod) => mod.SimonSays), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'emoji-catcher': dynamic(() => import('@/games/emoji-catcher').then((mod) => mod.EmojiCatcher), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'insect-catch': dynamic(() => import('@/games/insect-catch').then((mod) => mod.InsectCatch), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'shape-clicker': dynamic(() => import('@/games/shape-clicker').then((mod) => mod.ShapeClicker), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'minesweeper': dynamic(() => import('@/games/minesweeper').then((mod) => mod.Minesweeper), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'speed-typing': dynamic(() => import('@/games/speed-typing').then((mod) => mod.SpeedTyping), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'tetris': dynamic(() => import('@/games/tetris').then((mod) => mod.Tetris), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'candy-crush': dynamic(() => import('@/games/candy-crush').then((mod) => mod.CandyCrush), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'breakout': dynamic(() => import('@/games/breakout').then((mod) => mod.Breakout), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'ping-pong': dynamic(() => import('@/games/ping-pong').then((mod) => mod.PingPong), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'flappy-bird': dynamic(() => import('@/games/flappy-bird').then((mod) => mod.FlappyBird), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'fruit-slicer': dynamic(() => import('@/games/fruit-slicer').then((mod) => mod.FruitSlicer), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'archery': dynamic(() => import('@/games/archery').then((mod) => mod.Archery), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'tower-blocks': dynamic(() => import('@/games/tower-blocks').then((mod) => mod.TowerBlocks), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'crossy-road': dynamic(() => import('@/games/crossy-road').then((mod) => mod.CrossyRoad), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'tilting-maze': dynamic(() => import('@/games/tilting-maze').then((mod) => mod.TiltingMaze), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'typing-game-alt': dynamic(() => import('@/games/typing-game-alt').then((mod) => mod.TypingGameAlt), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'chess': dynamic(() => import('@/games/chess/Chess').then((mod) => mod.Chess), {
        loading: () => <GameLoadingPlaceholder />,
    }),
    'car-racing': dynamic(() => import('@/games/car-racing').then((mod) => mod.CarRacing), {
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
