import { HeroSection } from '@/components/home/hero-section';
import { FeaturedGames } from '@/components/home/featured-games';
import { CategoriesSection } from '@/components/home/categories-section';
import { StatsSection } from '@/components/home/stats-section';

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <FeaturedGames />
            <CategoriesSection />
            <StatsSection />
        </>
    );
}