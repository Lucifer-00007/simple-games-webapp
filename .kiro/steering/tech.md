# Tech Stack

## Framework & Core

- **Next.js 16.1.4** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Node.js 20+** - Runtime

## UI & Styling

- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Component library (built on Radix UI)
- **Framer Motion** - Animations
- **Lucide React** - Icon library
- **CSS Modules** - Game-specific styles

## Build & Development

- **npm** - Package manager (lock file present)
- **ESLint 9** - Linting with Next.js config

## Common Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Path Aliases

- `@/*` maps to `src/*` for clean imports

## TypeScript Configuration

- Target: ES2017
- Strict mode enabled
- JSX: react-jsx (automatic runtime)
- Module resolution: bundler
