import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useOrderSummary } from '../hooks/useOrderSummary.js';
import LoadState from '../components/LoadState.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import CartLine from '../components/CartLine.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { prefs, clearCart } = useCart();
  const summary = useOrderSummary();
  const { lines, issues, orderCheck } = summary;

  const blockers = [];
  if (issues.length > 0) blockers.push(`${issues.length} item(s) need your attention.`);
  if (!orderCheck.ok && orderCheck.message) blockers.push(orderCheck.message);
  if (prefs.method === 'delivery' && !summary.zone) blockers.push('Choose your delivery sector at the top of the page.');

  return (
    <>
      <div className="page-head">
        <h1>Your order</h1>
        <p className="lead">Saved on this device - you can close the tab and come back later.</p>
      </div>

      <LoadState>
        {lines.length === 0 ? (
          <div className="state-box">
            <h2>Your order is empty</h2>
            <p>Add a few dishes from today’s menu to get started.</p>
            <Link className="btn btn-primary" to="/menu">
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="two-col">
            <section aria-labelledby="lines-heading">
              <h2 id="lines-heading" className="visually-hidden">
                Items
              </h2>
              {issues.length > 0 && (
                <div className="notice notice--warn" role="alert">
                  <strong>Some items changed since you added them.</strong> Today’s stock or menu has changed. Fix the
                  highlighted items below to continue.
                </div>
              )}
              <ul className="cart-lines">
                {lines.map((line) => (
                  <CartLine key={line.lineId} line={line} />
                ))}
              </ul>
              <div className="btn-row">
                <Link to="/menu" className="btn btn-secondary">
                  ← Add more dishes
                </Link>
                <button type="button" className="btn btn-link btn-danger" onClick={clearCart}>
                  Empty order
                </button>
              </div>
            </section>

            <OrderSummary summary={summary} method={prefs.method}>
              {blockers.length > 0 && (
                <ul className="blockers" aria-label="Before you can check out">
                  {blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                disabled={blockers.length > 0}
                onClick={() => navigate('/checkout')}
              >
                Continue to checkout
              </button>
            </OrderSummary>
          </div>
        )}
      </LoadState>
    </>
  );
}
