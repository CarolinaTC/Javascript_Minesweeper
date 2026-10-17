import { useEffect, useState } from 'react';
import { Icon } from './components/atoms/Icon.jsx';
import { Button } from './components/atoms/Button.jsx';
import { GameFace } from './components/atoms/GameFace.jsx';
import { Stat } from './components/molecules/Stat.jsx';
import { DifficultyPicker } from './components/molecules/DifficultyPicker.jsx';
import { InteractionMode } from './components/molecules/InteractionMode.jsx';
import { Board } from './components/organisms/Board.jsx';
import { HowToPlay } from './components/organisms/HowToPlay.jsx';
import { HelpDialog } from './components/organisms/HelpDialog.jsx';
import { useMinesweeper } from './hooks/useMinesweeper.js';
import { DIFFICULTIES, formatTime } from './game/engine.js';
import { readTheme, saveTheme } from './game/storage.js';

const STATUS = {
  ready: {
    title: 'The field is yours.',
    text: 'Pick a cell to get started.',
    icon: 'pointer',
  },
  playing: {
    title: 'Follow the clues.',
    text: 'Every number brings you closer.',
    icon: 'mine',
  },
  won: {
    title: 'All clear. Nicely done!',
    text: 'You uncovered every safe cell.',
    icon: 'trophy',
  },
  lost: {
    title: 'A mine along the way.',
    text: 'Take a breath. A fresh field awaits.',
    icon: 'mine',
  },
};

export function App() {
  const { game, seconds, records, reset, reveal, flag, chord } =
    useMinesweeper();
  const [mode, setMode] = useState('reveal');
  const [theme, setTheme] = useState(readTheme);
  const [helpOpen, setHelpOpen] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const level = DIFFICULTIES[game.difficulty];
  const flagsLeft =
    level.mines - game.board.filter((cell) => cell.flagged).length;
  const safeTotal = game.board.length - level.mines;
  const revealed = game.board.filter(
    (cell) => cell.revealed && !cell.mine,
  ).length;
  const progress = Math.round((revealed / safeTotal) * 100);
  const status = STATUS[game.status];
  const best = records[game.difficulty];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  function startNewGame(difficulty = game.difficulty) {
    reset(difficulty);
    setMode('reveal');
    setBoardKey((key) => key + 1);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#game">
        Skip to the game
      </a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Minesweeper home">
          <span className="brand__mark">
            <Icon name="mine" size={23} />
          </span>
          <span>
            mine<span className="brand__light">sweeper</span>
            <span className="brand__dot">.</span>
          </span>
          <span className="brand__edition" aria-hidden="true">
            LOGIC ARCADE
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            type="button"
            className="help-trigger"
            aria-label="How to play"
            onClick={() => setHelpOpen(true)}
          >
            <Icon name="help" size={18} />
            <span>How to play</span>
          </button>
          <span className="nav-divider" />
          <Button
            variant="icon"
            aria-label={
              theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={19} />
          </Button>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div>
            <span className="eyebrow hero__eyebrow">
              <span className="live-dot" /> SMALL FIELD. BIG BRAIN ENERGY.
            </span>
            <h1 id="page-title">
              A moment to <span>think.</span>
            </h1>
            <p>Dodge the mines. Trust the clues. Beat your best.</p>
          </div>
          <span className="hero__badge">
            <Icon name="shield" size={17} /> First click is safe
          </span>
        </section>

        <div className="game-layout">
          <section
            id="game"
            className={`game-card game-card--${game.status}`}
            aria-label="Minesweeper game"
          >
            <div className="console-header">
              <span className="console-header__title">
                <span className="console-lights" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                FIELD CONSOLE / 01
              </span>
              <GameFace status={game.status} />
              <span className="console-header__player">1P</span>
            </div>
            <div className="game-toolbar">
              <DifficultyPicker
                value={game.difficulty}
                onChange={startNewGame}
              />
              <Button onClick={() => startNewGame()}>
                <Icon name="reset" size={17} />
                New game
              </Button>
            </div>
            <div className="stats-row">
              <Stat
                icon="flag"
                label="Flags"
                value={String(flagsLeft).padStart(2, '0')}
                accent
              />
              <Stat icon="clock" label="Time" value={formatTime(seconds)} />
              <Stat
                icon="trophy"
                label="Best time"
                value={best === undefined ? '— —' : formatTime(best)}
              />
            </div>

            <div className={`game-surface game-surface--${game.status}`}>
              <div className="board-meta">
                <span>
                  <span className={`status-dot status-dot--${game.status}`} />
                  {game.status === 'ready'
                    ? 'READY WHEN YOU ARE'
                    : game.status === 'playing'
                      ? 'GAME IN PROGRESS'
                      : game.status === 'won'
                        ? 'ALL CLEAR'
                        : 'GAME OVER'}
                </span>
                <span>
                  {level.rows} × {level.columns}
                  <span className="meta-divider">/</span>
                  {level.mines} mines
                </span>
              </div>
              <Board
                key={boardKey}
                game={game}
                onReveal={mode === 'flag' ? flag : reveal}
                onFlag={flag}
                onChord={mode === 'flag' ? undefined : chord}
              />
              <div className="board-bottom">
                <span id="board-instructions">
                  <Icon name="pointer" size={14} />
                  <span>Click to reveal. Flag to protect.</span>
                </span>
                <InteractionMode mode={mode} onChange={setMode} />
              </div>
            </div>

            <div
              className="game-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span
                className={`game-status__icon game-status__icon--${game.status}`}
              >
                <Icon name={status.icon} size={20} />
              </span>
              <div>
                <h2>{status.title}</h2>
                <p>{status.text}</p>
              </div>
              {(game.status === 'won' || game.status === 'lost') && (
                <Button
                  variant="secondary"
                  className="play-again"
                  onClick={() => startNewGame()}
                >
                  Play again
                  <Icon name="arrow" size={16} />
                </Button>
              )}
            </div>
            <div className="progress-area">
              <div className="progress-label">
                <span>Field explored</span>
                <span>
                  {revealed}
                  <span className="progress-label__total">
                    {' '}
                    / {safeTotal} cells
                  </span>
                  <strong>{progress}%</strong>
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Safe cells revealed"
                aria-valuemin={0}
                aria-valuemax={safeTotal}
                aria-valuenow={revealed}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </section>

          <aside className="sidebar">
            <section className="how-to">
              <HowToPlay />
            </section>
            <div className="tip">
              <span className="tip__label">
                <span>✳</span> POWER-UP YOUR LOGIC
              </span>
              <p>
                All nearby mines flagged? Click the number to clear the rest.
              </p>
              <span className="tip__footer">
                Good clues. Great moves.
                <Icon name="arrow" size={18} />
              </span>
            </div>
          </aside>
        </div>

        <div className="below-game">
          <span>
            <Icon name="keyboard" size={17} />
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <kbd>←</kbd>
              <kbd>→</kbd> navigate <span className="shortcut-divider">·</span>{' '}
              <kbd>Enter</kbd> reveal{' '}
              <span className="shortcut-divider">·</span> <kbd>F</kbd> flag
            </span>
          </span>
          <span>
            <span className="local-dot" />
            Your best times stay on this device.
          </span>
        </div>
      </main>
      <footer className="site-footer">
        <span>Old-school rules. One more round.</span>
        <span>
          A little workout for your mind<span className="footer-spark">✳</span>
        </span>
      </footer>
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
