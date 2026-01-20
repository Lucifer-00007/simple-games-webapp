'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Gamepad2, Grid3X3, DollarSign } from 'lucide-react';
import { GAMES, CATEGORIES } from '@/lib/games-config';

const stats = [
    {
        icon: Gamepad2,
        value: GAMES.length,
        label: 'Games',
        suffix: '+',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: Grid3X3,
        value: CATEGORIES.length,
        label: 'Categories',
        suffix: '',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: DollarSign,
        value: 100,
        label: 'Free Forever',
        suffix: '%',
        color: 'from-green-500 to-emerald-500',
    },
];

function AnimatedCounter({
    value,
    suffix = '',
    inView,
}: {
    value: number;
    suffix?: string;
    inView: boolean;
}) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!inView) return;

        let start = 0;
        const duration = 2000;
        const increment = value / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, inView]);

    return (
        <span>
            {count}
            {suffix}
        </span>
    );
}

export function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="grid gap-8 md:grid-cols-3"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/30 transition-colors">
                                {/* Icon */}
                                <div
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}
                                >
                                    <stat.icon className="h-7 w-7 text-white" />
                                </div>

                                {/* Value */}
                                <div className="text-4xl md:text-5xl font-bold mb-2">
                                    <span
                                        className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                    >
                                        <AnimatedCounter
                                            value={stat.value}
                                            suffix={stat.suffix}
                                            inView={isInView}
                                        />
                                    </span>
                                </div>

                                {/* Label */}
                                <p className="text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
