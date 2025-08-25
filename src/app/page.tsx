import { GameList } from '@/components/game-list';
import { Header } from '@/components/header';
import { GameCarousel } from '@/components/game-carousel';
import { Button } from '@/components/ui/button';
import type { Game, GithubContent } from '@/lib/types';

async function getGames(): Promise<Game[]> {
  try {
    const res = await fetch('https://api.github.com/repos/he-is-talha/html-css-javascript-games/contents/', {
      next: { revalidate: 3600 } // Revalidate once per hour
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch repo contents: ${res.statusText}`);
    }
    const contents: GithubContent[] = await res.json();
    
    const games: Game[] = contents
      .filter(item => item.type === 'dir' && !['.github', 'assets'].includes(item.name))
      .map(item => ({
        id: item.sha,
        name: item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `An interactive browser game: ${item.name.replace(/-/g, ' ')}.`,
        thumbnailUrl: `https://raw.githubusercontent.com/he-is-talha/html-css-javascript-games/master/${item.name}/preview.png`,
        gameUrl: `https://he-is-talha.github.io/html-css-javascript-games/${item.name}/`
      }));

    return games;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

export default async function Home() {
  const games = await getGames();
  const featuredGames = [...games].sort(() => 0.5 - Math.random()).slice(0, 5);
  const categories = ['Puzzle', 'Arcade', 'Strategy', 'Card', 'Action', '2D'];

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
          Built with Next.js. Games from <a href="https://github.com/he-is-talha/html-css-javascript-games" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">this GitHub repository</a>.
        </p>
      </footer>
    </div>
  );
}
