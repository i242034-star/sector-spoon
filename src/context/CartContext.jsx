import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useMenu } from './MenuContext.jsx';
import { maxAllowedQuantity } from '../rules/orderRules.js';
import { readStorage, writeStorage } from '../services/storage.js';

const CartContext = createContext(null);

const CART_KEY = 'sectorSpoon.cart';
const PREFS_KEY = 'sectorSpoon.prefs';

const DEFAULT_PREFS = { method: 'delivery', zoneId: '', allergies: [] };

// A cart line is one dish + one spice choice. The same dish with two
// different spice levels becomes two lines.
const makeLineId = (dishId, spice) => (spice ? `${dishId}__${spice}` : dishId);

/** Only keep saved lines that have the expected shape. */
function sanitiseLines(saved) {
  if (!Array.isArray(saved)) return [];
  return saved.filter(
    (line) =>
      line &&
      typeof line.dishId === 'string' &&
      Number.isInteger(line.qty) &&
      line.qty > 0 &&
      typeof line.lineId === 'string'
  );
}

export function CartProvider({ children }) {
  const { getDish } = useMenu();

  // Lazy initial state: read localStorage only on the first render (FR13).
  const [lines, setLines] = useState(() => sanitiseLines(readStorage(CART_KEY, [])));
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...readStorage(PREFS_KEY, {}) }));

  // Synchronise state -> localStorage whenever it changes.
  useEffect(() => writeStorage(CART_KEY, lines), [lines]);
  useEffect(() => writeStorage(PREFS_KEY, prefs), [prefs]);

  /** Total portions of a dish across all of its lines. */
  const quantityOfDish = useCallback(
    (dishId, exceptLineId) =>
      lines
        .filter((l) => l.dishId === dishId && l.lineId !== exceptLineId)
        .reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  /**
   * Adds portions of a dish, enforcing the availability rule.
   * Returns { ok, message } so the calling component can show feedback.
   */
  const addItem = useCallback(
    (dishId, qty = 1, spice = null) => {
      const dish = getDish(dishId);
      if (!dish) return { ok: false, message: 'This dish is no longer on the menu.' };

      const max = maxAllowedQuantity(dish.portionsLeft);
      const room = max - quantityOfDish(dishId);
      if (room <= 0) {
        return {
          ok: false,
          message: max === 0 ? 'Sold out for today.' : `You already have the maximum of ${max} in your order.`,
        };
      }

      const added = Math.min(qty, room);
      const lineId = makeLineId(dishId, spice);
      setLines((prev) => {
        const existing = prev.find((l) => l.lineId === lineId);
        if (existing) {
          return prev.map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + added } : l));
        }
        return [...prev, { lineId, dishId, spice, qty: added }];
      });

      return added < qty
        ? { ok: true, message: `Only ${added} added - you reached the limit of ${max}.` }
        : { ok: true, message: `${added} × ${dish.name} added to your order.` };
    },
    [getDish, quantityOfDish]
  );

  const updateQuantity = useCallback((lineId, qty) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.lineId !== lineId) : prev.map((l) => (l.lineId === lineId ? { ...l, qty } : l))
    );
  }, []);

  /** Change the spice level of a line; merges into an existing line with that spice. */
  const changeSpice = useCallback((lineId, spice) => {
    setLines((prev) => {
      const line = prev.find((l) => l.lineId === lineId);
      if (!line) return prev;
      const newId = makeLineId(line.dishId, spice);
      const target = prev.find((l) => l.lineId === newId);
      if (target) {
        return prev
          .filter((l) => l.lineId !== lineId)
          .map((l) => (l.lineId === newId ? { ...l, qty: l.qty + line.qty } : l));
      }
      return prev.map((l) => (l.lineId === lineId ? { ...l, spice, lineId: newId } : l));
    });
  }, []);

  const removeLine = useCallback((lineId) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const removeDish = useCallback((dishId) => {
    setLines((prev) => prev.filter((l) => l.dishId !== dishId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const updatePrefs = useCallback((changes) => setPrefs((prev) => ({ ...prev, ...changes })), []);

  const value = {
    lines,
    prefs,
    addItem,
    updateQuantity,
    changeSpice,
    removeLine,
    removeDish,
    clearCart,
    updatePrefs,
    quantityOfDish,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
