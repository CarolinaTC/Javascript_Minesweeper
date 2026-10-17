const RECORDS_KEY = 'minesweeper.records.v1';
const THEME_KEY = 'minesweeper.theme';

export function readRecords(storage) {
  try {
    const data = JSON.parse(
      (storage ?? globalThis.localStorage).getItem(RECORDS_KEY),
    );
    return Object.fromEntries(
      ['beginner', 'intermediate', 'expert']
        .filter((key) => Number.isInteger(data?.[key]) && data[key] >= 0)
        .map((key) => [key, data[key]]),
    );
  } catch {
    return {};
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    /* Play still works when storage is unavailable. */
  }
}

export function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* Theme remains available for this session. */
  }
}
