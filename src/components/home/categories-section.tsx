'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES, getGamesByCategory } from '@/lib/games-config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4 },
    },
};

export function CategoriesSection() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        Browse by <span className="text-primary">Category</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Find games that match your mood. From brain-teasing puzzles to
                        action-packed arcade classics.
                    </p>
                </div>

                {/* Categories Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {CATEGORIES.map((category) => {
                        const gameCount = getGamesByCategory(category.id).length;

                        return (
                            <motion.div key={category.id} variants={itemVariants}>
                                <Link href={`/games?category=${category.id}`}>
                                    <Card className="group overflow-hidden bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                                        <CardContent className="p-6 flex items-center gap-4">
                                            {/* Icon */}
                                            <div
                                                className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-lg`}
                                            >
                                                {category.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                    {category.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {category.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {gameCount} {gameCount === 1 ? 'game' : 'games'}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
