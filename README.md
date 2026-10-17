# Minesweeper

A modern take on a classic browser game, rebuilt from a JavaScript project originally created in **2021**. This version turns the original static React demo and separate DOM implementation into one playable, responsive application, with corrected game rules, an arcade interface, keyboard and touch controls, and automated tests.

Built with **React 19, Vite 8, and JavaScript ES modules**, with reusable components organized using Atomic Design and a game engine independent of the UI.

## Features

### Gameplay

- **Three difficulty levels:** Beginner (9 × 9, 10 mines), Intermediate (16 × 16, 40 mines), and Expert (16 × 30, 99 mines).
- **Safe first click:** mines are placed after the first reveal, protecting the selected cell and its surrounding neighbors.
- **Automatic area reveal:** opening an empty cell uncovers connected empty cells and their numbered boundaries.
- **Flags and remaining-flags counter:** place and remove flags without exceeding the number of mines, including removing a flag after reaching the limit.
- **Number-based clues:** each revealed number counts mines in the eight surrounding positions, respecting board edges and corners.
- **Chord reveal:** click a revealed number to open its remaining neighbors when the adjacent flag count matches the clue. Incorrect flags can still lead to a loss.
- **Complete win and loss states:** uncover every safe cell to win; mines are automatically flagged on victory. Losing reveals the mines, highlights the triggered mine, and marks incorrect flags. Board actions stop after either outcome.
- **Elapsed-time tracking:** the timer starts on the first reveal and stops when the game ends.
- **Personal bests:** the fastest completed time is saved separately for each difficulty in the current browser.
- **Fresh games:** restart at any time or select a different difficulty to reset the board and timer.

### Interface and accessibility

- **Arcade presentation:** beveled tiles, digital counters, a framed game console, and a face that reacts to the current game state.
- **Light and dark themes:** the selected theme is remembered between visits.
- **Responsive layout:** supports desktop and mobile screens, with horizontal scrolling inside larger boards.
- **Mouse and touch controls:** reveal cells with a click or tap, flag with the right mouse button, or switch between Reveal and Flag modes on mobile.
- **Keyboard navigation:** arrow keys, Home/End, and Ctrl+Home/End move around the board; Enter/Space activate a cell; F toggles flags.
- **Accessible feedback:** native buttons, descriptive cell labels, visible focus indicators, a skip link, and live game-status announcements.
- **Built-in help:** a keyboard-accessible dialog with focus containment, Escape-to-close behavior, and focus restoration.
- **Readable clues:** numbers communicate information alongside color, and reduced-motion preferences disable transitions.
- **Progress tracking:** a progress bar and cell count show how much of the safe area has been revealed.
- **English throughout:** interface copy, help, accessibility labels, metadata, source comments, and documentation.
- **Resilient local storage:** malformed records and unavailable storage do not prevent gameplay. Records and theme preferences stay in the browser; no account or backend is required.

## Run locally

Requires **Node.js 22.13 or later** and npm. Node 18 cannot run the updated development tools. If you use [nvm](https://github.com/nvm-sh/nvm):

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

| Layer       | Responsibility                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Atoms       | Reusable buttons, icons, individual cells, and the game-state face.                                  |
| Molecules   | Composed controls and indicators: difficulty selection, interaction mode, and statistics.            |
| Organisms   | Complete interface sections: the board, game instructions, and help dialog.                          |
| Game engine | Board creation, mine placement, neighbor counting, revealing, flagging, chording, and game outcomes. |
| Custom hook | Connects the reducer to React, manages the timer, exposes game actions, and updates records.         |
| Storage     | Reads, validates, and saves records and theme preferences with failure handling.                     |

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

## Technical implementation

- **React 19 and Vite 8:** functional components, the modern `createRoot` entry point, React StrictMode, development hot reload, and a production build for static hosting.
- **Pure state transitions:** an immutable reducer handles reveal, flag, chord, and reset actions without depending on React or the DOM.
- **Deterministic mine placement:** a seed comes from the browser's `crypto.getRandomValues`; a seeded generator keeps reducer calculations repeatable, including when StrictMode evaluates them more than once.
- **Partial Fisher–Yates shuffle:** selects distinct mine locations from cells outside the first-click safety zone.
- **Coordinate-based neighbors:** row and column checks handle all three board sizes without hardcoded edge indexes or wrapping across rows.
- **Iterative flood fill:** opens connected empty areas using a queue, avoiding recursive stack growth and delayed reveal callbacks.
- **Timestamp-based timing:** elapsed time comes from start and end timestamps, rather than counting interval ticks. The active timer interval is cleaned up when play stops.
- **Rendering efficiency:** stable action callbacks and memoized cells avoid rerendering every cell on timer updates.
- **Validated persistence:** versioned storage keys, validated record values, and guarded storage reads and writes keep corrupt or blocked storage from breaking the game.
- **CSS design tokens:** shared variables define colors, themes, surfaces, borders, and typography; media queries handle different screen sizes. SVG icons and the game face remain code-based assets.
- **Frontend quality tools:** ESLint checks JavaScript and hook usage; Prettier provides consistent formatting; npm and a committed lockfile provide reproducible dependency installation.
- **Automated testing:** Node's built-in test runner covers the engine and persistence; Playwright exercises the interface in desktop and mobile Chromium configurations.

The interface uses native buttons, labels for individual cells, visible focus, one Tab entry into the board, `aria-live` status announcements, and a native help dialog with focus management. It respects `prefers-reduced-motion`, and clues use numbers as well as colors. CSS variables define themes and design tokens. Google Fonts have local fallback fonts, so gameplay does not depend on loading external fonts.

| Technology              | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| React 19 / React DOM 19 | Component composition and rendering.                       |
| JavaScript ES modules   | Application and game-engine code.                          |
| Vite 8                  | Development server and production bundling.                |
| CSS and SVG             | Responsive styling, themes, icons, and visual game states. |
| Browser `localStorage`  | Theme preference and best times per difficulty.            |
| Node.js test runner     | Unit and regression tests.                                 |
| Playwright              | Desktop and mobile browser tests.                          |
| ESLint / Prettier       | Code checks and consistent formatting.                     |

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

The suite contains **22 unit tests** and **18 browser scenarios**: nine interface flows run in both desktop and mobile configurations. Unit tests also verify mine counts, first-click safety, and neighboring numbers across 20 seeds for each difficulty.

```bash
npm run format        # Format source files
npm run build         # Generate the production build in dist/
npm run preview       # Preview at http://127.0.0.1:4173
```

For static hosting, publish the contents of `dist/`. No backend, account, or environment variables are required.

## Modernizing the 2021 project

This project began as a JavaScript Minesweeper exercise in 2021. The modernization retains the original game concept while updating its architecture, behavior, interface, and development workflow.

| Original implementation                                    | Current implementation                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Static React demo alongside a separate DOM-based game      | One playable React application backed by an independent game engine.                |
| Broken flag class access and inconsistent flag class names | State-driven flags, an updated counter, and correct removal at the flag limit.      |
| Hardcoded neighbor indexes and incorrect edge checks       | Coordinate-based neighbor calculation across all difficulty levels.                 |
| Random sorting and possible first-click losses             | Seeded mine placement with a protected first-click area.                            |
| Recursive, delayed empty-cell opening                      | Iterative flood fill within a deterministic state transition.                       |
| Incomplete victory detection                               | Automatic victory when the last safe cell is revealed.                              |
| A countdown that restarted without ending the game         | An elapsed-time clock that starts with play and stops at the outcome.               |
| Blocking alerts and limited feedback                       | Inline game states, progress indicators, a reactive face, and replay controls.      |
| Fixed-size presentation and limited input support          | Responsive arcade styling, themes, keyboard navigation, and touch controls.         |
| Older tooling and no implemented regression suite          | Updated dependencies, a production build, linting, formatting, and automated tests. |

React and Vite replace the old React 17, Parcel 1, Babel configuration, and styled-components setup. References: [React documentation](https://react.dev/versions) and [Vite requirements](https://vite.dev/guide/).
