'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCategoryInfo, getGamesByCategory } from '@/lib/games-config';
import { getGameComponent, isGameImplemented } from '@/lib/games-registry';
import { GameCard } from '@/components/games/game-card';
import { Game } from '@/types/game';

interface GameClientPageProps {
    game: Game;
}

export function GameClientPage({ game }: GameClientPageProps) {
    const category = getCategoryInfo(game.category);
    const relatedGames = getGamesByCategory(game.category)
        .filter((g) => g.id !== game.id)
        .slice(0, 3);

    const gameComponent = getGameComponent(game.slug);
    const isImplemented = isGameImplemented(game.slug);

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link href="/games" className="inline-block mb-6">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Games
                    </Button>
                </Link>

                <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Game Title */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <h1 className="text-3xl font-bold">{game.title}</h1>
                                <Badge variant="outline" className="text-sm">
                                    {category?.icon} {category?.name}
                                </Badge>
                                {isImplemented && (
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                        ✓ Playable
                                    </Badge>
                                )}
                            </div>
                            <p className="text-lg text-muted-foreground">{game.description}</p>
                        </div>

                        {/* Game Container */}
                        <Card className="overflow-hidden">
                            {isImplemented && gameComponent ? (
                                <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                                    {React.createElement(gameComponent)}
                                </div>
                            ) : (
                                <div
                                    className={`aspect-video bg-gradient-to-br ${category?.color || 'from-gray-500 to-gray-700'} flex items-center justify-center relative`}
                                >
                                    <span className="text-9xl opacity-30">{category?.icon}</span>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Card className="bg-card/95 backdrop-blur border-border/50 max-w-md mx-4">
                                            <CardContent className="p-6 text-center">
                                                <Construction className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                                                <p className="text-muted-foreground">
                                                    The React version of {game.title} is being migrated. Check back soon!
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Controls */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">How to Play</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {game.controls.map((control, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="text-primary mt-1">•</span>
                                            {control}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Difficulty */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Difficulty</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < game.difficulty
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-muted-foreground/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {game.difficulty <= 2
                                        ? 'Easy - Great for beginners!'
                                        : game.difficulty <= 3
                                            ? 'Medium - A fair challenge'
                                            : 'Hard - For experienced players'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Related Games */}
                {relatedGames.length > 0 && (
                    <div className="mt-16">
                        <Separator className="mb-8" />
                        <h2 className="text-2xl font-bold mb-6">
                            More {category?.name} Games
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedGames.map((relatedGame, index) => (
                                <GameCard key={relatedGame.id} game={relatedGame} index={index} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
