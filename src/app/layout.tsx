import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GameBox - Play 30 Classic Games',
  description:
    'Play 30 classic games right in your browser. No downloads, no installs, just pure fun. Free forever!',
  keywords: ['games', 'browser games', 'arcade', 'puzzle', 'free games', 'online games'],
  authors: [{ name: 'GameBox' }],
  openGraph: {
    title: 'GameBox - Play 30 Classic Games',
    description: 'Play 30 classic games right in your browser. Free forever!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
