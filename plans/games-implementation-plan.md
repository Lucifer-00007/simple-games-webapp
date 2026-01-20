# Complete Games Implementation Plan

> **Goal**: Implement all 26 remaining games as React components following the established architecture pattern.

---

## Current Status

### ✅ Already Implemented (4 games)
| Game | Slug | Category |
|------|------|----------|
| Tic Tac Toe | `tic-tac-toe` | Classic |
| Rock Paper Scissors | `rock-paper-scissors` | Classic |
| Dice Roll Simulator | `dice-roll` | Classic |
| Memory Card Game | `memory-card` | Puzzle |

### 📋 Remaining Games (26 games)

---

## Architecture Pattern

Each game follows a consistent folder structure:

```
src/games/[game-slug]/
├── index.ts           # Barrel exports
├── types.ts           # TypeScript interfaces
├── game-logic.ts      # Pure functions (testable, no React/DOM)
├── [GameName].tsx     # React component with UI
└── styles.module.css  # Scoped CSS (if needed)
```

### Key Principles
1. **Separate logic from UI** - `game-logic.ts` contains pure functions
2. **Type everything** - Define all types in `types.ts`
3. **Use Framer Motion** - For animations and transitions
4. **Responsive design** - Mobile-first with CSS modules
5. **Register games** - Add to `src/lib/games-registry.tsx`

---

## Implementation Tiers

Games are organized by complexity to enable incremental delivery.

### Tier 1: Simple Games (1 remaining)

| # | Game | Source | Key Features | Est. Time |
|---|------|--------|--------------|-----------|
| 12 | Number Guessing | `12-Type-Number-Guessing-Game` | Input validation, hints | 30 min |

---

### Tier 2: Medium Games (10 games)

| # | Game | Source | Key Features | Est. Time |
|---|------|--------|--------------|-----------|
| 14 | Snake | `14-Snake-Game` | Grid movement, collision | 1 hr |
| 21 | 2048 | `21-2048-Game` | Tile merging, swipe | 1.5 hr |
| 15 | Connect Four | `15-Connect-Four-Game` | Grid, win detection | 1 hr |
| 18 | Hangman | `18-Hangman-Game` | Word processing, SVG | 1 hr |
| 27 | Quiz Game | `27-Quiz-Game` | Data-driven questions | 45 min |
| 29 | Whack-A-Mole | `29-Whack-A-Mole-Game` | Timing, click events | 45 min |
| 30 | Simon Says | `30-Simon-Says-Game` | Sequence, audio | 1 hr |
| 28 | Emoji Catcher | `28-Emoji-Catcher-Game` | Mouse position | 45 min |
| 16 | Insect Catch | `16-Insect-Catch-Game` | Click events, timer | 45 min |
| 23 | Shape Clicker | `23-Shape-Clicker-Game` | Random shapes, timer | 30 min |

---

### Tier 3: Complex Games (4 games)

| # | Game | Source | Key Features | Est. Time |
|---|------|--------|--------------|-----------|
| 5 | Minesweeper | `05-Minesweeper-Game` | Recursive reveal, flags | 2 hr |
| 3 | Speed Typing | `03-Speed-Typing-Game` | WPM calculation, timer | 1 hr |
| 17 | Typing Game | `17-Typing-Game` | Falling words | 1 hr |
| 25 | Speak Number | `25-Speak-Number-Guessing-Game` | Speech Recognition API | 1.5 hr |

---

### Tier 4: Canvas-Based Games (11 games)

| # | Game | Source | Key Features | Est. Time |
|---|------|--------|--------------|-----------|
| 8 | Tetris | `08-Tetris-Game` | Piece rotation, scoring | 3 hr |
| 1 | Candy Crush | `01-Candy-Crush-Game` | Grid matching, cascades | 3 hr |
| 4 | Breakout | `04-Breakout-Game` | Ball physics, collision | 2 hr |
| 7 | Ping Pong | `07-Ping-Pong-Game` | AI opponent, physics | 2 hr |
| 19 | Flappy Bird | `19-Flappy-Bird-Game` | Gravity, pipes | 2 hr |
| 26 | Fruit Slicer | `26-Fruit-Slicer-Game` | Touch/swipe gestures | 2.5 hr |
| 2 | Archery | `02-Archery-Game` | Aiming, physics | 2 hr |
| 6 | Tower Blocks | `06-Tower-Blocks` | Stacking physics | 2 hr |
| 20 | Crossy Road | `20-Crossy-Road-Game` | Grid movement, obstacles | 2 hr |
| 9 | Tilting Maze | `09-Tilting-Maze-Game` | Device motion/gyroscope | 2.5 hr |
| 24 | Typing Game Alt | `24-Typing-Game` | Alternative typing | 1 hr |

---

## Detailed File Changes

### For Each Game

#### [NEW] `src/games/[slug]/types.ts`
- Game-specific TypeScript interfaces
- State types, action types

#### [NEW] `src/games/[slug]/game-logic.ts`
- Pure functions for game mechanics
- No React or DOM dependencies
- Easily testable

#### [NEW] `src/games/[slug]/[GameName].tsx`
- React functional component
- Uses `useState` and `useEffect`
- Uses `useRef` for canvas games
- Framer Motion for animations

#### [NEW] `src/games/[slug]/styles.module.css`
- Scoped CSS for the game
- Responsive breakpoints

#### [NEW] `src/games/[slug]/index.ts`
- Barrel exports

#### [MODIFY] `src/lib/games-registry.tsx`
- Add dynamic import for each new game

---

## Implementation Order (Recommended)

### Phase 1: Complete Simple Games
1. Number Guessing Game

### Phase 2: Medium DOM-Based Games
2. Snake Game (grid-based)
3. 2048 Game (tile merging)
4. Connect Four (grid logic)
5. Hangman (word game)
6. Quiz Game (data-driven)
7. Whack-A-Mole (timing)
8. Simon Says (pattern memory)
9. Emoji Catcher (mouse tracking)
10. Insect Catch (click game)
11. Shape Clicker (reaction game)

### Phase 3: Complex DOM Games
12. Minesweeper
13. Speed Typing
14. Typing Game
15. Speak Number Guessing

### Phase 4: Canvas Games
16. Tetris
17. Candy Crush
18. Breakout
19. Ping Pong
20. Flappy Bird
21. Fruit Slicer
22. Archery
23. Tower Blocks
24. Crossy Road
25. Tilting Maze
26. Typing Game Alt

---

## Verification Plan

### Manual Testing (Per Game)
For each game:
1. Navigate to `http://localhost:3000/games/[slug]`
2. Verify game loads without errors
3. Play through a complete game cycle
4. Test restart functionality
5. Test on mobile viewport (375px)

### Browser Console Check
```bash
# Start dev server
npm run dev
# Open browser console, check for errors
```

### Build Verification
```bash
npm run build
# Should complete with no errors
```

### User Testing Checklist
- [ ] Game renders correctly
- [ ] Controls work as expected
- [ ] Win/lose conditions trigger properly
- [ ] Score updates correctly
- [ ] Restart clears state
- [ ] Responsive on mobile

---

## Example Implementation: Number Guessing Game

### Step 1: Create types
```typescript
// src/games/number-guessing/types.ts
export interface GameState {
  secretNumber: number;
  guess: number | null;
  attempts: number;
  maxAttempts: number;
  hint: string;
  status: 'playing' | 'won' | 'lost';
}
```

### Step 2: Create game logic
```typescript
// src/games/number-guessing/game-logic.ts
export function generateSecretNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function checkGuess(guess: number, secret: number): 'correct' | 'higher' | 'lower' {
  if (guess === secret) return 'correct';
  return guess < secret ? 'higher' : 'lower';
}
```

### Step 3: Create React component with UI
### Step 4: Add styles
### Step 5: Register in games-registry.tsx

---

## Timeline Estimate

| Phase | Games | Estimated Time |
|-------|-------|---------------|
| Phase 1 | 1 game | 30 min |
| Phase 2 | 10 games | 8 hours |
| Phase 3 | 4 games | 5.5 hours |
| Phase 4 | 11 games | 23.5 hours |
| **Total** | **26 games** | **~37 hours** |

---

## Next Steps

1. ✅ Review and approve this plan
2. Start with Phase 1 (Number Guessing)
3. Proceed through each phase sequentially
4. Test each game before moving to next

---

*Last Updated: January 20, 2026*
