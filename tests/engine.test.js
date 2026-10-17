import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DIFFICULTIES,
  createGame,
  neighbors,
  revealCell,
  toggleFlag,
  chordCell,
  gameReducer,
  elapsedSeconds,
  formatTime,
} from '../src/game/engine.js';

function fixture(mines = [0]) {
  const game = createGame('beginner', 42);
  game.status = 'playing';
  game.startedAt = 1000;
  game.board = game.board.map((cell) => ({
    ...cell,
    mine: mines.includes(cell.id),
    adjacent: neighbors(cell.id, 9, 9).filter((id) => mines.includes(id))
      .length,
  }));
  return game;
}

test('creates an empty board and rejects unknown difficulties', () => {
  const game = createGame();
  assert.equal(game.status, 'ready');
  assert.equal(game.board.length, 81);
  assert.ok(
    game.board.every((cell) => !cell.mine && !cell.revealed && !cell.flagged),
  );
  assert.throws(() => createGame('missing'), RangeError);
  assert.throws(() => createGame('toString'), RangeError);
});

test('neighbors respect every corner and never wrap across rows', () => {
  assert.deepEqual(neighbors(0, 3, 4), [1, 4, 5]);
  assert.deepEqual(neighbors(3, 3, 4), [2, 6, 7]);
  assert.deepEqual(neighbors(8, 3, 4), [4, 5, 9]);
  assert.deepEqual(neighbors(11, 3, 4), [6, 7, 10]);
  assert.deepEqual(neighbors(5, 3, 4), [0, 1, 2, 4, 6, 8, 9, 10]);
});

for (const [difficulty, config] of Object.entries(DIFFICULTIES)) {
  test(`${difficulty}: correct mine counts and all neighbor numbers across 20 seeds`, () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const firstId = (seed * 17) % (config.rows * config.columns);
      const before = createGame(difficulty, seed);
      const game = revealCell(before, firstId, 1000);
      assert.equal(game.board.filter((cell) => cell.mine).length, config.mines);
      assert.ok(!game.board[firstId].mine && game.board[firstId].revealed);
      assert.equal(game.board[firstId].adjacent, 0);
      assert.ok(
        neighbors(firstId, config.rows, config.columns).every(
          (id) => !game.board[id].mine,
        ),
      );
      for (const cell of game.board) {
        assert.equal(
          cell.adjacent,
          neighbors(cell.id, config.rows, config.columns).filter(
            (id) => game.board[id].mine,
          ).length,
        );
      }
      assert.ok(before.board.every((cell) => !cell.mine && !cell.revealed));
    }
  });
}

test('the same seed and action produce identical results without mutating state', () => {
  const original = createGame('beginner', 129);
  const action = { type: 'reveal', id: 40, now: 0 };
  assert.deepEqual(
    gameReducer(original, action),
    gameReducer(original, action),
  );
  assert.equal(original.status, 'ready');
});

test('flood fill opens empty areas and boundary numbers without revealing mines', () => {
  const game = revealCell(fixture(), 80, 2000);
  assert.equal(game.status, 'won');
  assert.equal(game.board.filter((cell) => cell.revealed).length, 80);
  assert.equal(game.board[0].revealed, false);
  assert.equal(game.board[0].flagged, true);
});

test('flood fill leaves flagged safe cells untouched until the flag is removed', () => {
  let game = toggleFlag(fixture(), 80);
  game = revealCell(game, 40, 2000);
  assert.equal(game.status, 'playing');
  assert.equal(game.board[80].revealed, false);
  game = revealCell(toggleFlag(game, 80), 80, 3000);
  assert.equal(game.status, 'won');
});

test('can remove a flag even when the full flag allowance is used', () => {
  let game = createGame();
  for (let id = 0; id < 10; id += 1) game = toggleFlag(game, id);
  assert.strictEqual(toggleFlag(game, 10), game);
  game = toggleFlag(game, 0);
  assert.equal(game.board.filter((cell) => cell.flagged).length, 9);
  assert.equal(
    toggleFlag(game, 10).board.filter((cell) => cell.flagged).length,
    10,
  );
  assert.equal(game.startedAt, null);
});

test('clicking a flag does not start a game or place mines', () => {
  const game = toggleFlag(createGame(), 0);
  assert.strictEqual(revealCell(game, 0, 1000), game);
  assert.ok(game.board.every((cell) => !cell.mine));
});

test('all correct flags alone do not win; revealing all safe cells does', () => {
  const game = toggleFlag(fixture(), 0);
  assert.equal(game.status, 'playing');
  assert.equal(revealCell(game, 80, 10000).status, 'won');
});

test('revealing the last numbered safe cell wins', () => {
  const game = fixture();
  game.board.forEach((cell) => {
    cell.revealed = !cell.mine && cell.id !== 1;
  });
  assert.equal(revealCell(game, 1, 2000).status, 'won');
});

test('hitting a mine ends the game and freezes every interaction', () => {
  const game = revealCell(fixture(), 0, 4000);
  assert.equal(game.status, 'lost');
  assert.equal(game.explodedId, 0);
  assert.equal(game.finishedAt, 4000);
  assert.strictEqual(toggleFlag(game, 2), game);
  assert.strictEqual(revealCell(game, 3, 6000), game);
  assert.strictEqual(chordCell(game, 1, 6000), game);
});

test('a won game ignores interactions', () => {
  const game = revealCell(fixture(), 80, 2000);
  assert.strictEqual(revealCell(game, 0, 3000), game);
  assert.strictEqual(toggleFlag(game, 0), game);
});

test('chording reveals neighbors only when flag count matches the number', () => {
  let game = revealCell(fixture(), 1, 2000);
  assert.strictEqual(chordCell(game, 1, 3000), game);
  game = toggleFlag(game, 0);
  assert.equal(chordCell(game, 1, 3000).status, 'won');
});

test('chording with an incorrect flag can hit a mine', () => {
  let game = revealCell(fixture(), 1, 2000);
  game = toggleFlag(game, 2);
  assert.equal(chordCell(game, 1, 3000).status, 'lost');
});

test('invalid cells and actions are ignored', () => {
  const game = createGame();
  assert.strictEqual(revealCell(game, -1, 0), game);
  assert.strictEqual(toggleFlag(game, 1000), game);
  assert.strictEqual(chordCell(game, 1000, 0), game);
  assert.strictEqual(gameReducer(game, { type: 'unknown' }), game);
});

test('reset clears the board, flags and timestamps and changes difficulty', () => {
  const game = revealCell(toggleFlag(createGame(), 0), 40, 1000);
  const reset = gameReducer(game, {
    type: 'reset',
    difficulty: 'expert',
    seed: 42,
  });
  assert.equal(reset.board.length, 480);
  assert.equal(reset.status, 'ready');
  assert.equal(reset.startedAt, null);
  assert.equal(reset.finishedAt, null);
  assert.ok(
    reset.board.every((cell) => !cell.revealed && !cell.flagged && !cell.mine),
  );
});

test('elapsed time starts on first reveal, never becomes negative, and stops at game end', () => {
  assert.equal(elapsedSeconds(createGame(), 20000), 0);
  let game = revealCell(createGame(), 0, 0);
  assert.equal(elapsedSeconds(game, 2500), 2);
  assert.equal(elapsedSeconds(game, -1000), 0);
  game = { ...game, finishedAt: 3999 };
  assert.equal(elapsedSeconds(game, 10000), 3);
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(125), '02:05');
  assert.equal(formatTime(6001), '100:01');
});
