import { Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { FREE_DELIVERY_FROM, MAX_PER_ITEM, MIN_DELIVERY_SUBTOTAL } from '../rules/orderRules.js';
import { deliveryZones } from '../data/zones.js';
import { formatPrice } from '../utils/format.js';

export default function HomePage() {
  const { dishes, status } = useMenu();
  const available = dishes.filter((d) => d.portionsLeft > 0).length;
  const fees = deliveryZones.map((z) => z.fee);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Islamabad · H-8 to H-12, G-9, G-10, I-8</p>
          <h1>Home-style meals for hostel and exam-week nights.</h1>
          <p className="lead">
            Sector Spoon is a small cloud kitchen in H-9 cooking pulao, rolls and bowls for university students. Order for
            delivery to your sector or pick up on your way home.
          </p>
          <div className="btn-row">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Browse today’s menu
            </Link>
            <Link to="/menu?avail=1&sort=fastest" className="btn btn-secondary btn-lg">
              Fastest dishes
            </Link>
          </div>
          <p className="hint" aria-live="polite">
            {status === 'ready' && `${available} of ${dishes.length} dishes available right now.`}
            {status === 'loading' && 'Checking today’s stock…'}
          </p>
        </div>
      </section>

      <section aria-labelledby="rules-title" className="info-section">
        <h2 id="rules-title">Know before you order</h2>
        <div className="info-grid">
          <article className="info-card">
            <h3>Delivery charges up front</h3>
            <p>
              Fees by sector: {formatPrice(Math.min(...fees))}-{formatPrice(Math.max(...fees))}. Minimum order for delivery is{' '}
              {formatPrice(MIN_DELIVERY_SUBTOTAL)}; delivery is free from {formatPrice(FREE_DELIVERY_FROM)}. Pickup has no minimum.
            </p>
          </article>
          <article className="info-card">
            <h3>Limited daily portions</h3>
            <p>
              We cook fixed batches each morning. Every dish shows how many portions are left, and you can order up to{' '}
              {MAX_PER_ITEM} of one dish.
            </p>
          </article>
          <article className="info-card">
            <h3>Allergy-safe checkout</h3>
            <p>
              Tell us what you avoid (dairy, gluten, nuts, egg). We flag those dishes on the menu and stop an order that
              contains them.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
