'use client';

import { motion } from 'framer-motion';
import { GameCard } from './game-card';
import { Game } from '@/types/game';
import { Frown } from 'lucide-react';

interface GameGridProps {
    games: Game[];
    emptyMessage?: string;
}

export function GameGrid({ games, emptyMessage = 'No games found' }: GameGridProps) {
    if (games.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
            >
                <Frown className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No games found</h3>
                <p className="text-muted-foreground">{emptyMessage}</p>
            </motion.div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
            ))}
        </div>
    );
}
