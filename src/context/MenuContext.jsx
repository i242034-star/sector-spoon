import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearSimulatedFailure, loadMenu } from '../services/menuLoader.js';

const MenuContext = createContext(null);

/**
 * Loads the menu once through the async mock loader and shares it with the app.
 * Exposes loading / error state and a retry function (FR14).
 */
export function MenuProvider({ children }) {
  const [dishes, setDishes] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0); // incremented to trigger a reload

  useEffect(() => {
    // `ignore` prevents a slow, outdated request from overwriting newer state
    // (e.g. if the user presses "Try again" twice or the provider unmounts).
    let ignore = false;
    setStatus('loading');
    setError('');

    loadMenu()
      .then((data) => {
        if (ignore) return;
        setDishes(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (ignore) return;
        clearSimulatedFailure();
        setError(err.message);
        setStatus('error');
      });

    return () => {
      ignore = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const getDish = useCallback((id) => dishes.find((dish) => dish.id === id), [dishes]);

  return (
    <MenuContext.Provider value={{ dishes, status, error, retry, getDish }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used inside <MenuProvider>');
  return context;
}
