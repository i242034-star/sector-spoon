/**
 * Stepper for quantities. The limit (Rule 1) is shown beside the control.
 * Uses large tap targets so it works on a 390 px phone.
 */
export default function QuantityControl({ id, value, max, onChange, label = 'Quantity', hint }) {
  return (
    <div className="qty">
      <label htmlFor={id} className="qty__label">
        {label}
      </label>
      <div className="qty__row">
        <button type="button" className="qty__btn" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={value}
          onChange={(e) => onChange(Number.parseInt(e.target.value, 10) || 0)}
        />
        <button type="button" className="qty__btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
          +
        </button>
      </div>
      <p className="qty__hint">{hint ?? `Max ${max} for this dish`}</p>
    </div>
  );
}
