import { useState } from 'react';
import { ALLERGENS, CATEGORIES } from '../data/menu.js';
import { capitalise } from '../utils/format.js';

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'fastest', label: 'Fastest to prepare' },
];

/**
 * Search, filter and sort controls. Fully controlled: values come from the URL
 * (via props) and every change is reported through the onChange callback.
 */
export default function MenuControls({ filters, onChange, allergies, onAllergiesChange }) {
  // On phones the full filter panel would push every dish below the first screen,
  // so it starts collapsed there (search stays visible). Open by default on wider screens.
  const [showFilters, setShowFilters] = useState(() => window.matchMedia('(min-width: 901px)').matches);
  const activeCount = [filters.cat !== 'all', filters.sort !== 'popular', filters.avail, filters.veg, filters.safe].filter(
    Boolean
  ).length;

  function toggleAllergy(allergen) {
    onAllergiesChange(
      allergies.includes(allergen) ? allergies.filter((a) => a !== allergen) : [...allergies, allergen]
    );
  }

  return (
    <form className="controls" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="field field--search">
        <label htmlFor="search">Search dishes</label>
        <input
          id="search"
          type="search"
          placeholder="e.g. biryani, paneer, wrap"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>

      <details className="more-filters" open={showFilters} onToggle={(e) => setShowFilters(e.currentTarget.open)}>
        <summary>
          Filters &amp; sort{activeCount > 0 && <span className="filter-count"> ({activeCount} on)</span>}
        </summary>

      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" value={filters.cat} onChange={(e) => onChange({ cat: e.target.value })}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="sort">Sort by</label>
        <select id="sort" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="field field--checks">
        <legend>Show</legend>
        <label className="check">
          <input type="checkbox" checked={filters.avail} onChange={(e) => onChange({ avail: e.target.checked })} />
          <span>Available now only</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={filters.veg} onChange={(e) => onChange({ veg: e.target.checked })} />
          <span>Vegetarian only</span>
        </label>
      </fieldset>

      <fieldset className="field field--checks">
        <legend>I avoid (saved for checkout)</legend>
        {ALLERGENS.map((a) => (
          <label key={a} className="check">
            <input type="checkbox" checked={allergies.includes(a)} onChange={() => toggleAllergy(a)} />
            <span>{capitalise(a)}</span>
          </label>
        ))}
        {allergies.length > 0 && (
          <label className="check">
            <input type="checkbox" checked={filters.safe} onChange={(e) => onChange({ safe: e.target.checked })} />
            <span>Hide dishes I avoid</span>
          </label>
        )}
      </fieldset>
      </details>
    </form>
  );
}
