'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/games-config';
import { GameCategory } from '@/types/game';

interface CategoryFilterProps {
    selectedCategory: GameCategory | 'all';
    onCategoryChange: (category: GameCategory | 'all') => void;
}

export function CategoryFilter({
    selectedCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange('all')}
                className="relative"
            >
                All
                {selectedCategory === 'all' && (
                    <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 rounded-md bg-primary"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
            </Button>
            {CATEGORIES.map((category) => (
                <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange(category.id)}
                    className="gap-1"
                >
                    <span>{category.icon}</span>
                    {category.name}
                </Button>
            ))}
        </div>
    );
}
