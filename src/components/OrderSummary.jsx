import { formatPrice } from '../utils/format.js';
import { FREE_DELIVERY_FROM } from '../rules/orderRules.js';

/** Calculated totals (FR11). All values come from useOrderSummary(). */
export default function OrderSummary({ summary, method, title = 'Order summary', children }) {
  const { itemCount, subtotal, zone, deliveryFee, total, estimatedMinutes } = summary;

  return (
    <section className="summary-card" aria-labelledby="summary-title">
      <h2 id="summary-title">{title}</h2>
      <dl className="summary-list">
        <div>
          <dt>Items</dt>
          <dd>{itemCount}</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div>
          <dt>{method === 'pickup' ? 'Pickup (H-9 Markaz)' : `Delivery${zone ? ` to ${zone.name}` : ''}`}</dt>
          <dd>
            {method === 'pickup'
              ? 'Free'
              : !zone
                ? 'Choose sector'
                : deliveryFee === 0 && subtotal >= FREE_DELIVERY_FROM
                  ? 'Free'
                  : formatPrice(deliveryFee)}
          </dd>
        </div>
        {estimatedMinutes > 0 && (
          <div>
            <dt>Estimated time</dt>
            <dd>~{estimatedMinutes} min</dd>
          </div>
        )}
        <div className="summary-total">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
