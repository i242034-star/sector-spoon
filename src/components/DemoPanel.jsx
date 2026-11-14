import { useEffect, useState } from 'react';
import { useMenu } from '../context/MenuContext.jsx';
import { readDemoSettings, writeDemoSettings } from '../services/demoSettings.js';

const OPTIONS = [
  { key: 'failNextLoad', label: 'Fail the next menu load', hint: 'Reload shows the error and retry state.' },
  { key: 'reducedStock', label: 'Reduce stock (other customers ordered)', hint: 'Tikka Roll sells out; Biryani → 2; Falafel → 1.' },
  { key: 'emptyMenu', label: 'Return an empty menu', hint: 'Shows the "no dishes today" state.' },
];

/** Clearly labelled demonstration controls for edge cases (Task 6.1). */
export default function DemoPanel() {
  const { retry, status } = useMenu();
  const [settings, setSettings] = useState(readDemoSettings);

  // Re-read after each load: the provider clears the one-time failure flag.
  useEffect(() => {
    setSettings(readDemoSettings());
  }, [status]);

  function toggle(key) {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      writeDemoSettings(next);
      return next;
    });
  }

  return (
    <details className="demo-panel">
      <summary>Demo controls (for testing edge cases)</summary>
      <p className="hint">These simulate server problems. Apply them, then press “Reload menu data”.</p>
      {OPTIONS.map(({ key, label, hint }) => (
        <label key={key} className="check">
          <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)} />
          <span>
            {label}
            <small>{hint}</small>
          </span>
        </label>
      ))}
      <button type="button" className="btn btn-secondary" onClick={retry}>
        Reload menu data
      </button>
    </details>
  );
}
