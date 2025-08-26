'use client';

import { useState, useMemo, useEffect, useCallback, useTransition } from 'react';
import { Search, BrainCircuit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import GameCard from '@/components/game-card';
import { Skeleton } from '@/components/ui/skeleton';
// import { getRecommendationsAction } from '@/app/actions'; // Disabled for static export
import type { Game } from '@/lib/types';

const debounce = <F extends (...args: any[]) => void>(func: F, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export function GameList({ allGames }: { allGames: Game[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const storedHistory = localStorage.getItem('gameSearchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleGetRecommendations = async (history: string[]) => {
    if (history.length === 0) return;
    
    // AI recommendations disabled for static export compatibility
    // startTransition(async () => {
    //     const recs = await getRecommendationsAction(history);
    //     const recommendedGameNames = allGames
    //       .filter(game => recs.some(recName => game.name.toLowerCase().includes(recName.toLowerCase())))
    //       .map(game => game.name);
    //     setRecommendations(Array.from(new Set(recommendedGameNames)));
    // });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetRecommendations = useCallback(debounce(handleGetRecommendations, 750), [allGames]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 2) {
      const newHistory = [...new Set([query.trim(), ...searchHistory])].slice(0, 10); // Keep last 10 unique searches
      setSearchHistory(newHistory);
      localStorage.setItem('gameSearchHistory', JSON.stringify(newHistory));
      debouncedGetRecommendations(newHistory);
    } else {
        setRecommendations([]);
    }
  };

  const filteredGames = useMemo(() => {
    if (!searchQuery) {
      return allGames;
    }
    return allGames.filter(game =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allGames]);

  const recommendedGameObjects = useMemo(() => {
    // Return games that are in recommendations but not in filteredGames (if there's a search)
    const games = allGames.filter(game => recommendations.includes(game.name));
    if (searchQuery) {
        return games.filter(game => !filteredGames.map(g => g.id).includes(game.id)).slice(0, 4);
    }
    return games.slice(0, 4);

  }, [recommendations, allGames, searchQuery, filteredGames]);

  return (
    <div>
      <div className="relative mb-12 max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search e.g. 'puzzle', 'snake', 'card'..."
          className="w-full pl-12 pr-4 py-6 text-lg rounded-full focus:ring-primary/50"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      {(isPending || (recommendations.length > 0 && recommendedGameObjects.length > 0)) && (
        <div className="mb-16">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-headline font-bold inline-flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-primary" />
                    <span>Recommended For You</span>
                </h2>
                <p className="text-muted-foreground mt-1">Based on your recent searches</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isPending ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
              ) : (
                recommendedGameObjects.map(game => (
                    <GameCard key={game.id} game={game} />
                ))
              )}
            </div>
             <hr className="my-16" />
        </div>
      )}

      <div>
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">{searchQuery ? 'Search Results' : 'All Games'}</h2>
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-card rounded-xl border">
            <p className="text-3xl font-bold text-foreground">No games found for "{searchQuery}"</p>
            <p className="text-muted-foreground mt-2 text-lg">Try searching for something else!</p>
          </div>
        )}
      </div>
    </div>
  );
}
