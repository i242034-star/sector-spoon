import { Link, useLocation } from 'react-router-dom';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="state-box">
      <h1>Page not found</h1>
      <p>
        There is no page at <code>{pathname}</code>. You might be looking for today’s menu.
      </p>
      <div className="btn-row center">
        <Link className="btn btn-primary" to="/menu">
          Browse the menu
        </Link>
        <Link className="btn btn-secondary" to="/">
          Home
        </Link>
      </div>
    </div>
  );
}
