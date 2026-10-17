import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readRecords } from '../src/game/storage.js';

test('reads valid records including zero-second games', () => {
  assert.deepEqual(
    readRecords({ getItem: () => '{"beginner":0,"expert":110}' }),
    { beginner: 0, expert: 110 },
  );
});

test('ignores corrupt data, invalid records, and unrelated properties', () => {
  assert.deepEqual(readRecords({ getItem: () => '{oops' }), {});
  assert.deepEqual(readRecords({ getItem: () => null }), {});
  assert.deepEqual(
    readRecords({
      getItem: () =>
        '{"beginner":-1,"intermediate":"42","expert":12.5,"other":4}',
    }),
    {},
  );
});

test('blocked storage does not prevent playing', () => {
  assert.deepEqual(
    readRecords({
      getItem: () => {
        throw new Error('Blocked');
      },
    }),
    {},
  );
});
