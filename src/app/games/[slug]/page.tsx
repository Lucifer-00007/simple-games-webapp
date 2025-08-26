import { promises as fs } from 'fs';
import path from 'path';
import  GameClient  from './game-client';

// Generate static params for all game slugs at build time
export async function generateStaticParams() {
  const gameDirectory = path.resolve(process.cwd(), 'public/games');
  const dirents = await fs.readdir(gameDirectory, { withFileTypes: true });
  const gameFolders = dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  return gameFolders.map(folder => {
    const folderSlug = folder.replace(/^\d{2}-/, '').toLowerCase().replace(/-/g, '');
    return { slug: folderSlug };
  });
}

export default function GamePage({ params }: { params: { slug: string } }) {
  return <GameClient slug={params.slug} />;
}