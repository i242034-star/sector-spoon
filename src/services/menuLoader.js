// Asynchronous mock loader. Simulates fetching today's menu from a server.
import { menu } from '../data/menu.js';
import { readDemoSettings, writeDemoSettings } from './demoSettings.js';

const DELAY_MS = 700;

// Stock values used when the "reduced stock" demo is on.
const REDUCED_STOCK = {
  'chicken-tikka-roll': 0,
  'beef-biryani': 2,
  'falafel-bowl': 1,
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads the menu. Returns a promise that resolves with a fresh copy of the data
 * (so the original array is never mutated) or rejects with an Error.
 */
export async function loadMenu() {
  await wait(DELAY_MS);
  const demo = readDemoSettings();

  if (demo.failNextLoad) {
    // The flag is cleared by MenuProvider (clearSimulatedFailure) once the
    // error is actually shown, so "Try again" then demonstrates a working retry.
    throw new Error('The kitchen server did not respond (simulated network failure).');
  }

  if (demo.emptyMenu) return [];

  return menu.map((dish) =>
    demo.reducedStock && dish.id in REDUCED_STOCK
      ? { ...dish, portionsLeft: REDUCED_STOCK[dish.id] }
      : { ...dish }
  );
}

/** Turns off the one-time simulated failure after it has been displayed. */
export function clearSimulatedFailure() {
  writeDemoSettings({ ...readDemoSettings(), failNextLoad: false });
}

/** Simulated order submission - nothing is sent anywhere. */
export async function submitOrder(orderSummary) {
  await wait(900);
  const orderNumber = `SS-${Date.now().toString().slice(-6)}`;
  return { ...orderSummary, orderNumber, placedAt: new Date().toISOString() };
}
