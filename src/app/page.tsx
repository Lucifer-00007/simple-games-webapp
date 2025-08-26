import { GameList } from '@/components/game-list';
import { Header } from '@/components/header';
import { GameCarousel } from '@/components/game-carousel';
import { Button } from '@/components/ui/button';
import type { Game, GithubContent } from '@/lib/types';
import { 
  GITHUB_REPO_API_URL, 
  GITHUB_GAMES_BASE_URL, 
  LOCAL_GAME_NAMES, 
  REVALIDATE_TIME, 
  EXCLUDED_GITHUB_DIRS, 
  PLACEHOLDER_THUMBNAIL_URL, 
  GAME_CATEGORIES,
  GITHUB_GAME_DESCRIPTION_PREFIX,
  GITHUB_GAME_DESCRIPTION_SUFFIX,
  GITHUB_THUMBNAIL_BASE_URL,
  GITHUB_THUMBNAIL_SUFFIX,
 } from '@/constants';

async function getGames(): Promise<Game[]> {
  const useGameLinks = process.env.NEXT_PUBLIC_USE_GAME_LINKS === 'true';

  if (useGameLinks) {
    try {
      const res = await fetch(GITHUB_REPO_API_URL, {
        next: { revalidate: REVALIDATE_TIME }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch repo contents: ${res.statusText}`);
      }
      const contents: GithubContent[] = await res.json();

      const games: Game[] = contents
        .filter(item => item.type === 'dir' && !EXCLUDED_GITHUB_DIRS.includes(item.name))
        .map(item => ({
          id: item.sha,
          name: item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `${GITHUB_GAME_DESCRIPTION_PREFIX}${item.name.replace(/-/g, ' ')}${GITHUB_GAME_DESCRIPTION_SUFFIX}`,
          thumbnailUrl: `${GITHUB_THUMBNAIL_BASE_URL}${item.name}${GITHUB_THUMBNAIL_SUFFIX}`,
          gameUrl: `${GITHUB_GAMES_BASE_URL}${item.name}/`
        }));

      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  } else {
    // Dynamically list games from src/app/games/
    const localGames = LOCAL_GAME_NAMES;

    return localGames.map(gameName => ({
      id: gameName,
      name: gameName.replace(/^\d{2}-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `A locally converted version of ${gameName.replace(/-/g, ' ')}.`,
      thumbnailUrl: PLACEHOLDER_THUMBNAIL_URL,
      gameUrl: `/games/${gameName}`,
    })) as Game[];
  }
}

export default async function Home() {
  const games = await getGames();
  const featuredGames = [...games].sort(() => 0.5 - Math.random()).slice(0, 5);
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
