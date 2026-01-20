import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, Code, Heart, Sparkles } from 'lucide-react';

const features = [
    {
        icon: Gamepad2,
        title: '30 Classic Games',
        description:
            'From Tetris to Snake, Minesweeper to 2048 - all your favorite games in one place.',
    },
    {
        icon: Code,
        title: 'Built with Modern Tech',
        description:
            'Powered by Next.js, React, and TypeScript for blazing-fast performance.',
    },
    {
        icon: Heart,
        title: '100% Free Forever',
        description:
            'No ads, no subscriptions, no paywalls. Just pure gaming fun.',
    },
    {
        icon: Sparkles,
        title: 'No Downloads Required',
        description:
            'Play instantly in your browser. Works on desktop, tablet, and mobile.',
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen py-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        About{' '}
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            GameBox
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Your one-stop destination for classic browser games. We&apos;ve
                        collected 30 of the best games and made them available to play
                        instantly, for free.
                    </p>
                </div>

                {/* Features */}
                <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-16">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="bg-card/50 backdrop-blur border-border/50"
                        >
                            <CardContent className="p-6 flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Story */}
                <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur border-border/50">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                GameBox started as a simple collection of HTML5 games built for
                                fun. We wanted to recreate the joy of playing classic games
                                without the hassle of downloads, installations, or subscriptions.
                            </p>
                            <p>
                                Today, GameBox features 30 carefully crafted games, each
                                rebuilt using modern web technologies for the best possible
                                experience. Whether you have 5 minutes or 5 hours, there&apos;s
                                always a game waiting for you.
                            </p>
                            <p>
                                Built with Next.js, React, and lots of ❤️. We hope you enjoy
                                playing as much as we enjoyed building it!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
