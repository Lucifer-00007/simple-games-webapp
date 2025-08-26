import type { Game, GithubContent } from '@/lib/types';
import { 
  GITHUB_REPO_API_URL, 
  GITHUB_GAMES_BASE_URL, 
  LOCAL_GAME_NAMES, 
  REVALIDATE_TIME, 
  EXCLUDED_GITHUB_DIRS, 
  PLACEHOLDER_THUMBNAIL_URL, 
  GITHUB_GAME_DESCRIPTION_PREFIX,
  GITHUB_GAME_DESCRIPTION_SUFFIX,
  GITHUB_THUMBNAIL_BASE_URL,
  GITHUB_THUMBNAIL_SUFFIX,
 } from '@/constants';

export async function getGames(): Promise<Game[]> {
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
      gameUrl: `/games/${gameName.replace(/^\d{2}-/, '').toLowerCase().replace(/-/g, '')}`,
    })) as Game[];
  }
}
