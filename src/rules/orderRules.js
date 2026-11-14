// Business-rule functions for Sector Spoon.
// These are plain JavaScript (no React) so they can be used by the app
// AND tested directly with Node's built-in test runner (tests/orderRules.test.js).

/* ------------------------------------------------------------------ */
/* Rule 1 - Availability / capacity                                    */
/* A customer may order at most MAX_PER_ITEM portions of one dish, and */
/* never more than the portions left today.                            */
/* ------------------------------------------------------------------ */
export const MAX_PER_ITEM = 8;

/**
 * Highest quantity allowed for one dish.
 * @param {number} portionsLeft today's remaining portions
 */
export function maxAllowedQuantity(portionsLeft) {
  return Math.max(0, Math.min(MAX_PER_ITEM, portionsLeft));
}

/**
 * Checks a total quantity of one dish against the availability rule.
 * @returns {{ ok: boolean, max: number, message: string }}
 */
export function checkQuantity(quantity, portionsLeft) {
  const max = maxAllowedQuantity(portionsLeft);

  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, max, message: 'Quantity must be at least 1.' };
  }
  if (max === 0) {
    return { ok: false, max, message: 'Sold out for today.' };
  }
  if (quantity > max) {
    const reason =
      max === MAX_PER_ITEM
        ? `Maximum ${MAX_PER_ITEM} per dish per order.`
        : `Only ${max} portion${max === 1 ? '' : 's'} left today.`;
    return { ok: false, max, message: `${reason} Reduce to ${max} or fewer.` };
  }
  return { ok: true, max, message: '' };
}

/* ------------------------------------------------------------------ */
/* Rule 2 - Eligibility / compatibility (allergens)                    */
/* An order cannot be confirmed if any dish contains an allergen the   */
/* customer has declared.                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {Array<{ id: string, name: string, allergens: string[] }>} dishes dishes in the cart
 * @param {string[]} declaredAllergies allergens the customer avoids
 * @returns {Array<{ id: string, name: string, conflicts: string[] }>}
 */
export function findAllergenConflicts(dishes, declaredAllergies) {
  if (!declaredAllergies || declaredAllergies.length === 0) return [];
  return dishes
    .map(({ id, name, allergens }) => ({
      id,
      name,
      conflicts: allergens.filter((a) => declaredAllergies.includes(a)),
    }))
    .filter((dish) => dish.conflicts.length > 0);
}

/* ------------------------------------------------------------------ */
/* Rule 3 - Pricing / fulfilment                                       */
/* Delivery orders need a subtotal of at least MIN_DELIVERY_SUBTOTAL.  */
/* Delivery is free from FREE_DELIVERY_FROM. Pickup has no minimum.    */
/* ------------------------------------------------------------------ */
export const MIN_DELIVERY_SUBTOTAL = 1000;
export const FREE_DELIVERY_FROM = 3000;

/**
 * @param {{ subtotal: number, method: 'delivery' | 'pickup', zoneFee?: number }} order
 * @returns {{ ok: boolean, fee: number, shortfall: number, message: string }}
 */
export function checkOrderValue({ subtotal, method, zoneFee = 0 }) {
  if (subtotal <= 0) {
    return { ok: false, fee: 0, shortfall: 0, message: 'Your order is empty.' };
  }
  if (method === 'pickup') {
    return { ok: true, fee: 0, shortfall: 0, message: '' };
  }

  if (subtotal < MIN_DELIVERY_SUBTOTAL) {
    const shortfall = MIN_DELIVERY_SUBTOTAL - subtotal;
    return {
      ok: false,
      fee: zoneFee,
      shortfall,
      message: `Delivery needs a subtotal of Rs ${MIN_DELIVERY_SUBTOTAL}. Add Rs ${shortfall} more or choose pickup.`,
    };
  }

  const fee = subtotal >= FREE_DELIVERY_FROM ? 0 : zoneFee;
  return { ok: true, fee, shortfall: 0, message: '' };
}
