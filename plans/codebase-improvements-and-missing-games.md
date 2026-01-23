# Codebase Improvement Plan & Missing Games

## 🛠️ Codebase Improvements

### 1. Testing Infrastructure 🧪
*   **Unit Tests:** Implement Jest + React Testing Library.
    *   *Why:* To ensure game logic (state transitions, scoring, win conditions) is correct and robust against refactoring.
    *   *Target:* Core logic files (e.g., `src/games/*/game-logic.ts`) and shared utilities.
*   **E2E Tests:** Integrate Playwright or Cypress.
    *   *Why:* To verify the full user flow: navigating to a game, playing a round, and seeing the score.
    *   *Target:* Critical paths in `src/app/games/[slug]/page.tsx` and common game components.

### 2. Architectural Enhancements 🏗️
*   **Standardized Game Hook (`useGameLoop`):**
    *   *Current State:* Games likely implement their own `requestAnimationFrame` loops.
    *   *Improvement:* Create a shared hook `useGameLoop(callback, fps)` to handle pausing, delta time calculation, and cleanup consistently.
*   **Global Score/Leaderboard System:**
    *   *Current State:* Scores seem local.
    *   *Improvement:* Implement a context or lightweight store (Zustand) to persist high scores across sessions (using `localStorage` initially, maybe a DB later).
*   **Sound Manager Context:**
    *   *Improvement:* A centralized `SoundContext` to manage SFX and BGM, allowing users to mute all games globally.

### 3. UI/UX & Accessibility 🎨
*   **PWA Support:**
    *   *Action:* Add `next-pwa` configuration and a `manifest.json`.
    *   *Benefit:* Allows users to install the app on mobile devices and play offline.
*   **Standardized Controls Overlay:**
    *   *Improvement:* Create a unified `<GameControls />` component that shows touch controls on mobile and key bindings on desktop, ensuring a consistent look across all games.
*   **Accessibility (a11y) Audit:**
    *   *Action:* Ensure all game interactive elements are keyboard focusable (where applicable) and have `aria-labels`. Add "Skip to Game" links.

### 4. Performance & SEO 🚀
*   **Dynamic OpenGraph Images:**
    *   *Improvement:* Use `next/og` (ImageResponse) to generate dynamic social share images for each game, showing the game title and maybe a high score.
*   **Asset Optimization:**
    *   *Action:* Ensure all game assets (images, sounds) are optimized and potentially preloaded for the active game.

### 5. Developer Experience 💻
*   **Husky & Lint-Staged:**
    *   *Action:* Set up pre-commit hooks to run linting and type checking on changed files.
*   **Plop.js Generator:**
    *   *Action:* Create a scaffold generator for new games (`npm run generate-game <slug>`) to automatically create the folder structure, registry entry, and config entry.

---

## 🎮 Missing Popular Simple Games

Here is a list of popular simple games that would fit well into the existing collection:

1.  **Sudoku** 🧩
    *   *Description:* Classic number-placement puzzle.
    *   *Tech:* Grid logic, backtracking generator (or pre-filled boards).
2.  **Wordle (Word Guess)** 🔤
    *   *Description:* Guess the 5-letter word in 6 tries.
    *   *Tech:* Dictionary array, string matching logic.
3.  **Solitaire (Klondike)** 🃏
    *   *Description:* The classic card sorting game.
    *   *Tech:* Drag-and-drop (dnd-kit), deck management logic.
4.  **Battleship** 🚢
    *   *Description:* Strategy guessing game against AI.
    *   *Tech:* Grid state, AI probability logic.
5.  **Dino Run (Infinite Runner)** 🦖
    *   *Description:* Jump over obstacles in an endless scrolling world (Chrome offline game style).
    *   *Tech:* Canvas or DOM-based collision detection, increasing speed.
6.  **Space Invaders / Galaga Clone** 👾
    *   *Description:* Shoot down waves of descending aliens.
    *   *Tech:* Canvas, projectile collision, enemy movement patterns.
7.  **Pac-Man Clone** 👻
    *   *Description:* Navigate a maze, eat dots, avoid ghosts.
    *   *Tech:* Grid-based movement, pathfinding (A* or simple tracking) for ghosts.
8.  **Tower of Hanoi** 🗼
    *   *Description:* Move a stack of disks to another rod following size rules.
    *   *Tech:* Recursion logic visualizer, drag-and-drop.
9.  **Othello / Reversi** ⚪⚫
    *   *Description:* Strategy board game of flipping opponent's pieces.
    *   *Tech:* Grid state, valid move calculation.
10. **Bubble Shooter** 🫧
    *   *Description:* Shoot colored bubbles to match 3 and clear the board.
    *   *Tech:* Canvas, angle calculation, collision reflection.
11. **Piano Tiles** 🎹
    *   *Description:* Tap the black tiles as they scroll down.
    *   *Tech:* Rhythm/timing logic, scrolling viewport.
12. **Mastermind** 🧠
    *   *Description:* Deduce the secret color code.
    *   *Tech:* Logic comparison, history state.
