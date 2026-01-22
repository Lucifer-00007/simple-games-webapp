'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Play, Shuffle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { GAMES } from '@/lib/games-config';

const floatingIcons = ['🎮', '🎯', '🧩', '🎲', '🏆', '⭐', '🎪', '🕹️'];

export function HeroSection() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/games?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleRandomGame = () => {
        const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
        router.push(`/games/${randomGame.slug}`);
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-background to-pink-500/20" />

            {/* Floating Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingIcons.map((icon, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-4xl opacity-20"
                        initial={{
                            x: ((i * 13) % 20) - 10, // Deterministic offset
                            y: 0,
                        }}
                        animate={{
                            y: [-20, 20],
                            rotate: [-10, 10],
                        }}
                        transition={{
                            duration: 3 + (i % 4), // Deterministic duration based on index
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                        style={{
                            left: `${(i / floatingIcons.length) * 100 + 5}%`,
                            top: `${((i * 23) % 60) + 10}%`, // Deterministic vertical position
                        }}
                    >
                        {icon}
                    </motion.div>
                ))}
            </div>

            {/* Decorative Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">30 Games, One Destination</span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Play{' '}
                        <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                            Classic Games
                        </span>
                        <br />
                        Right in Your Browser
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        No downloads. No installs. No sign-ups. Just click and play 30 amazing
                        games instantly. 100% free forever!
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300" />
                            <div className="relative flex items-center bg-background/80 backdrop-blur-xl rounded-lg border border-border/50 shadow-lg overflow-hidden">
                                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search games..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-4 py-6 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <Button type="submit" className="mr-2">
                                    Search
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/games">
                            <Button size="lg" className="gap-2 text-lg px-8">
                                <Play className="h-5 w-5" />
                                Explore Games
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleRandomGame}
                            className="gap-2 text-lg px-8"
                        >
                            <Shuffle className="h-5 w-5" />
                            Random Game
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
