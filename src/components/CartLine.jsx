import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import QuantityControl from './QuantityControl.jsx';
import DishImage from './DishImage.jsx';
import { maxAllowedQuantity } from '../rules/orderRules.js';
import { formatPrice } from '../utils/format.js';

/** One line in the order, with the controls to change or fix it. */
export default function CartLine({ line }) {
  const { updateQuantity, changeSpice, removeLine, quantityOfDish } = useCart();
  const { dish, issue } = line;

  // Saved line whose dish no longer exists.
  if (!dish) {
    return (
      <li className="cart-line has-issue">
        <div className="cart-line__body">
          <h3>Unknown dish ({line.dishId})</h3>
          <p className="inline-msg is-error">{issue?.message ?? 'Checking availability…'}</p>
          <button type="button" className="btn btn-secondary" onClick={() => removeLine(line.lineId)}>
            Remove
          </button>
        </div>
      </li>
    );
  }

  // Room for this line = dish limit minus what other lines of the same dish use.
  const maxForLine = Math.max(1, maxAllowedQuantity(dish.portionsLeft) - quantityOfDish(dish.id, line.lineId));

  return (
    <li className={`cart-line${issue ? ' has-issue' : ''}`}>
      <DishImage dish={dish} className="cart-line__image" />
      <div className="cart-line__body">
        <div className="cart-line__top">
          <h3>
            <Link to={`/menu/${dish.id}`}>{dish.name}</Link>
          </h3>
          <p className="cart-line__total">{formatPrice(line.lineTotal)}</p>
        </div>
        <p className="hint">{formatPrice(dish.price)} each</p>

        {issue && (
          <div className="inline-msg is-error" role="alert">
            <p>{issue.message}</p>
            <div className="btn-row">
              {issue.type === 'overLimit' && issue.allowed > 0 && (
                <button type="button" className="btn btn-primary" onClick={() => updateQuantity(line.lineId, issue.allowed)}>
                  Reduce to {issue.allowed}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => removeLine(line.lineId)}>
                Remove
              </button>
            </div>
          </div>
        )}

        {issue?.type !== 'soldOut' && (
          <div className="cart-line__controls">
            <QuantityControl
              id={`qty-${line.lineId}`}
              value={line.qty}
              max={maxForLine}
              // Ignore 0/empty here: removing is done with the explicit Remove button.
              onChange={(qty) => qty >= 1 && updateQuantity(line.lineId, Math.min(qty, maxForLine))}
            />
            {dish.spiceOptions && (
              <div className="field">
                <label htmlFor={`spice-${line.lineId}`}>Spice</label>
                <select id={`spice-${line.lineId}`} value={line.spice ?? ''} onChange={(e) => changeSpice(line.lineId, e.target.value)}>
                  {dish.spiceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="button" className="btn btn-link btn-danger" onClick={() => removeLine(line.lineId)}>
              Remove<span className="visually-hidden"> {dish.name}</span>
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
