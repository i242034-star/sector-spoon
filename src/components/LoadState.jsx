import { useMenu } from '../context/MenuContext.jsx';

/**
 * Renders loading / error UI for the menu, or its children once ready (FR14).
 */
export default function LoadState({ children }) {
  const { status, error, retry } = useMenu();

  if (status === 'loading') {
    return (
      <div className="state-box" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Loading today’s menu…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state-box state-box--error" role="alert">
        <h2>We couldn’t load the menu</h2>
        <p>{error}</p>
        <p>Your saved order is safe. Check your connection and try again.</p>
        <button type="button" className="btn btn-primary" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  return children;
}
