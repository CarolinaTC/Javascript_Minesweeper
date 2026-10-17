import { memo } from 'react';
import { Icon } from './Icon.jsx';

export const Cell = memo(function Cell({
  cell,
  columns,
  status,
  exploded,
  focused,
  onReveal,
  onFlag,
  onChord,
  onFocus,
}) {
  const showMine = cell.mine && status === 'lost';
  const wrongFlag = cell.flagged && !cell.mine && status === 'lost';
  const finished = status === 'lost' || status === 'won';
  const row = Math.floor(cell.id / columns) + 1;
  const column = (cell.id % columns) + 1;
  let description = 'hidden';
  if (cell.flagged) description = wrongFlag ? 'incorrect flag' : 'flagged';
  else if (showMine) description = 'mine';
  else if (cell.revealed)
    description = cell.adjacent
      ? `${cell.adjacent} adjacent ${cell.adjacent === 1 ? 'mine' : 'mines'}`
      : 'empty';

  return (
    <button
      type="button"
      className={`cell ${cell.revealed || showMine ? 'cell--revealed' : ''} ${cell.flagged ? 'cell--flagged' : ''} ${exploded || wrongFlag ? 'cell--danger' : ''}`}
      data-number={cell.revealed ? cell.adjacent : undefined}
      data-cell-id={cell.id}
      aria-label={`Row ${row}, column ${column}: ${description}`}
      aria-disabled={finished || undefined}
      tabIndex={focused ? 0 : -1}
      onFocus={() => onFocus(cell.id)}
      onClick={() => (cell.revealed ? onChord?.(cell.id) : onReveal(cell.id))}
      onContextMenu={(event) => {
        event.preventDefault();
        onFlag(cell.id);
      }}
      onKeyDown={(event) => {
        if (event.key.toLowerCase() === 'f') {
          event.preventDefault();
          onFlag(cell.id);
        }
      }}
    >
      {wrongFlag ? (
        <Icon name="close" size={19} />
      ) : cell.flagged ? (
        <Icon name="flag" size={18} />
      ) : showMine ? (
        <Icon name="mine" size={20} />
      ) : cell.revealed && cell.adjacent > 0 ? (
        cell.adjacent
      ) : null}
    </button>
  );
});
