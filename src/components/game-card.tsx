import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={game.gameUrl} className="group block h-full">
      <Card className="h-full bg-card hover:border-primary transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg overflow-hidden flex flex-col">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src="https://placehold.co/400x225/242424/949494.png"
              alt={`Thumbnail for ${game.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="gameplay screenshot"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col flex-grow justify-between">
            <div>
                <CardTitle className="text-xl leading-tight mb-1 truncate" title={game.name}>
                  {game.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  A fun and interactive browser-based {game.name.toLowerCase()} game.
                </CardDescription>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-primary group-hover:text-primary transition-all duration-300">
                <span>Play Now</span>
                <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
