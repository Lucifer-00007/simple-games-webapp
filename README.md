# Simple Games WebApp 🎮

A modern, responsive, and feature-rich web application hosting a collection of classic and arcade games. Built with Next.js 15+, React 19, and Tailwind CSS 4.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

## ✨ Features

- **🎮 30+ Games**: A diverse collection of puzzles, arcade, action, and classic games.
- **📱 Fully Responsive**: Seamless experience across mobile, tablet, and desktop.
- **🌗 Dark Mode**: Built-in support for light and dark themes using shadcn/ui.
- **⚡ Fast Performance**: Optimized using Next.js App Router and static generation.
- **🎨 Modern UI**: Clean design with smooth animations powered by Framer Motion.
- **🎯 Category Filtering**: Easily find games by category (Puzzle, Arcade, Action, etc.).

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (recommended) or npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/simple-games-webapp.git
   cd simple-games-webapp
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Run the development server:
   ```bash
   bun dev
   # or
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Deployment**: [Firebase Hosting](https://firebase.google.com/docs/hosting)

## 🎮 Game Library

| Category | Games |
| :--- | :--- |
| **🧩 Puzzle** | 2048, Minesweeper, Memory Card, Candy Crush |
| **🎮 Arcade** | Tetris, Snake, Breakout, Flappy Bird, Tower Blocks, Crossy Road, Whack-A-Mole |
| **⚡ Action** | Archery, Fruit Slicer, Insect Catch, Shape Clicker, Emoji Catcher |
| **⌨️ Skill** | Speed Typing, Tilting Maze, Typing Game Alt |
| **🎯 Classic** | Chess, Tic Tac Toe, Connect Four, Rock Paper Scissors, Dice Roll, Simon Says |
| **❓ Trivia** | Hangman, Quiz Game, Number Guessing |

## 🏗 Project Structure

```text
src/
├── app/              # Next.js App Router (pages & layouts)
├── components/       # Reusable UI & Game components
│   ├── games/        # Game-specific shell components
│   ├── home/         # Homepage sections
│   └── ui/           # shadcn/ui core components
├── games/            # Individual game logic & UI
│   ├── 2048/
│   ├── chess/
│   └── ...
├── lib/              # Utilities, registries, and configs
└── types/            # TypeScript type definitions
```

## 📝 How to Add a New Game

1. Create a new directory in `src/games/[slug]/`.
2. Implement your game component and logic.
3. Register your game in `src/lib/games-registry.tsx`.
4. Add game metadata to `src/lib/games-config.ts`.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for gamers and developers.