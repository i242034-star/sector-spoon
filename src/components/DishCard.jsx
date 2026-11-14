import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DishImage from './DishImage.jsx';
import AvailabilityBadge from './AvailabilityBadge.jsx';
import { formatPrice, capitalise } from '../utils/format.js';

/**
 * One menu listing. Receives the dish and callbacks as props; the cart state
 * itself lives in CartContext (the component responsible for updating it).
 */
export default function DishCard({ dish, quantityInOrder, conflicts, onAdd }) {
  const location = useLocation();
  const [feedback, setFeedback] = useState(null);
  const soldOut = dish.portionsLeft <= 0;
  const needsChoice = Boolean(dish.spiceOptions);

  function handleAdd() {
    const result = onAdd(dish.id);
    setFeedback(result);
  }

  return (
    <article className={`dish-card${soldOut ? ' is-unavailable' : ''}`}>
      <DishImage dish={dish} />
      <div className="dish-card__body">
        <div className="dish-card__meta">
          <span className="eyebrow">{dish.category}</span>
          <AvailabilityBadge portionsLeft={dish.portionsLeft} />
        </div>
        <h3 className="dish-card__title">
          {/* Pass the current search string so "Back to menu" restores filters (Problem 3). */}
          <Link to={`/menu/${dish.id}`} state={{ from: location.search }}>
            {dish.name}
          </Link>
        </h3>
        <p className="dish-card__price">{formatPrice(dish.price)}</p>

        <ul className="tag-list" aria-label="Dietary information">
          {dish.vegetarian && <li className="tag tag--veg">Vegetarian</li>}
          {dish.allergens.length === 0 ? (
            <li className="tag">No listed allergens</li>
          ) : (
            dish.allergens.map((a) => (
              <li key={a} className={conflicts.includes(a) ? 'tag tag--warn' : 'tag'}>
                {conflicts.includes(a) ? `⚠ Contains ${a}` : capitalise(a)}
              </li>
            ))
          )}
        </ul>

        <div className="dish-card__actions">
          {needsChoice ? (
            <Link
              to={`/menu/${dish.id}`}
              state={{ from: location.search }}
              className={soldOut ? 'btn btn-secondary' : 'btn btn-primary'}
            >
              {soldOut ? 'Sold out - view details' : 'Choose spice & add'}
            </Link>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={soldOut}>
              {soldOut ? 'Sold out' : 'Add to order'}
            </button>
          )}
          {quantityInOrder > 0 && <span className="in-order">✓ {quantityInOrder} in your order</span>}
        </div>
        {feedback && (
          <p className={feedback.ok ? 'inline-msg is-success' : 'inline-msg is-error'} role="status">
            {feedback.message}
          </p>
        )}
      </div>
    </article>
  );
}
