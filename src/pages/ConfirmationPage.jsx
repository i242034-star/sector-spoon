import { Link, useLocation } from 'react-router-dom';
import { readSession } from '../services/storage.js';
import { formatPrice } from '../utils/format.js';

export default function ConfirmationPage() {
  const location = useLocation();
  // Router state is lost on refresh, so fall back to the copy in sessionStorage.
  const order = location.state?.order ?? readSession('sectorSpoon.lastOrder');

  if (!order) {
    return (
      <div className="state-box">
        <h1>No recent order found</h1>
        <p>This page shows your order confirmation right after checkout. Start a new order from the menu.</p>
        <Link className="btn btn-primary" to="/menu">
          Browse the menu
        </Link>
      </div>
    );
  }

  const time = new Date(order.placedAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="confirmation" aria-labelledby="confirm-title">
      <div className="confirmation__icon" aria-hidden="true">
        ✓
      </div>
      <p className="sim-label">Simulated order - no food will be prepared</p>
      <h1 id="confirm-title">Order {order.orderNumber} confirmed</h1>
      <p className="lead">
        Placed at {time}.{' '}
        {order.method === 'delivery'
          ? `Estimated delivery to ${order.zoneName} in about ${order.estimatedMinutes} minutes.`
          : `Ready for pickup at ${order.slot} from H-9 Markaz.`}
      </p>

      <div className="summary-card">
        <h2>What you ordered</h2>
        <ul className="mini-lines">
          {order.items.map((item) => (
            <li key={`${item.name}-${item.spice ?? 'plain'}`}>
              <span>
                {item.qty} × {item.name}
                {item.spice && <small> ({item.spice})</small>}
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="summary-list">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div>
            <dt>{order.method === 'delivery' ? 'Delivery fee' : 'Pickup'}</dt>
            <dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}</dd>
          </div>
          <div className="summary-total">
            <dt>Total (cash)</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="btn-row center">
        <Link className="btn btn-primary" to="/menu">
          Order something else
        </Link>
        <Link className="btn btn-secondary" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
