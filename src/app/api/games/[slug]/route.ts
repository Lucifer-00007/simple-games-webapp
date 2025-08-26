
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const gameDirectory = path.resolve(process.cwd(), 'public/games');

async function getGameFolders() {
  const dirents = await fs.readdir(gameDirectory, { withFileTypes: true });
  return dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const gameFolders = await getGameFolders();
  const gameFolder = gameFolders.find(folder => {
    const folderSlug = folder.replace(/^\d{2}-/, '').toLowerCase().replace(/-/g, '');
    return folderSlug === slug;
  });

  if (gameFolder) {
    return NextResponse.json({ gamePath: `/games/${gameFolder}/index.html` });
  } else {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
}
