import { useRef, useState } from 'react';
import { Cell } from '../atoms/Cell.jsx';
import { DIFFICULTIES } from '../../game/engine.js';

export function Board({ game, onReveal, onFlag, onChord }) {
  const { rows, columns } = DIFFICULTIES[game.difficulty];
  const [focusedId, setFocusedId] = useState(0);
  const boardRef = useRef(null);

  function handleKeyDown(event) {
    const id = Number(event.target.dataset.cellId);
    if (!Number.isInteger(id)) return;
    const row = Math.floor(id / columns);
    const column = id % columns;
    const destinations = {
      ArrowUp: Math.max(0, row - 1) * columns + column,
      ArrowDown: Math.min(rows - 1, row + 1) * columns + column,
      ArrowLeft: row * columns + Math.max(0, column - 1),
      ArrowRight: row * columns + Math.min(columns - 1, column + 1),
      Home: event.ctrlKey ? 0 : row * columns,
      End: event.ctrlKey ? rows * columns - 1 : (row + 1) * columns - 1,
    };
    if (destinations[event.key] === undefined) return;
    event.preventDefault();
    boardRef.current
      .querySelector(`[data-cell-id="${destinations[event.key]}"]`)
      ?.focus();
  }

  return (
    <div className="board-scroll">
      <div
        ref={boardRef}
        className={`board board--${game.difficulty}`}
        role="group"
        aria-label={`Minesweeper board: ${rows} rows and ${columns} columns`}
        aria-describedby="board-instructions"
        style={{ '--columns': columns }}
        onKeyDown={handleKeyDown}
      >
        {game.board.map((cell) => (
          <Cell
            key={cell.id}
            cell={cell}
            columns={columns}
            status={game.status}
            exploded={game.explodedId === cell.id}
            focused={focusedId === cell.id}
            onFocus={setFocusedId}
            onReveal={onReveal}
            onFlag={onFlag}
            onChord={onChord}
          />
        ))}
      </div>
    </div>
  );
}
