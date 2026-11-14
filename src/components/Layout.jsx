import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useOrderSummary } from '../hooks/useOrderSummary.js';
import FulfilmentBar from './FulfilmentBar.jsx';
import DemoPanel from './DemoPanel.jsx';
import { formatPrice } from '../utils/format.js';

export default function Layout() {
  const { itemCount, subtotal } = useOrderSummary();
  const { pathname } = useLocation();

  // Scroll to top on route change (but not on query-string changes,
  // so filtering the menu does not jump the page).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              ◐
            </span>
            Sector Spoon
          </Link>
          <nav aria-label="Main">
            <ul className="nav-list">
              <li>
                <NavLink to="/menu">Menu</NavLink>
              </li>
              <li>
                <NavLink to="/order" className="nav-cart">
                  Your order
                  <span className="cart-count" aria-label={`${itemCount} items, ${formatPrice(subtotal)}`}>
                    {itemCount}
                  </span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <FulfilmentBar />
      </header>

      <main id="main" className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            <strong>Sector Spoon</strong> is a fictional cloud kitchen created for a university assignment. All orders are
            simulated - no food is cooked, no payment is taken and no personal data leaves your browser.
          </p>
          <DemoPanel />
        </div>
      </footer>
    </>
  );
}
