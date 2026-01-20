import Link from 'next/link';
import { Gamepad2, Github, Twitter, Heart } from 'lucide-react';

const quickLinks = [
    { href: '/games', label: 'All Games' },
    { href: '/games?category=arcade', label: 'Arcade' },
    { href: '/games?category=puzzle', label: 'Puzzle' },
    { href: '/games?category=action', label: 'Action' },
];

const socialLinks = [
    { href: 'https://github.com', label: 'GitHub', icon: Github },
    { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
];

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/50">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                <Gamepad2 className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                GameBox
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            Play 30 classic games right in your browser. No downloads, no
                            installs, just pure fun. Free forever!
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-semibold mb-4">Connect</h3>
                        <div className="flex gap-3">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <link.icon className="h-4 w-4" />
                                    <span className="sr-only">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} GameBox. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using Next.js & shadcn/ui
                    </p>
                </div>
            </div>
        </footer>
    );
}
