# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router
│   ├── games/[slug]/      # Dynamic game routes
│   │   ├── page.tsx       # Server component (metadata, data fetching)
│   │   └── GameClientPage.tsx  # Client component wrapper
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   ├── games/             # Game-related UI components
│   ├── home/              # Homepage sections
│   ├── layout/            # Layout components (header, footer)
│   └── ui/                # shadcn/ui components
├── games/                 # Game implementations
│   └── [game-name]/       # Each game in its own folder
│       ├── index.ts       # Barrel exports
│       ├── [GameName].tsx # Main React component
│       ├── game-logic.ts  # Pure game logic functions
│       ├── types.ts       # TypeScript interfaces
│       └── styles.module.css  # Game-specific styles
├── lib/
│   ├── games-config.ts    # Game metadata (GAMES array)
│   ├── games-registry.tsx # Dynamic imports & component mapping
│   └── utils.ts           # Utility functions (cn, etc.)
└── types/
    └── game.ts            # Shared game types

static-code/               # Original vanilla JS games (reference)
plans/                     # Migration and implementation plans
```

## Game Architecture Pattern

Each game follows a consistent structure:

1. **Component** (`[GameName].tsx`): 
   - Client component (`'use client'`)
   - Manages React state and UI
   - Handles user interactions
   - Accepts `onScoreUpdate` and `onRestart` props

2. **Logic** (`game-logic.ts`):
   - Pure functions for game mechanics
   - No React dependencies
   - Testable business logic

3. **Types** (`types.ts`):
   - Game-specific interfaces
   - State definitions
   - Configuration types

4. **Styles** (`styles.module.css`):
   - CSS Modules for scoped styles
   - Game-specific visual elements

5. **Exports** (`index.ts`):
   - Barrel file for clean imports
   - Exports component and types

## Key Files

- `src/lib/games-config.ts` - Central registry of all 30 games with metadata
- `src/lib/games-registry.tsx` - Maps slugs to dynamically imported components
- `src/types/game.ts` - Shared types (Game, GameCategory, GameState, etc.)

## Conventions

- Use kebab-case for game slugs and folder names
- Use PascalCase for component names
- Lazy load game components via `next/dynamic`
- Keep game logic separate from React components
- Use TypeScript for all files
- Import from `@/` alias instead of relative paths
