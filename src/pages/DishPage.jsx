import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import LoadState from '../components/LoadState.jsx';
import DishImage from '../components/DishImage.jsx';
import AvailabilityBadge from '../components/AvailabilityBadge.jsx';
import QuantityControl from '../components/QuantityControl.jsx';
import { checkQuantity, maxAllowedQuantity, MAX_PER_ITEM } from '../rules/orderRules.js';
import { capitalise, formatPrice } from '../utils/format.js';

export default function DishPage() {
  const { dishId } = useParams();
  const { getDish } = useMenu();
  const dish = getDish(dishId);

  return (
    <LoadState>
      {dish ? (
        // key resets the form state when moving between dishes
        <DishDetails key={dish.id} dish={dish} />
      ) : (
        <div className="state-box">
          <h1>Dish not found</h1>
          <p>
            We couldn’t find a dish called “<code>{dishId}</code>”. It may have been removed from today’s menu or the link
            may be mistyped.
          </p>
          <Link className="btn btn-primary" to="/menu">
            Browse today’s menu
          </Link>
        </div>
      )}
    </LoadState>
  );
}

function DishDetails({ dish }) {
  const location = useLocation();
  const { addItem, quantityOfDish, prefs } = useCart();
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState(dish.spiceOptions ? dish.spiceOptions[1] : null);
  const [feedback, setFeedback] = useState(null);

  const alreadyInOrder = quantityOfDish(dish.id);
  const max = maxAllowedQuantity(dish.portionsLeft);
  const room = Math.max(0, max - alreadyInOrder);
  const check = checkQuantity(alreadyInOrder + qty, dish.portionsLeft);
  const conflicts = dish.allergens.filter((a) => prefs.allergies.includes(a));
  const backTo = `/menu${location.state?.from ?? ''}`;

  function handleSubmit(event) {
    event.preventDefault();
    if (!check.ok) return;
    const result = addItem(dish.id, qty, spice);
    setFeedback(result);
    if (result.ok) setQty(1);
  }

  return (
    <article className="dish-detail">
      <Link to={backTo} className="back-link">
        ← Back to menu{location.state?.from ? ' (your filters are kept)' : ''}
      </Link>

      <div className="dish-detail__grid">
        <DishImage dish={dish} className="dish-detail__image" />

        <div>
          <p className="eyebrow">{dish.category}</p>
          <h1 className="dish-detail__title">{dish.name}</h1>
          <p className="dish-detail__price">{formatPrice(dish.price)}</p>
          <p>{dish.description}</p>

          <dl className="facts">
            <div>
              <dt>Availability</dt>
              <dd>
                <AvailabilityBadge portionsLeft={dish.portionsLeft} />
              </dd>
            </div>
            <div>
              <dt>Ready in</dt>
              <dd>~{dish.prepMinutes} min (plus ~25 min delivery)</dd>
            </div>
            <div>
              <dt>Diet</dt>
              <dd>{dish.vegetarian ? 'Vegetarian' : 'Contains meat (halal)'}</dd>
            </div>
            <div>
              <dt>Allergens</dt>
              <dd>{dish.allergens.length ? dish.allergens.map(capitalise).join(', ') : 'None listed'}</dd>
            </div>
          </dl>

          {conflicts.length > 0 && (
            <p className="notice notice--warn" role="note">
              ⚠ Contains {conflicts.join(' and ')}, which you said you avoid. You will not be able to confirm an order that
              includes this dish while that allergy is selected.
            </p>
          )}

          {max === 0 ? (
            <div className="notice notice--error">
              <p>
                <strong>Sold out for today.</strong> Fresh portions are cooked every morning.
              </p>
              <Link to="/menu?avail=1" className="btn btn-primary">
                See dishes still available
              </Link>
            </div>
          ) : (
            <form className="add-form" onSubmit={handleSubmit}>
              {dish.spiceOptions && (
                <fieldset className="segmented segmented--wide">
                  <legend>Spice level</legend>
                  {dish.spiceOptions.map((level) => (
                    <label key={level} className={spice === level ? 'is-selected' : ''}>
                      <input
                        type="radio"
                        name="spice"
                        value={level}
                        checked={spice === level}
                        onChange={() => setSpice(level)}
                      />
                      {level}
                    </label>
                  ))}
                </fieldset>
              )}

              <QuantityControl
                id="dish-qty"
                value={qty}
                max={Math.max(1, room)}
                onChange={setQty}
                hint={`You can add up to ${room} more`}
              />
              <p className="hint">
                Limit: {MAX_PER_ITEM} per dish per order, and never more than the portions left.
                {alreadyInOrder > 0 && ` You already have ${alreadyInOrder} in your order.`}
              </p>

              {!check.ok && (
                <p className="inline-msg is-error" role="alert">
                  {room === 0 ? 'You already have the maximum for this dish in your order.' : check.message}
                </p>
              )}

              <div className="btn-row">
                <button type="submit" className="btn btn-primary btn-lg" disabled={!check.ok}>
                  Add {qty > 0 ? qty : ''} to order · {formatPrice(dish.price * Math.max(qty, 0))}
                </button>
                {alreadyInOrder > 0 && (
                  <Link to="/order" className="btn btn-secondary btn-lg">
                    View order
                  </Link>
                )}
              </div>
              {feedback && (
                <p className={feedback.ok ? 'inline-msg is-success' : 'inline-msg is-error'} role="status">
                  {feedback.message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
