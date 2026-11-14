import { useCart } from '../context/CartContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { deliveryZones } from '../data/zones.js';
import { checkOrderValue, findAllergenConflicts, maxAllowedQuantity } from '../rules/orderRules.js';

/**
 * Derives everything the cart, checkout and header need from the current
 * cart lines + menu data. Nothing here is stored in state: it is recalculated
 * on every render so it can never get out of sync (FR08, FR11).
 */
export function useOrderSummary() {
  const { lines, prefs } = useCart();
  const { getDish, status } = useMenu();
  const menuReady = status === 'ready';

  const totalsByDish = lines.reduce((acc, { dishId, qty }) => ({ ...acc, [dishId]: (acc[dishId] ?? 0) + qty }), {});

  // Join each saved line with today's dish data and check it is still valid.
  const detailedLines = lines.map((line) => {
    const dish = getDish(line.dishId);
    let issue = null;

    if (menuReady) {
      if (!dish) {
        issue = { type: 'missing', message: 'This dish is no longer on the menu.' };
      } else {
        const max = maxAllowedQuantity(dish.portionsLeft);
        const otherLines = totalsByDish[line.dishId] - line.qty;
        const allowedForLine = max - otherLines;
        if (max === 0) {
          issue = { type: 'soldOut', message: 'Sold out since you added it.' };
        } else if (line.qty > allowedForLine) {
          issue = {
            type: 'overLimit',
            allowed: Math.max(0, allowedForLine),
            message: `Only ${max} available for this dish now.`,
          };
        }
      }
    }

    return { ...line, dish, issue, lineTotal: dish ? dish.price * line.qty : 0 };
  });

  // Sold-out or removed dishes don't count towards totals or the delivery minimum.
  const validLines = detailedLines.filter((l) => l.dish && l.issue?.type !== 'soldOut');
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = validLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const issues = detailedLines.filter((l) => l.issue);

  const zone = deliveryZones.find((z) => z.id === prefs.zoneId) ?? null;
  const orderCheck = checkOrderValue({
    subtotal,
    method: prefs.method,
    zoneFee: zone ? zone.fee : 0,
  });

  // Unique dishes in the cart, for the allergen rule.
  const dishesInCart = [...new Map(validLines.map((l) => [l.dish.id, l.dish])).values()];
  const allergenConflicts = findAllergenConflicts(dishesInCart, prefs.allergies);

  const deliveryFee = prefs.method === 'delivery' && zone ? orderCheck.fee : 0;
  const total = subtotal + deliveryFee;
  const estimatedMinutes = validLines.length ? Math.max(...validLines.map((l) => l.dish.prepMinutes)) + (prefs.method === 'delivery' ? 25 : 0) : 0;

  return {
    menuReady,
    lines: detailedLines,
    issues,
    itemCount,
    subtotal,
    zone,
    orderCheck,
    deliveryFee,
    total,
    allergenConflicts,
    estimatedMinutes,
  };
}
