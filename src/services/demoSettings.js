// Demonstration settings for testing edge cases (FR14 / Task 6).
// They are stored in localStorage so they survive a reload,
// and are controlled from the clearly labelled "Demo controls" panel in the footer.

const KEY = 'sectorSpoon.demo';

const DEFAULTS = {
  failNextLoad: false, // the next menu load rejects with an error
  emptyMenu: false, // the loader returns an empty dataset
  reducedStock: false, // simulates other customers buying: some dishes drop in stock
};

export function readDemoSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeDemoSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode) - demo settings just won't persist.
  }
}
