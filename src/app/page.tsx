'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import type { Game } from '@/lib/types';
import { GAME_CATEGORIES } from '@/constants';
import React, { useEffect, useState } from 'react';
import { getGames } from '@/lib/games';
import { GameCarousel } from '@/components/game-carousel';
import { GameList } from '@/components/game-list';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      const allGames = await getGames();
      setGames(allGames);
      setFeaturedGames([...allGames].sort(() => 0.5 - Math.random()).slice(0, 5));
    };

    fetchGames();
  }, []);

  const categories = GAME_CATEGORIES;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter">
            GameVerse
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-4">
            Discover your next favorite browser game. Search our vast collection and get smart, AI-powered recommendations tailored just for you.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="text-3xl font-headline font-bold mb-8 text-center">Featured Games</h2>
          <GameCarousel games={featuredGames} />
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-headline font-bold mb-8 text-center">Popular Categories</h2>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {categories.map(category => (
              <Button
                key={category}
                variant="outline"
                size="lg"
                className="rounded-full text-foreground/80 border-border hover:border-primary hover:text-primary transition-colors duration-300"
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        <GameList allGames={games} />

      </main>
      <footer className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          Built with Next.js. Games from {process.env.NEXT_PUBLIC_USE_GAME_LINKS === 'true' ? (
            <a href="https://github.com/he-is-talha/html-css-javascript-games" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">this GitHub repository</a>
          ) : (
            <span>local app links</span>
          )}.
        </p>
      </footer>
    </div>
  );
}
