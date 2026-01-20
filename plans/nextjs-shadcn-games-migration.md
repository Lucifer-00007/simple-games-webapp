# Next.js + shadcn/ui 30 Games Website Migration Plan

> **Project Goal**: Migrate 30 HTML/CSS/JS games into a modern, cohesive Next.js website with shadcn/ui components, featuring a stunning landing page, game categories, and polished game pages.

---

## Executive Summary

This plan outlines the complete migration of 30 standalone HTML/CSS/JavaScript games into a unified Next.js 14+ application with shadcn/ui for a premium, modern UI experience. The current games are vanilla implementations; we'll convert them to React components with TypeScript while preserving core game logic.

---

## Current State Analysis

### Existing Games Inventory (30 Total)

| # | Game | Category | Complexity | Key Tech |
|---|------|----------|------------|----------|
| 01 | Candy Crush | Puzzle | High | Canvas/DOM Grid, Animations |
| 02 | Archery | Action | Medium | Canvas, Physics |
| 03 | Speed Typing | Skill | Medium | Timer, Input Events |
| 04 | Breakout | Arcade | High | Canvas, Physics, Collision |
| 05 | Minesweeper | Puzzle | High | Grid Logic, Recursive Reveal |
| 06 | Tower Blocks | Arcade | High | Physics, Stacking |
| 07 | Ping Pong | Sports | Medium | Canvas, AI Opponent |
| 08 | Tetris | Arcade | High | Grid, Piece Rotation |
| 09 | Tilting Maze | Skill | High | Device Motion/Gyroscope |
| 10 | Memory Card | Puzzle | Low | Card Matching Logic |
| 11 | Rock Paper Scissors | Simple | Low | Random Selection |
| 12 | Type Number Guessing | Simple | Low | Input Validation |
| 13 | Tic Tac Toe | Strategy | Low | Grid, Win Detection |
| 14 | Snake | Arcade | Medium | Grid Movement |
| 15 | Connect Four | Strategy | Medium | Grid, Win Lines |
| 16 | Insect Catch | Action | Low | Click Events, Timer |
| 17 | Typing Game | Skill | Medium | Input, Timer |
| 18 | Hangman | Word | Medium | Word Processing |
| 19 | Flappy Bird | Arcade | High | Canvas, Physics |
| 20 | Crossy Road | Arcade | High | Grid, Collision |
| 21 | 2048 | Puzzle | Medium | Grid, Merge Logic |
| 22 | Dice Roll Simulator | Simple | Low | Random, Animation |
| 23 | Shape Clicker | Action | Low | Click Events, Timer |
| 24 | Typing Game (Alt) | Skill | Medium | Input, Timer |
| 25 | Speak Number Guessing | Simple | Medium | Speech Recognition API |
| 26 | Fruit Slicer | Action | High | Touch/Mouse Events |
| 27 | Quiz Game | Trivia | Medium | Data-driven Questions |
| 28 | Emoji Catcher | Action | Low | Mouse Events |
| 29 | Whack-A-Mole | Arcade | Medium | Timing, Click Events |
| 30 | Simon Says | Memory | Medium | Sequence, Audio |

### Game Categories

- **🧩 Puzzle** (5): Candy Crush, Minesweeper, Memory Card, 2048, (Crossy Road challenge aspect)
- **🎮 Arcade** (8): Breakout, Tower Blocks, Tetris, Snake, Flappy Bird, Crossy Road, Whack-A-Mole, Ping Pong
- **⚡ Action** (5): Archery, Insect Catch, Shape Clicker, Fruit Slicer, Emoji Catcher
- **⌨️ Typing/Skill** (4): Speed Typing, Typing Game, Typing Game (Alt), Speak Number Guessing
- **🎯 Classic/Simple** (5): Rock Paper Scissors, Tic Tac Toe, Connect Four, Dice Roll, Simon Says
- **❓ Trivia/Word** (3): Type Number Guessing, Hangman, Quiz Game

---

## Technology Stack

### Core Framework
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **React 18+** with modern hooks

### UI & Styling
- **shadcn/ui** for component library
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Framer Motion** for animations

### Game-Specific
- **HTML5 Canvas** for graphics-intensive games
- **CSS Grid/Flexbox** for grid-based games
- **Web Audio API** for sound effects
- **localStorage** for high scores

### Development Tools
- **ESLint + Prettier** for code quality
- **TypeScript strict mode**

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page (hero + game showcase)
│   ├── games/
│   │   ├── page.tsx            # Games listing page
│   │   ├── [category]/
│   │   │   └── page.tsx        # Category filter page
│   │   └── [slug]/
│   │       └── page.tsx        # Individual game page
│   └── about/
│       └── page.tsx            # About page
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx          # Navigation
│   │   ├── footer.tsx
│   │   └── theme-toggle.tsx
│   ├── games/
│   │   ├── game-card.tsx       # Game preview card
│   │   ├── game-grid.tsx       # Grid layout for games
│   │   ├── category-filter.tsx # Category tabs/pills
│   │   └── search-bar.tsx      # Game search
│   └── home/
│       ├── hero-section.tsx
│       ├── featured-games.tsx
│       └── stats-section.tsx
├── games/                      # Individual game components
│   ├── candy-crush/
│   │   ├── CandyCrush.tsx      # Main game component
│   │   ├── game-logic.ts       # Game engine
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── styles.module.css   # Game-specific styles
│   ├── tetris/
│   │   ├── Tetris.tsx
│   │   ├── game-logic.ts
│   │   └── ...
│   └── [...30 game folders]
├── lib/
│   ├── games-config.ts         # Games metadata & categories
│   ├── use-game-state.ts       # Shared game state hook
│   ├── use-high-scores.ts      # High score hook
│   ├── use-sound.ts            # Audio hook
│   └── utils.ts                # Utility functions
├── types/
│   └── game.ts                 # Shared TypeScript types
└── styles/
    └── globals.css             # Global styles + Tailwind
```

---

## Implementation Phases

### Phase 1: Project Setup & Foundation (Priority: Critical)

#### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest simple-games-nextjs --typescript --tailwind --eslint --app --src-dir
```

#### 1.2 Install shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge dialog tabs scroll-area separator
```

#### 1.3 Install Additional Dependencies
```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

#### 1.4 Core Configuration Files

##### [NEW] `src/lib/games-config.ts`
- Define all 30 games with metadata:
  - `id`, `slug`, `title`, `description`
  - `category`, `difficulty`, `thumbnail`
  - `controls`, `rules`

##### [NEW] `src/types/game.ts`
- `Game` interface
- `GameCategory` enum
- `GameDifficulty` enum
- `GameScore` interface

---

### Phase 2: Layout & Navigation (Priority: High)

#### 2.1 Root Layout
##### [NEW] `src/app/layout.tsx`
- Dark/light theme provider
- Font configuration (Inter/Outfit)
- Global CSS imports
- Header and footer wrapper

#### 2.2 Header Component
##### [NEW] `src/components/layout/header.tsx`
- Logo with gradient text
- Navigation links: Home, Games, Categories
- Theme toggle (sun/moon)
- Mobile hamburger menu

#### 2.3 Footer Component
##### [NEW] `src/components/layout/footer.tsx`
- Copyright info
- Quick links
- Social media icons

---

### Phase 3: Landing Page (Priority: High)

#### 3.1 Hero Section
##### [NEW] `src/components/home/hero-section.tsx`
- Animated gradient background
- Large headline: "Play 30 Classic Games"
- Search bar with glassmorphism
- Floating game icons animation
- CTA buttons: "Explore Games", "Random Game"

#### 3.2 Featured Games Section
##### [NEW] `src/components/home/featured-games.tsx`
- Horizontal scroll carousel
- 6 featured games with hover effects
- "View All Games" link

#### 3.3 Categories Section
##### [NEW] `src/components/home/categories-section.tsx`
- Icon-based category cards
- Hover animations
- Game count per category

#### 3.4 Stats Section
##### [NEW] `src/components/home/stats-section.tsx`
- "30 Games", "6 Categories", "Free to Play"
- Animated number counters
- Gradient borders

#### 3.5 Landing Page
##### [NEW] `src/app/page.tsx`
- Compose all home sections
- Smooth scroll behavior

---

### Phase 4: Games Listing Page (Priority: High)

#### 4.1 Game Card Component
##### [NEW] `src/components/games/game-card.tsx`
- Thumbnail with hover scale
- Title, category badge, difficulty indicator
- Play button overlay
- Glassmorphism card style

#### 4.2 Game Grid Component
##### [NEW] `src/components/games/game-grid.tsx`
- Responsive grid: 1/2/3/4 columns
- Animation on load (stagger)
- Empty state for no results

#### 4.3 Category Filter
##### [NEW] `src/components/games/category-filter.tsx`
- Pill-style filter buttons
- "All" option
- Active state indicator
- URL-based filtering

#### 4.4 Search Bar
##### [NEW] `src/components/games/search-bar.tsx`
- Debounced search
- Search icon
- Clear button

#### 4.5 Games Page
##### [NEW] `src/app/games/page.tsx`
- Search + filters
- Game grid
- Pagination (if needed)

---

### Phase 5: Individual Game Pages (Priority: Critical)

#### 5.1 Game Page Layout
##### [NEW] `src/app/games/[slug]/page.tsx`
- Game container
- Sidebar with controls/rules
- High score display
- Fullscreen button
- "Back to Games" link

#### 5.2 Game Shell Component
##### [NEW] `src/components/games/game-shell.tsx`
- Loading state
- Error boundary
- Controls overlay
- Pause/Resume functionality
- Sound toggle

---

### Phase 6: Game Migrations (Priority: Critical)

Each game will be converted following this pattern:

#### Conversion Template

1. **Create folder**: `src/games/[game-slug]/`
2. **Main component**: `[GameName].tsx`
   - React functional component
   - useEffect for game loop
   - useState for game state
   - Ref for canvas (if applicable)
3. **Game logic**: `game-logic.ts`
   - Pure functions for game mechanics
   - No DOM manipulation
   - TypeScript types
4. **Types**: `types.ts`
   - Game-specific interfaces
5. **Styles**: `styles.module.css`
   - Scoped CSS for game

#### Game Migration Priority Order

**Tier 1 - Simple Games (Start Here)**
1. Rock Paper Scissors
2. Dice Roll Simulator
3. Tic Tac Toe
4. Memory Card Game
5. Type Number Guessing

**Tier 2 - Medium Games**
6. Snake Game
7. 2048 Game
8. Connect Four
9. Hangman
10. Quiz Game
11. Whack-A-Mole
12. Simon Says
13. Emoji Catcher
14. Insect Catch
15. Shape Clicker

**Tier 3 - Complex Games**
16. Minesweeper
17. Speed Typing Game
18. Typing Game(s)
19. Speak Number Guessing

**Tier 4 - Canvas-Heavy Games**
20. Tetris
21. Candy Crush
22. Breakout
23. Ping Pong
24. Flappy Bird
25. Fruit Slicer
26. Archery
27. Tower Blocks
28. Crossy Road
29. Tilting Maze

---

### Phase 7: Polish & Enhancements (Priority: Medium)

#### 7.1 High Scores System
##### [NEW] `src/lib/use-high-scores.ts`
- localStorage persistence
- Per-game leaderboard
- Score submission UI

#### 7.2 Sound System
##### [NEW] `src/lib/use-sound.ts`
- Sound effects for games
- Volume control
- Mute preference persistence

#### 7.3 Animations
- Page transitions
- Game card hover effects
- Loading animations
- Victory/defeat celebrations

#### 7.4 Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Reduced motion support

---

## Detailed Component Specifications

### Game Card Design

```
┌───────────────────────────────┐
│  ┌─────────────────────────┐  │
│  │                         │  │
│  │     Game Thumbnail      │  │
│  │       (16:9 ratio)      │  │
│  │                         │  │
│  │    ▶ Play Button        │  │
│  └─────────────────────────┘  │
│                               │
│  🎮 Game Title               │
│  ┌─────────┐ ┌─────────────┐ │
│  │ Arcade  │ │ ⭐⭐⭐☆☆    │ │
│  └─────────┘ └─────────────┘ │
│  Brief description text...   │
└───────────────────────────────┘
```

### Landing Page Hero Design

```
┌─────────────────────────────────────────────┐
│  ╔══════════════════════════════════════╗   │
│  ║                                      ║   │
│  ║   🎮 Play 30 Classic Games 🎮       ║   │
│  ║                                      ║   │
│  ║   Fun, free, and right in your      ║   │
│  ║   browser. No downloads needed!     ║   │
│  ║                                      ║   │
│  ║   ┌──────────────────────────────┐  ║   │
│  ║   │ 🔍 Search games...           │  ║   │
│  ║   └──────────────────────────────┘  ║   │
│  ║                                      ║   │
│  ║   [ Explore Games ]  [ Random Game] ║   │
│  ╚══════════════════════════════════════╝   │
│                                             │
│  Floating game icons animation background   │
└─────────────────────────────────────────────┘
```

---

## File-by-File Implementation Details

### Core Configuration

#### [NEW] `src/lib/games-config.ts`

```typescript
export const GAMES = [
  {
    id: 1,
    slug: 'candy-crush',
    title: 'Candy Crush',
    description: 'Match three or more candies to score points',
    category: 'puzzle',
    difficulty: 3,
    controls: ['Click/tap to swap candies', 'Match 3+ to score'],
    thumbnail: '/thumbnails/candy-crush.png',
  },
  // ... 29 more games
];

export const CATEGORIES = ['puzzle', 'arcade', 'action', 'skill', 'classic', 'trivia'];
```

---

## Verification Plan

### Automated Tests

> [!NOTE]
> Currently no tests exist in the codebase. We will add the following:

#### Unit Tests (Jest + React Testing Library)
```bash
# Run all tests
npm test

# Run specific test
npm test -- --testPathPattern="games-config"
```

**Tests to create:**
1. `src/lib/__tests__/games-config.test.ts` - Validate all 30 games have required fields
2. `src/components/games/__tests__/game-card.test.tsx` - Test card renders correctly
3. `src/games/tic-tac-toe/__tests__/game-logic.test.ts` - Test win detection

### Browser Testing

```bash
# Start dev server
npm run dev
# Navigate to http://localhost:3000
```

**Manual verification checklist:**
- [ ] Landing page loads with hero section
- [ ] All 30 games appear in games listing
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Each game page loads correctly
- [ ] At least 3 games are playable end-to-end
- [ ] Theme toggle works (dark/light)
- [ ] Responsive design on mobile (375px)
- [ ] Responsive design on tablet (768px)

### Build Verification

```bash
# Check production build
npm run build

# Expected output: No errors
```

---

## User Review Required

> [!IMPORTANT]
> **Decision Points for User:**
> 
> 1. **Fresh Start vs. In-Place Migration**: Should we create a completely new Next.js project alongside the existing code, or migrate in-place?
> 
> 2. **All 30 Games vs. Phased**: Should we migrate all 30 games before release, or deploy iteratively (e.g., 10 games first)?
> 
> 3. **Static Export vs. Server Rendering**: Do you need static export (`output: 'export'`) for hosting on GitHub Pages, or will this be hosted on Vercel/other?
> 
> 4. **Game Thumbnails**: Should I generate placeholder thumbnails using AI, or will you provide screenshots?
> 
> 5. **Sound Effects**: Should games include sound effects? (Some original games have sounds)

> [!CAUTION]
> **Breaking Changes:**
> - The existing vanilla HTML games will be preserved in their original directories
> - The new Next.js app will be in the root `src/` directory
> - URL structure will change from `/01-Candy-Crush-Game/index.html` to `/games/candy-crush`

---

## Timeline Estimate

| Phase | Description | Estimated Effort |
|-------|-------------|------------------|
| 1 | Project Setup | 1-2 hours |
| 2 | Layout & Navigation | 2-3 hours |
| 3 | Landing Page | 3-4 hours |
| 4 | Games Listing Page | 2-3 hours |
| 5 | Game Page Template | 2-3 hours |
| 6a | Simple Games (5) | 4-6 hours |
| 6b | Medium Games (10) | 8-12 hours |
| 6c | Complex Games (4) | 4-6 hours |
| 6d | Canvas Games (11) | 15-20 hours |
| 7 | Polish & Enhancements | 4-6 hours |

**Total Estimated: 45-65 hours**

---

## Next Steps

1. ✅ Review and approve this plan
2. Create task.md with detailed checklist
3. Initialize Next.js project
4. Set up shadcn/ui
5. Build core layout components
6. Create landing page
7. Build games listing infrastructure
8. Begin game migrations (Tier 1 first)

---

*Last Updated: 2026-01-20*
