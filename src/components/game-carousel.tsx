import * as React from "react"
import Image from "next/image"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import type { Game } from "@/lib/types"

interface GameCarouselProps {
    games: Game[];
}

export function GameCarousel({ games }: GameCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-4xl mx-auto"
    >
      <CarouselContent>
        {games.map((game) => (
          <CarouselItem key={game.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
                <a href={game.gameUrl} target="_blank" rel="noopener noreferrer" className="group block">
                    <Card className="overflow-hidden">
                        <CardContent className="relative flex aspect-video items-center justify-center p-0">
                            <Image
                                src="https://placehold.co/600x400/242424/949494.png"
                                alt={`Thumbnail for ${game.name}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="gameplay screenshot"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-bold text-lg">{game.name}</span>
                            </div>
                        </CardContent>
                    </Card>
                </a>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
