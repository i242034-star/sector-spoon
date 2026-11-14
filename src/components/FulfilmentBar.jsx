import { useCart } from '../context/CartContext.jsx';
import { useOrderSummary } from '../hooks/useOrderSummary.js';
import { deliveryZones } from '../data/zones.js';
import { FREE_DELIVERY_FROM, MIN_DELIVERY_SUBTOTAL } from '../rules/orderRules.js';
import { formatPrice } from '../utils/format.js';

/**
 * Problem 1 fix: delivery charges and the minimum order are shown on every
 * page from the start, not revealed at checkout. Choosing a sector updates the
 * exact fee immediately and a progress meter shows how far the order is from
 * the minimum.
 */
export default function FulfilmentBar() {
  const { prefs, updatePrefs } = useCart();
  const { subtotal, zone, deliveryFee } = useOrderSummary();
  const isDelivery = prefs.method === 'delivery';
  const progress = Math.min(100, Math.round((subtotal / MIN_DELIVERY_SUBTOTAL) * 100));

  let status;
  if (!isDelivery) {
    status = 'Pickup from H-9 Markaz - no minimum order, no fee.';
  } else if (subtotal === 0) {
    status = `Minimum order ${formatPrice(MIN_DELIVERY_SUBTOTAL)}. Free delivery from ${formatPrice(FREE_DELIVERY_FROM)}.`;
  } else if (subtotal < MIN_DELIVERY_SUBTOTAL) {
    status = `Add ${formatPrice(MIN_DELIVERY_SUBTOTAL - subtotal)} more to reach the delivery minimum.`;
  } else if (subtotal < FREE_DELIVERY_FROM) {
    status = `Minimum reached. Add ${formatPrice(FREE_DELIVERY_FROM - subtotal)} more for free delivery.`;
  } else {
    status = 'Minimum reached and delivery is free.';
  }

  return (
    <section className="fulfilment-bar" aria-label="Delivery or pickup">
      <div className="container fulfilment-inner">
        <fieldset className="segmented">
          <legend className="visually-hidden">Order type</legend>
          {['delivery', 'pickup'].map((method) => (
            <label key={method} className={prefs.method === method ? 'is-selected' : ''}>
              <input
                type="radio"
                name="bar-method"
                value={method}
                checked={prefs.method === method}
                onChange={() => updatePrefs({ method })}
              />
              {method === 'delivery' ? 'Delivery' : 'Pickup'}
            </label>
          ))}
        </fieldset>

        {isDelivery && (
          <div className="zone-select">
            <label htmlFor="bar-zone">Sector</label>
            <select id="bar-zone" value={prefs.zoneId} onChange={(e) => updatePrefs({ zoneId: e.target.value })}>
              <option value="">Choose sector…</option>
              {deliveryZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} - {formatPrice(z.fee)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="fulfilment-status">
          <p aria-live="polite">
            {isDelivery && zone && (
              <strong>
                Fee: {deliveryFee === 0 && subtotal >= FREE_DELIVERY_FROM ? 'Free' : formatPrice(zone.fee)} ·{' '}
              </strong>
            )}
            {status}
          </p>
          {isDelivery && (
            <div
              className="meter"
              role="meter"
              aria-label="Progress to delivery minimum"
              aria-valuemin={0}
              aria-valuemax={MIN_DELIVERY_SUBTOTAL}
              aria-valuenow={Math.min(subtotal, MIN_DELIVERY_SUBTOTAL)}
            >
              <span className={progress >= 100 ? 'meter-fill is-complete' : 'meter-fill'} style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
