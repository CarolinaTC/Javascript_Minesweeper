export const DIFFICULTIES = Object.freeze({
  beginner: { label: 'Beginner', rows: 9, columns: 9, mines: 10 },
  intermediate: { label: 'Intermediate', rows: 16, columns: 16, mines: 40 },
  expert: { label: 'Expert', rows: 16, columns: 30, mines: 99 },
});

export function createGame(difficulty = 'beginner', seed = 0) {
  if (!Object.hasOwn(DIFFICULTIES, difficulty)) {
    throw new RangeError('Unknown difficulty.');
  }
  const { rows, columns } = DIFFICULTIES[difficulty];
  return {
    difficulty,
    seed,
    status: 'ready',
    startedAt: null,
    finishedAt: null,
    explodedId: null,
    board: Array.from({ length: rows * columns }, (_, id) => ({
      id,
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  };
}

export function neighbors(id, rows, columns) {
  const row = Math.floor(id / columns);
  const column = id % columns;
  const result = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const nextRow = row + dr;
      const nextColumn = column + dc;
      if (
        (dr || dc) &&
        nextRow >= 0 &&
        nextRow < rows &&
        nextColumn >= 0 &&
        nextColumn < columns
      ) {
        result.push(nextRow * columns + nextColumn);
      }
    }
  }
  return result;
}

// A seeded generator keeps reducer transitions deterministic, including in StrictMode.
function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function populate(game, firstId) {
  const { rows, columns, mines } = DIFFICULTIES[game.difficulty];
  const safe = new Set([firstId, ...neighbors(firstId, rows, columns)]);
  const candidates = game.board
    .filter((cell) => !safe.has(cell.id))
    .map((cell) => cell.id);
  const random = seededRandom(game.seed);
  const board = game.board.map((cell) => ({ ...cell }));

  // Partial Fisher–Yates: uniform placement, without sorting with a random comparator.
  for (let i = 0; i < mines; i += 1) {
    const j = i + Math.floor(random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    board[candidates[i]].mine = true;
  }
  for (const cell of board) {
    cell.adjacent = neighbors(cell.id, rows, columns).filter(
      (id) => board[id].mine,
    ).length;
  }
  return board;
}

function isFinished(game) {
  return game.status === 'won' || game.status === 'lost';
}

export function revealCell(game, id, now) {
  if (
    isFinished(game) ||
    !game.board[id] ||
    game.board[id].flagged ||
    game.board[id].revealed
  )
    return game;
  const { rows, columns } = DIFFICULTIES[game.difficulty];
  const board =
    game.status === 'ready'
      ? populate(game, id)
      : game.board.map((cell) => ({ ...cell }));
  const next = {
    ...game,
    board,
    status: 'playing',
    startedAt: game.startedAt ?? now,
  };

  if (board[id].mine) {
    board[id].revealed = true;
    return { ...next, status: 'lost', finishedAt: now, explodedId: id };
  }

  // Iterative flood fill avoids recursive stack overflows and asynchronous races.
  const queue = [id];
  for (let i = 0; i < queue.length; i += 1) {
    const cell = board[queue[i]];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) queue.push(...neighbors(cell.id, rows, columns));
  }

  if (board.every((cell) => cell.mine || cell.revealed)) {
    for (const cell of board) if (cell.mine) cell.flagged = true;
    return { ...next, status: 'won', finishedAt: now };
  }
  return next;
}

export function toggleFlag(game, id) {
  const cell = game.board[id];
  if (isFinished(game) || !cell || cell.revealed) return game;
  const flagCount = game.board.filter((item) => item.flagged).length;
  if (!cell.flagged && flagCount >= DIFFICULTIES[game.difficulty].mines)
    return game;
  return {
    ...game,
    board: game.board.map((item) =>
      item.id === id ? { ...item, flagged: !item.flagged } : item,
    ),
  };
}

export function chordCell(game, id, now) {
  const cell = game.board[id];
  if (isFinished(game) || !cell?.revealed || cell.adjacent === 0) return game;
  const { rows, columns } = DIFFICULTIES[game.difficulty];
  const nearby = neighbors(id, rows, columns);
  if (
    nearby.filter((index) => game.board[index].flagged).length !== cell.adjacent
  )
    return game;
  return nearby.reduce((state, index) => revealCell(state, index, now), game);
}

export function gameReducer(game, action) {
  switch (action.type) {
    case 'reveal':
      return revealCell(game, action.id, action.now);
    case 'flag':
      return toggleFlag(game, action.id);
    case 'chord':
      return chordCell(game, action.id, action.now);
    case 'reset':
      return createGame(action.difficulty, action.seed);
    default:
      return game;
  }
}

export function elapsedSeconds(game, now) {
  if (game.startedAt === null) return 0;
  return Math.max(
    0,
    Math.floor(((game.finishedAt ?? now) - game.startedAt) / 1000),
  );
}

export function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
