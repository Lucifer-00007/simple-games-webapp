'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { GAMES } from '@/lib/games-config';
import { Game, GameCategory } from '@/types/game';
import { GameGrid } from '@/components/games/game-grid';
import { CategoryFilter } from '@/components/games/category-filter';
import { SearchBar } from '@/components/games/search-bar';

export default function GamesPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<GameCategory | 'all'>('all');

    // Filter games
    const filteredGames = React.useMemo(() => {
        return GAMES.filter((game) => {
            const matchesSearch =
                game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'all' || game.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Gamepad2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Game Arcade</h1>
                            <p className="text-muted-foreground">
                                Discover and play {GAMES.length} fun mini-games
                            </p>
                        </div>
                    </div>
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4">
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>

                {/* Games Grid */}
                <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <GameGrid
                        games={filteredGames}
                        emptyMessage={
                            searchQuery
                                ? `No games found matching "${searchQuery}"`
                                : 'No games found in this category'
                        }
                    />
                </motion.div>
            </div>
        </div>
    );
}
