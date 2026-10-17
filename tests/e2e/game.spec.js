import { test, expect } from '@playwright/test';
import { createGame, revealCell } from '../../src/game/engine.js';

test('starts safely, runs the clock, and resets', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Minesweeper — A moment to think');
  await expect(
    page.getByRole('heading', { name: 'A moment to think.' }),
  ).toBeVisible();
  await expect(page.locator('.cell')).toHaveCount(81);
  await expect(page.locator('.cell--revealed')).toHaveCount(0);
  await page.locator('[data-cell-id="40"]').click();
  await expect(page.locator('.cell--revealed').first()).toBeVisible();
  await expect(page.locator('.game-status')).toContainText('Follow the clues.');
  await expect(page.locator('.stat__value').nth(1)).not.toHaveText('00:00', {
    timeout: 4000,
  });
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(page.locator('.cell--revealed')).toHaveCount(0);
  await expect(page.locator('.stat__value').nth(1)).toHaveText('00:00');
  await expect(page.getByRole('status')).toContainText('The field is yours.');
  expect(errors).toEqual([]);
});

test('flag mode works with taps and removes flags at the limit', async ({
  page,
}) => {
  await page.goto('/');
  const first = page.locator('[data-cell-id="0"]');
  await first.click({ button: 'right' });
  await expect(first).toHaveAttribute('aria-label', /flagged/);
  await first.click({ button: 'right' });
  await expect(page.locator('.cell--flagged')).toHaveCount(0);
  await page.getByRole('button', { name: 'Flag', exact: true }).click();
  for (let id = 0; id < 10; id += 1)
    await page.locator(`[data-cell-id="${id}"]`).click();
  await expect(page.locator('.stat__value').first()).toHaveText('00');
  await page.locator('[data-cell-id="10"]').click();
  await expect(page.locator('.cell--flagged')).toHaveCount(10);
  await page.locator('[data-cell-id="0"]').click();
  await expect(page.locator('.cell--flagged')).toHaveCount(9);
  await expect(page.locator('.stat__value').first()).toHaveText('01');
});

test('difficulty changes board dimensions and keeps the page within the viewport', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Difficulty').selectOption('intermediate');
  await expect(page.locator('.cell')).toHaveCount(256);
  await page.getByLabel('Difficulty').selectOption('expert');
  await expect(page.locator('.cell')).toHaveCount(480);
  await expect(page.locator('.stat__value').first()).toHaveText('99');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const scroll = page.locator('.board-scroll');
  expect(await scroll.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
    true,
  );
  await scroll.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  await expect(page.locator('[data-cell-id="29"]')).toBeInViewport();
});

test('keyboard navigation, flagging and revealing work', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-cell-id="0"]');
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-cell-id="1"]')).toBeFocused();
  await page.keyboard.press('f');
  await expect(page.locator('[data-cell-id="1"]')).toHaveAttribute(
    'aria-label',
    /flagged/,
  );
  await page.keyboard.press('f');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-cell-id="1"]')).toHaveClass(
    /cell--revealed/,
  );
});

test('help traps focus, closes with Escape and restores focus', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'How to play' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close help' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Let’s play' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close help' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('theme persists after reload and invalid records do not crash the app', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('minesweeper.records.v1', 'invalid-json'),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Switch to light mode' }),
  ).toBeVisible();
  await expect(page.locator('.stat__value').nth(2)).toHaveText('— —');
});

test('help remains accessible and the layout fits at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Let’s play' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('winning stops the clock, saves the record and survives reload', async ({
  page,
}) => {
  await page.addInitScript(() => {
    crypto.getRandomValues = (array) => {
      array[0] = 42;
      return array;
    };
  });
  await page.goto('/');
  const reference = revealCell(createGame('beginner', 42), 40, 1000);
  await page.locator('[data-cell-id="40"]').click();
  for (const cell of reference.board.filter(
    (cell) => !cell.mine && !cell.revealed,
  )) {
    await page.locator(`[data-cell-id="${cell.id}"]`).click();
  }
  await expect(page.getByRole('status')).toContainText(
    'All clear. Nicely done!',
  );
  await expect(page.locator('.stat__value').first()).toHaveText('00');
  const time = await page.locator('.stat__value').nth(1).textContent();
  await expect(page.locator('.stat__value').nth(2)).toHaveText(time);
  await expect(page.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '71',
  );
  await page.reload();
  await expect(page.locator('.stat__value').nth(2)).toHaveText(time);
});

test('losing reveals mines, keeps the clock stopped and allows a new game', async ({
  page,
}) => {
  await page.addInitScript(() => {
    crypto.getRandomValues = (array) => {
      array[0] = 42;
      return array;
    };
  });
  await page.goto('/');
  const reference = revealCell(createGame('beginner', 42), 40, 1000);
  await page.locator('[data-cell-id="40"]').click();
  const mine = reference.board.find((cell) => cell.mine);
  await page.locator(`[data-cell-id="${mine.id}"]`).click();
  await expect(page.getByRole('status')).toContainText('A mine along the way.');
  await expect(page.locator('.cell[aria-label$=": mine"]')).toHaveCount(10);
  const time = await page.locator('.stat__value').nth(1).textContent();
  await page.waitForTimeout(1100);
  await expect(page.locator('.stat__value').nth(1)).toHaveText(time);
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('.cell--revealed')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('The field is yours.');
});
