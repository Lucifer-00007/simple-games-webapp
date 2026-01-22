'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFeaturedGames, getCategoryInfo } from '@/lib/games-config';
import { Game } from '@/types/game';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

function GameCard({ game }: { game: Game }) {
    const category = getCategoryInfo(game.category);

    return (
        <motion.div variants={itemVariants} className="group">
            <Link href={`/games/${game.slug}`}>
                <Card className="overflow-hidden bg-card/50 backdrop-blur border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                    <div className="aspect-video relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                        {/* Placeholder gradient background - replace with actual thumbnails */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category?.color || 'from-gray-500 to-gray-700'} opacity-80`} />

                        {/* Game icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl opacity-50 group-hover:opacity-70 transition-opacity">
                                {category?.icon}
                            </span>
                        </div>

                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.1 }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                    <Play className="h-8 w-8 text-black fill-black ml-1" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {game.title}
                            </h3>
                            <Badge variant="secondary" className="shrink-0">
                                {category?.name}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {game.description}
                        </p>
                        <div className="flex items-center gap-1 mt-3">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`text-sm ${i < game.difficulty ? 'text-yellow-500' : 'text-muted-foreground/30'}`}
                                >
                                    ★
                                </span>
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">Difficulty</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

export function FeaturedGames() {
    const featuredGames = getFeaturedGames();

    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">
                            Featured <span className="text-primary">Games</span>
                        </h2>
                        <p className="text-muted-foreground">
                            Our most popular games, handpicked for you
                        </p>
                    </div>
                    <Link href="/games" className="hidden sm:block">
                        <Button variant="ghost" className="gap-2">
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Games Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {featuredGames.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </motion.div>

                {/* Mobile View All */}
                <div className="mt-8 text-center sm:hidden">
                    <Link href="/games">
                        <Button className="gap-2">
                            View All Games
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
