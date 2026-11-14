import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useOrderSummary } from '../hooks/useOrderSummary.js';
import LoadState from '../components/LoadState.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import FormField from '../components/FormField.jsx';
import { deliveryZones, PICKUP_SLOTS, KITCHEN_LOCATION } from '../data/zones.js';
import { ALLERGENS } from '../data/menu.js';
import { validateCheckout, NOTES_MAX } from '../rules/checkoutValidation.js';
import { submitOrder } from '../services/menuLoader.js';
import { capitalise, formatPrice } from '../utils/format.js';

const LAST_ORDER_KEY = 'sectorSpoon.lastOrder';

export default function CheckoutPage() {
  return (
    <>
      <div className="page-head">
        <h1>Checkout</h1>
        <p className="lead">
          <span className="sim-label">Simulated order</span> Nothing is charged and no details are sent anywhere.
        </p>
      </div>
      <LoadState>
        <CheckoutForm />
      </LoadState>
    </>
  );
}

function CheckoutForm() {
  const navigate = useNavigate();
  const { prefs, updatePrefs, clearCart, removeDish } = useCart();
  const summary = useOrderSummary();
  const { lines, issues, orderCheck, allergenConflicts } = summary;

  // Personal fields are local state only. Method, sector and allergies are shared
  // preferences, so they stay in sync with the header bar and the menu filters.
  const [form, setForm] = useState({ name: '', phone: '', address: '', slot: '', notes: '' });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const values = { ...form, zoneId: prefs.zoneId };
  const errors = validateCheckout(values, prefs.method);
  const showError = (field) => (touched[field] || submitAttempted ? errors[field] : undefined);

  // Business-rule problems that block confirmation (FR12).
  const ruleProblems = [];
  if (issues.length) ruleProblems.push('Some items in your order are no longer available in that quantity.');
  if (!orderCheck.ok) ruleProblems.push(orderCheck.message);
  if (allergenConflicts.length) ruleProblems.push('Your order contains allergens you said you avoid.');

  if (lines.length === 0) {
    return (
      <div className="state-box">
        <h2>There’s nothing to check out</h2>
        <p>Your order is empty. Add dishes from the menu first.</p>
        <Link to="/menu" className="btn btn-primary">
          Browse the menu
        </Link>
      </div>
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    // Copy the object - never mutate state directly.
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function toggleAllergy(allergen) {
    const next = prefs.allergies.includes(allergen)
      ? prefs.allergies.filter((a) => a !== allergen)
      : [...prefs.allergies, allergen];
    updatePrefs({ allergies: next });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitError('');

    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      // Move focus to the first problem so keyboard and screen-reader users find it.
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }
    if (ruleProblems.length) {
      document.getElementById('rule-problems')?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // Only order details are kept - no name, phone or address (privacy).
      const order = await submitOrder({
        items: lines.map(({ dish, qty, spice, lineTotal }) => ({ name: dish.name, qty, spice, lineTotal })),
        method: prefs.method,
        zoneName: summary.zone?.name ?? null,
        slot: prefs.method === 'pickup' ? form.slot : null,
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        total: summary.total,
        estimatedMinutes: summary.estimatedMinutes,
      });
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      clearCart();
      navigate('/order/confirmed', { replace: true, state: { order } });
    } catch {
      setSubmitError('The order could not be placed. Your details are still here - please try again.');
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="two-col">
      <form className="checkout-form" onSubmit={handleSubmit} noValidate>
        {submitAttempted && errorCount > 0 && (
          <div className="notice notice--error" role="alert">
            Please fix {errorCount} field{errorCount > 1 ? 's' : ''} below. Everything else you typed has been kept.
          </div>
        )}

        <fieldset className="form-section">
          <legend>1. Your details</legend>
          <FormField id="checkout-name" label="Name" error={showError('name')} hint="First name is enough.">
            <input name="name" type="text" autoComplete="given-name" value={form.name} onChange={handleChange} onBlur={handleBlur} />
          </FormField>
          <FormField id="checkout-phone" label="Mobile number" error={showError('phone')} hint="Format: 03XX-XXXXXXX">
            <input name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur} />
          </FormField>
        </fieldset>

        <fieldset className="form-section">
          <legend>2. Delivery or pickup</legend>
          <div className="segmented segmented--wide" role="radiogroup" aria-label="Order type">
            {['delivery', 'pickup'].map((method) => (
              <label key={method} className={prefs.method === method ? 'is-selected' : ''}>
                <input type="radio" name="method" value={method} checked={prefs.method === method} onChange={() => updatePrefs({ method })} />
                {method === 'delivery' ? 'Delivery' : 'Pickup (no minimum)'}
              </label>
            ))}
          </div>

          {prefs.method === 'delivery' ? (
            <>
              <FormField id="checkout-zoneId" label="Sector" error={showError('zoneId')}>
                <select
                  name="zoneId"
                  value={prefs.zoneId}
                  onChange={(e) => updatePrefs({ zoneId: e.target.value })}
                  onBlur={handleBlur}
                >
                  <option value="">Choose sector…</option>
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} - {formatPrice(z.fee)} delivery
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="checkout-address" label="Address" error={showError('address')} hint="House/hostel, street, landmark">
                <textarea name="address" rows={2} autoComplete="street-address" value={form.address} onChange={handleChange} onBlur={handleBlur} />
              </FormField>
            </>
          ) : (
            <FormField id="checkout-slot" label="Pickup time (today)" error={showError('slot')} hint={`Collect from ${KITCHEN_LOCATION}`}>
              <select name="slot" value={form.slot} onChange={handleChange} onBlur={handleBlur}>
                <option value="">Choose a time…</option>
                {PICKUP_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        </fieldset>

        <fieldset className="form-section">
          <legend>3. Allergies and notes</legend>
          <p className="hint">Tick anything you must avoid. We will stop the order if a dish contains it.</p>
          <div className="check-row">
            {ALLERGENS.map((a) => (
              <label key={a} className="check">
                <input type="checkbox" checked={prefs.allergies.includes(a)} onChange={() => toggleAllergy(a)} />
                <span>{capitalise(a)}</span>
              </label>
            ))}
          </div>
          <FormField id="checkout-notes" label="Kitchen notes (optional)" error={showError('notes')} hint={`${form.notes.length}/${NOTES_MAX}`}>
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} onBlur={handleBlur} />
          </FormField>
        </fieldset>

        {ruleProblems.length > 0 && (
          <div id="rule-problems" className="notice notice--error" tabIndex={-1} role="region" aria-label="Order problems">
            <strong>This order can’t be confirmed yet:</strong>
            <ul>
              {ruleProblems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {allergenConflicts.map(({ id, name, conflicts }) => (
              <div key={id} className="conflict-row">
                <span>
                  {name} contains <strong>{conflicts.join(', ')}</strong>
                </span>
                <button type="button" className="btn btn-secondary" onClick={() => removeDish(id)}>
                  Remove dish
                </button>
              </div>
            ))}
            {issues.length > 0 && (
              <Link to="/order" className="btn btn-secondary">
                Fix items in your order
              </Link>
            )}
          </div>
        )}

        {submitError && (
          <p className="notice notice--error" role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
          {submitting ? 'Placing order…' : `Place simulated order · ${formatPrice(summary.total)}`}
        </button>
        <p className="hint center">Payment is cash on delivery/pickup (simulated).</p>
      </form>

      <OrderSummary summary={summary} method={prefs.method}>
        <ul className="mini-lines">
          {lines.map(({ lineId, dish, qty, spice }) => (
            <li key={lineId}>
              {qty} × {dish ? dish.name : 'Unavailable dish'}
              {spice && <small> ({spice})</small>}
            </li>
          ))}
        </ul>
        <Link to="/order" className="btn btn-link">
          Edit order
        </Link>
      </OrderSummary>
    </div>
  );
}
