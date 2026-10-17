# Modernize the 2021 Minesweeper game

## Summary

Modernizes a JavaScript Minesweeper project originally created in **2021**, replacing the static React demo and separate DOM-based implementation with one fully playable React application. The branch fixes the original gameplay bugs, separates game logic from rendering, introduces Atomic Design components, and adds an arcade interface, accessibility improvements, and automated regression tests.

## Gameplay and interface

- Add Beginner (9 × 9, 10 mines), Intermediate (16 × 16, 40 mines), and Expert (16 × 30, 99 mines) modes.
- Protect the first revealed cell and its neighbors, open empty areas automatically, and support revealing neighboring cells by clicking numbered clues when the flag count matches.
- Correct flag placement and removal, the remaining-flags counter, edge and corner neighbor counts, and win/loss detection.
- Win when every safe cell is revealed; automatically flag mines on victory. Reveal mines, highlight the triggered cell, and identify incorrect flags after a loss.
- Start the elapsed-time clock on the first reveal and stop it when the game ends; save best times separately for each difficulty.
- Add restart controls, progress indicators, inline outcome messages, and a face that reacts to the game state.
- Introduce a responsive arcade design with light and dark themes, digital counters, beveled tiles, and a scrollable area for larger boards.
- Support mouse, touch, and keyboard controls, including a dedicated flag mode for mobile devices.
- Add descriptive cell labels, visible focus, live status announcements, reduced-motion support, and a help dialog with keyboard focus management.
- Use English throughout the interface, accessibility labels, metadata, and documentation.

## Technical implementation

- Upgrade React 17 to React 19 and replace Parcel 1 and the legacy Babel configuration with Vite 8 and JavaScript ES modules. Require Node.js 22.13 or later.
- Apply Atomic Design to atoms, molecules, and organisms, with `App.jsx` composing the screen.
- Extract a pure, immutable game reducer and a `useMinesweeper` hook for state, timer cleanup, actions, and records.
- Use a browser-generated seed, deterministic randomness, and a partial Fisher–Yates shuffle for mine placement that remains stable under React StrictMode.
- Replace hardcoded board boundaries with coordinate checks and recursive reveal callbacks with iterative flood fill.
- Calculate elapsed time from timestamps; use stable callbacks and memoized cells to reduce rendering during timer updates.
- Validate saved records and handle unavailable or corrupt `localStorage` without interrupting gameplay.
- Replace styled-components with CSS design tokens and responsive styles; retain code-based SVG assets.
- Add ESLint, Prettier, a committed npm lockfile, build scripts, and local development documentation.

## Validation

- `npm run check`: lint, formatting, 22 unit tests, and the production build.
- `npm run test:e2e`: 18 browser scenarios across desktop and mobile Chromium configurations.
- Engine tests verify mine placement, safe first clicks, and neighboring numbers across 60 seeded boards, along with flags, flood fill, chording, game outcomes, resets, and timer behavior.
- Browser coverage includes gameplay, records, themes, right-click and touch-mode flags, keyboard navigation, help focus, and a 320 px layout.

## Compatibility

- Requires Node.js 22.13 or later for development and build commands.
- Uses npm and `package-lock.json` in place of the old Yarn lockfile.
- Saves records and theme preferences in the current browser; no backend or account is required.
- Produces a static build in `dist/` for hosting.
