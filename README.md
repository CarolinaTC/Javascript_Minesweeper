# Minesweeper

A moment to think. A responsive Minesweeper game built with React, featuring an English interface, dark mode, keyboard navigation, and mobile controls.

## Run locally

Requires **Node.js 22.13 or later** and npm. The Node 18 installation used by the original project cannot run the updated development tools. If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install
nvm use
npm ci
npm run dev
```

If you already have a compatible Node version, run `npm ci` and `npm run dev`.

Open **http://127.0.0.1:5173** in your browser. Press `Ctrl+C` in the terminal to stop the server. The project uses npm and `package-lock.json` for reproducible installations.

## How to play

- **Click or tap:** reveal a cell. Your first cell and all its neighbors are always safe.
- **Right-click:** place or remove a flag.
- **Mobile:** select **Flag** to mark mines or **Reveal** to uncover cells.
- **Keyboard:** Tab enters the board; arrow keys move between cells; Enter/Space activate a cell; F toggles a flag. Home/End move to the first/last cell in a row; Ctrl+Home/End move to the first/last cell on the board.
- **Click a revealed number:** open the remaining adjacent cells when the number of adjacent flags matches the clue. An incorrect flag can cost you the game.
- **Goal:** reveal every cell without a mine. Flags are helpful, but you do not have to place them all to win.

| Difficulty   | Board   | Mines |
| ------------ | ------- | ----- |
| Beginner     | 9 × 9   | 10    |
| Intermediate | 16 × 16 | 40    |
| Expert       | 16 × 30 | 99    |

Large boards scroll horizontally within the game area. The timer starts on the first reveal and stops when you win or lose. **New game** and difficulty changes start a fresh game. Best times for each difficulty and your theme preference are saved in this browser's `localStorage`. If storage is blocked, the game still works without persistence.

## Architecture

Atomic Design organizes the visual components into atoms, molecules, and organisms. `App.jsx` composes the single screen; game rules and persistence remain independent of the UI.

```text
src/
  components/
    atoms/        # Button, Icon, Cell, GameFace
    molecules/    # Stat, DifficultyPicker, InteractionMode
    organisms/    # Board, HowToPlay, HelpDialog
  game/
    engine.js     # Pure game rules, independent of React and the DOM
    storage.js    # Validated persistence with graceful failure handling
  hooks/
    useMinesweeper.js  # State, timer, actions, and records
  App.jsx         # Screen composition
  main.jsx        # React entry point
  styles.css      # Design tokens, themes, and responsive styles
tests/
  engine.test.js  # Rules and regression tests
  storage.test.js # Invalid data and unavailable storage
  e2e/           # Desktop and mobile browser flows
```

The engine uses an immutable reducer and seeded randomness so transitions remain deterministic in React StrictMode. Mines are placed using a partial Fisher–Yates shuffle on the first reveal. Coordinate-based neighbor checks replace hardcoded board boundaries, and an iterative flood fill opens empty areas. The timer calculates elapsed time from timestamps to avoid accumulating interval drift. Stable action callbacks and memoized cells avoid rerendering every cell on timer updates.

The interface uses native buttons, labels for individual cells, visible focus, one Tab entry into the board, `aria-live` status announcements, and a native help dialog with focus management. It respects `prefers-reduced-motion`, and clues use numbers as well as colors. CSS variables define themes and design tokens. Google Fonts have local fallback fonts, so gameplay does not depend on loading external fonts.

## Validation

```bash
npm test              # Game engine and storage tests; no browser required
npm run lint          # ESLint and React hook rules
npm run format:check  # Check formatting
npm run check         # Lint, formatting, unit tests, and production build
```

Install Playwright's Chromium once before running browser tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright starts the development server automatically and checks desktop and mobile flows: safe first click, timer, flags, difficulties, keyboard navigation, help, narrow screens, theme, winning, losing, and saved records.

```bash
npm run format        # Format source files
npm run build         # Generate the production build in dist/
npm run preview       # Preview at http://127.0.0.1:4173
```

For static hosting, publish the contents of `dist/`. No backend, account, or environment variables are required.

## Fixes to the original version

The static React demo and separate DOM implementation are replaced by one working game. Fixes include the broken flag class access, inconsistent flag class names, neighbor counts at board edges, removing flags at the flag limit, and updating the remaining-flags counter. Revealing the last safe cell now wins the game. The timer stops at the end of a game, and inline messages replace blocking alerts.

React and Vite replace the old React 17, Parcel 1, Babel configuration, and styled-components setup. References: [React documentation](https://react.dev/versions) and [Vite requirements](https://vite.dev/guide/).
