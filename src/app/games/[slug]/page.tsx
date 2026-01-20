import { notFound } from 'next/navigation';
import { GAMES, getGameBySlug } from '@/lib/games-config';
import { GameClientPage } from './GameClientPage';

interface GamePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    return GAMES.map((game) => ({
        slug: game.slug,
    }));
}

export async function generateMetadata({ params }: GamePageProps) {
    const { slug } = await params;
    const game = getGameBySlug(slug);

    if (!game) {
        return {
            title: 'Game Not Found',
        };
    }

    return {
        title: `${game.title} - GameBox`,
        description: game.description,
    };
}

export default async function GamePage({ params }: GamePageProps) {
    const { slug } = await params;
    const game = getGameBySlug(slug);

    if (!game) {
        notFound();
    }

    return <GameClientPage game={game} />;
}
