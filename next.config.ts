import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/games/01-Candy-Crush-Game',
        destination: '/games/candy-crush-game',
        permanent: true,
      },
      {
        source: '/games/02-Archery-Game',
        destination: '/games/archery-game',
        permanent: true,
      },
      {
        source: '/games/03-Speed-Typing-Game',
        destination: '/games/speed-typing-game',
        permanent: true,
      },
      {
        source: '/games/04-Breakout-Game',
        destination: '/games/breakout-game',
        permanent: true,
      },
      {
        source: '/games/05-Minesweeper-Game',
        destination: '/games/minesweeper-game',
        permanent: true,
      },
      {
        source: '/games/06-Tower-Blocks',
        destination: '/games/tower-blocks',
        permanent: true,
      },
      {
        source: '/games/07-Ping-Pong-Game',
        destination: '/games/ping-pong-game',
        permanent: true,
      },
      {
        source: '/games/08-Tetris-Game',
        destination: '/games/tetris-game',
        permanent: true,
      },
      {
        source: '/games/09-Tilting-Maze-Game',
        destination: '/games/tilting-maze-game',
        permanent: true,
      },
      {
        source: '/games/10-Memory-Card-Game',
        destination: '/games/memory-card-game',
        permanent: true,
      },
      {
        source: '/games/11-Rock-Paper-Scissors',
        destination: '/games/rock-paper-scissors',
        permanent: true,
      },
      {
        source: '/games/12-Type-Number-Guessing-Game',
        destination: '/games/type-number-guessing-game',
        permanent: true,
      },
      {
        source: '/games/13-Tic-Tac-Toe',
        destination: '/games/tic-tac-toe',
        permanent: true,
      },
      {
        source: '/games/14-Snake-Game',
        destination: '/games/snake-game',
        permanent: true,
      },
      {
        source: '/games/15-Connect-Four-Game',
        destination: '/games/connect-four-game',
        permanent: true,
      },
      {
        source: '/games/16-Insect-Catch-Game',
        destination: '/games/insect-catch-game',
        permanent: true,
      },
      {
        source: '/games/17-Typing-Game',
        destination: '/games/typing-game',
        permanent: true,
      },
      {
        source: '/games/18-Hangman-Game',
        destination: '/games/hangman-game',
        permanent: true,
      },
      {
        source: '/games/19-Flappy-Bird-Game',
        destination: '/games/flappy-bird-game',
        permanent: true,
      },
      {
        source: '/games/20-Crossy-Road-Game',
        destination: '/games/crossy-road-game',
        permanent: true,
      },
      {
        source: '/games/21-2048-Game',
        destination: '/games/2048-game',
        permanent: true,
      },
      {
        source: '/games/22-Dice-Roll-Simulator',
        destination: '/games/dice-roll-simulator',
        permanent: true,
      },
      {
        source: '/games/23-Shape-Clicker-Game',
        destination: '/games/shape-clicker-game',
        permanent: true,
      },
      {
        source: '/games/24-Typing-Game',
        destination: '/games/typing-game-2',
        permanent: true,
      },
      {
        source: '/games/25-Speak-Number-Guessing-Game',
        destination: '/games/speak-number-guessing-game',
        permanent: true,
      },
      {
        source: '/games/26-Fruit-Slicer-Game',
        destination: '/games/fruit-slicer-game',
        permanent: true,
      },
      {
        source: '/games/27-Quiz-Game',
        destination: '/games/quiz-game',
        permanent: true,
      },
      {
        source: '/games/28-Emoji-Catcher-Game',
        destination: '/games/emoji-catcher-game',
        permanent: true,
      },
      {
        source: '/games/29-Whack-A-Mole-Game',
        destination: '/games/whack-a-mole-game',
        permanent: true,
      },
      {
        source: '/games/30-Simon-Says-Game',
        destination: '/games/simon-says-game',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
