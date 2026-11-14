import { useState } from 'react';
import rice from '../assets/rice.svg';
import wrap from '../assets/wrap.svg';
import bowl from '../assets/bowl.svg';
import dessert from '../assets/dessert.svg';

const IMAGES = { rice, wrap, bowl, dessert };

/**
 * Shows the dish illustration, or a labelled fallback when the image is
 * missing from the data or fails to load (Task 6.1 - missing content).
 */
export default function DishImage({ dish, className = '' }) {
  const [failed, setFailed] = useState(false);
  const src = IMAGES[dish.image];

  if (!src || failed) {
    return (
      <div className={`dish-image dish-image--fallback ${className}`} role="img" aria-label={`No photo available for ${dish.name}`}>
        <span aria-hidden="true">🍽</span>
        <small>Photo coming soon</small>
      </div>
    );
  }

  return (
    <img
      className={`dish-image ${className}`}
      src={src}
      alt={`Illustration of ${dish.name}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
