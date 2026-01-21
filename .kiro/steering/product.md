# Product Overview

A Next.js web application featuring 30 browser-based games, migrated from vanilla HTML/CSS/JavaScript to a modern React/TypeScript stack.

## Core Features

- 30 playable games across 6 categories (Puzzle, Arcade, Action, Skill, Classic, Trivia)
- Dynamic game loading with lazy-loaded components
- Game browsing with search and category filtering
- Responsive design with shadcn/ui components
- Featured games showcase on homepage

## Game Categories

- **Puzzle**: Candy Crush, Minesweeper, 2048, Memory Card
- **Arcade**: Snake, Tetris, Breakout, Flappy Bird, Ping Pong
- **Action**: Archery, Fruit Slicer, Emoji Catcher, Insect Catch
- **Skill**: Speed Typing, Tilting Maze
- **Classic**: Tic Tac Toe, Rock Paper Scissors, Connect Four, Simon Says
- **Trivia**: Quiz, Hangman, Number Guessing

## User Experience

Games are accessed via `/games/[slug]` routes. Each game includes:
- Game controls and instructions
- Score tracking
- Restart functionality
- Consistent UI shell with game-specific rendering
