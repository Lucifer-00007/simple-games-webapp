'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCategoryInfo } from '@/lib/games-config';
import { Game } from '@/types/game';

interface GameCardProps {
    game: Game;
    index?: number;
}

export function GameCard({ game, index = 0 }: GameCardProps) {
    const category = getCategoryInfo(game.category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/games/${game.slug}`}>
                <Card className="h-full overflow-hidden bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className="aspect-video relative bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${category?.color || 'from-gray-500 to-gray-700'} opacity-80`}
                        />

                        {/* Category icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-300">
                                {category?.icon}
                            </span>
                        </div>

                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                            <motion.div
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1.1 }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                    <Play className="h-6 w-6 text-black fill-black ml-1" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Difficulty badge */}
                        <div className="absolute top-3 right-3">
                            <Badge
                                variant="secondary"
                                className="bg-black/50 backdrop-blur text-white border-0"
                            >
                                {'★'.repeat(game.difficulty)}
                            </Badge>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {game.title}
                            </h3>
                            <Badge
                                variant="outline"
                                className="shrink-0"
                                style={{
                                    borderColor: category?.color.includes('purple')
                                        ? 'rgb(168 85 247)'
                                        : undefined,
                                }}
                            >
                                {category?.icon} {category?.name}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {game.description}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
