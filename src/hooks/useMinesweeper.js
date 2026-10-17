import { useCallback, useEffect, useReducer, useState } from 'react';
import { createGame, elapsedSeconds, gameReducer } from '../game/engine.js';
import { readRecords, saveRecords } from '../game/storage.js';

function newSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function useMinesweeper() {
  const [game, dispatch] = useReducer(gameReducer, undefined, () =>
    createGame('beginner', newSeed()),
  );
  const [now, setNow] = useState(Date.now);
  const [records, setRecords] = useState(() => readRecords());

  useEffect(() => {
    if (game.status !== 'playing') return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [game.status]);

  useEffect(() => {
    if (game.status !== 'won') return;
    const seconds = elapsedSeconds(game, game.finishedAt);
    setRecords((previous) => {
      const best = previous[game.difficulty];
      if (best !== undefined && best <= seconds) return previous;
      return { ...previous, [game.difficulty]: seconds };
    });
  }, [game]);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const reset = useCallback((difficulty) => {
    dispatch({ type: 'reset', difficulty, seed: newSeed() });
    setNow(Date.now());
  }, []);
  const reveal = useCallback(
    (id) => dispatch({ type: 'reveal', id, now: Date.now() }),
    [],
  );
  const flag = useCallback((id) => dispatch({ type: 'flag', id }), []);
  const chord = useCallback(
    (id) => dispatch({ type: 'chord', id, now: Date.now() }),
    [],
  );

  return {
    game,
    records,
    seconds: elapsedSeconds(game, now),
    reset,
    reveal,
    flag,
    chord,
  };
}
