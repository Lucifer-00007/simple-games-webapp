'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GameGrid } from '@/components/games/game-grid';
import { CategoryFilter } from '@/components/games/category-filter';
import { SearchBar } from '@/components/games/search-bar';
import { GAMES, getGamesByCategory, searchGames } from '@/lib/games-config';
import { GameCategory } from '@/types/game';

export default function GamesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryParam = searchParams.get('category') as GameCategory | null;
    const searchParam = searchParams.get('search') || '';

    const [search, setSearch] = React.useState(searchParam);
    const [category, setCategory] = React.useState<GameCategory | 'all'>(
        categoryParam || 'all'
    );

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = React.useState(search);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Update URL when filters change
    React.useEffect(() => {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (debouncedSearch) params.set('search', debouncedSearch);

        const queryString = params.toString();
        router.replace(`/games${queryString ? `?${queryString}` : ''}`, {
            scroll: false,
        });
    }, [category, debouncedSearch, router]);

    // Filter games
    const filteredGames = React.useMemo(() => {
        let games = category === 'all' ? GAMES : getGamesByCategory(category);

        if (debouncedSearch) {
            const searchResults = searchGames(debouncedSearch);
            games = games.filter((g) => searchResults.some((s) => s.id === g.id));
        }

        return games;
    }, [category, debouncedSearch]);

    const handleCategoryChange = (newCategory: GameCategory | 'all') => {
        setCategory(newCategory);
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        All <span className="text-primary">Games</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Browse our collection of {GAMES.length} games
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                    <SearchBar value={search} onChange={setSearch} />
                    <CategoryFilter
                        selectedCategory={category}
                        onCategoryChange={handleCategoryChange}
                    />
                </motion.div>

                {/* Results count */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-muted-foreground mb-6"
                >
                    {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}{' '}
                    found
                    {category !== 'all' && ` in ${category}`}
                    {debouncedSearch && ` matching "${debouncedSearch}"`}
                </motion.p>

                {/* Games Grid */}
                <GameGrid
                    games={filteredGames}
                    emptyMessage="Try adjusting your search or filters"
                />
            </div>
        </div>
    );
}
