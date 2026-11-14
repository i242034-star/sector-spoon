import { useSearchParams, Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import LoadState from '../components/LoadState.jsx';
import MenuControls from '../components/MenuControls.jsx';
import DishCard from '../components/DishCard.jsx';
import { applyFilters, DEFAULT_FILTERS, filtersFromParams, filtersToParams } from '../utils/filterDishes.js';

export default function MenuPage() {
  // Problem 3 fix: filters live in the URL, so Back/Forward, refresh and
  // returning from a dish page all restore exactly what the user had.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);
  const { dishes } = useMenu();
  const { prefs, updatePrefs, addItem, quantityOfDish } = useCart();

  function updateFilters(changes) {
    // replace: typing in search should not create one history entry per letter
    setSearchParams(filtersToParams({ ...filters, ...changes }), { replace: true });
  }

  const results = applyFilters(dishes, filters, prefs.allergies);
  const hiddenSoldOut = filters.avail ? applyFilters(dishes, { ...filters, avail: false }, prefs.allergies).length - results.length : 0;
  const isFiltered = Object.keys(filtersToParams({ ...filters, sort: 'popular' })).length > 0;

  return (
    <>
      <div className="page-head">
        <h1>Today’s menu</h1>
        <p className="lead">Cooked fresh in H-9 every day. Portions are limited - what you see is what’s left.</p>
      </div>

      <div className="menu-layout">
        <aside className="menu-sidebar" aria-label="Search and filters">
          <MenuControls
            filters={filters}
            onChange={updateFilters}
            allergies={prefs.allergies}
            onAllergiesChange={(allergies) => updatePrefs({ allergies })}
          />
        </aside>

        <section className="menu-results" aria-labelledby="results-heading">
          <LoadState>
            {dishes.length === 0 ? (
              /* Empty dataset - different from "no matches" (FR15) */
              <div className="state-box">
                <h2 id="results-heading">No dishes on the menu right now</h2>
                <p>
                  The kitchen hasn’t published today’s menu yet. Lunch dishes usually appear by 11:30 and dinner by 18:00.
                </p>
                <Link className="btn btn-secondary" to="/">
                  Back to home
                </Link>
              </div>
            ) : (
              <>
                <div className="results-bar">
                  <h2 id="results-heading" aria-live="polite">
                    {results.length} {results.length === 1 ? 'dish' : 'dishes'}
                    {filters.q && <> for “{filters.q}”</>}
                  </h2>
                  {isFiltered && (
                    <button type="button" className="btn btn-link" onClick={() => setSearchParams({ ...(filters.sort !== DEFAULT_FILTERS.sort && { sort: filters.sort }) })}>
                      Clear filters
                    </button>
                  )}
                </div>

                {results.length === 0 ? (
                  <div className="state-box">
                    <h3>No dishes match your search</h3>
                    <p>
                      Nothing matches
                      {filters.q && <> “{filters.q}”</>}
                      {filters.cat !== 'all' && <> in {filters.cat}</>}
                      {filters.veg && <> (vegetarian)</>}
                      {filters.safe && <> without your avoided allergens</>}.
                      {hiddenSoldOut > 0 && <> {hiddenSoldOut} sold-out dish(es) are hidden.</>}
                    </p>
                    <div className="btn-row">
                      {filters.q && (
                        <button type="button" className="btn btn-secondary" onClick={() => updateFilters({ q: '' })}>
                          Clear search
                        </button>
                      )}
                      {filters.cat !== 'all' && (
                        <button type="button" className="btn btn-secondary" onClick={() => updateFilters({ cat: 'all' })}>
                          Search all categories
                        </button>
                      )}
                      <button type="button" className="btn btn-primary" onClick={() => setSearchParams({})}>
                        Show the full menu
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="dish-grid">
                    {results.map((dish) => (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        quantityInOrder={quantityOfDish(dish.id)}
                        conflicts={prefs.allergies}
                        onAdd={(id) => addItem(id, 1)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </LoadState>
        </section>
      </div>
    </>
  );
}
