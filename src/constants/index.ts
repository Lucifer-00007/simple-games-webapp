// API URL for the GitHub repository containing game data
export const GITHUB_REPO_API_URL = 'https://api.github.com/repos/he-is-talha/html-css-javascript-games/contents/';

// Base URL for accessing the raw game files on GitHub Pages
export const GITHUB_GAMES_BASE_URL = 'https://he-is-talha.github.io/html-css-javascript-games/';

// Define a type for a game link
export type GameLink = {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    gameUrl: string;
};

// Placeholder for "my app links" - replace with actual app links if needed
export const MY_APP_LINKS: GameLink[] = [
    {
        id: 'my-app-1',
        name: 'My App Game 1',
        description: 'A custom game built for this application.',
        thumbnailUrl: '/placeholder-thumbnail.png', // You might want to add a placeholder image in public/
        gameUrl: '/my-app-game-1',
    },
    {
        id: 'my-app-2',
        name: 'My App Game 2',
        description: 'Another custom game built for this application.',
        thumbnailUrl: '/placeholder-thumbnail.png',
        gameUrl: '/my-app-game-2',
    },
];

export const LOCAL_GAME_NAMES = [
  "01-Candy-Crush-Game",
  "02-Archery-Game",
  "03-Speed-Typing-Game",
  "04-Breakout-Game",
  "05-Minesweeper-Game",
  "06-Tower-Blocks",
  "07-Ping-Pong-Game",
  "08-Tetris-Game",
  "09-Tilting-Maze-Game",
  "10-Memory-Card-Game",
  "11-Rock-Paper-Scissors",
  "12-Type-Number-Guessing-Game",
  "13-Tic-Tac-Toe",
  "14-Snake-Game",
  "15-Connect-Four-Game",
  "16-Insect-Catch-Game",
  "17-Typing-Game",
  "18-Hangman-Game",
  "19-Flappy-Bird-Game",
  "20-Crossy-Road-Game",
  "21-2048-Game",
  "22-Dice-Roll-Simulator",
  "23-Shape-Clicker-Game",
  "24-Typing-Game",
  "25-Speak-Number-Guessing-Game",
  "26-Fruit-Slicer-Game",
  "27-Quiz-Game",
  "28-Emoji-Catcher-Game",
  "29-Whack-A-Mole-Game",
  "30-Simon-Says-Game",
];

export const REVALIDATE_TIME = 3600; // Revalidate once per hour
export const EXCLUDED_GITHUB_DIRS = ['.github', 'assets'];
export const PLACEHOLDER_THUMBNAIL_URL = '/placeholder-thumbnail.png';
export const GAME_CATEGORIES = ['Puzzle', 'Arcade', 'Strategy', 'Card', 'Action', '2D'];

export const GITHUB_GAME_DESCRIPTION_PREFIX = 'An interactive browser game: ';
export const GITHUB_GAME_DESCRIPTION_SUFFIX = '.';
export const GITHUB_THUMBNAIL_BASE_URL = 'https://raw.githubusercontent.com/he-is-talha/html-css-javascript-games/master/';
export const GITHUB_THUMBNAIL_SUFFIX = '/preview.png';

export const METADATA_TITLE = 'GameVerse';
export const METADATA_DESCRIPTION = 'A game discovery platform to find your next favorite browser game.';

export const MOBILE_BREAKPOINT = 768;