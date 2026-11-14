// Pure helpers for reading filters from the URL and applying them.

export const DEFAULT_FILTERS = { q: '', cat: 'all', sort: 'popular', avail: false, veg: false, safe: false };

/** URLSearchParams -> filters object */
export function filtersFromParams(params) {
  return {
    q: params.get('q') ?? '',
    cat: params.get('cat') ?? 'all',
    sort: params.get('sort') ?? 'popular',
    avail: params.get('avail') === '1',
    veg: params.get('veg') === '1',
    safe: params.get('safe') === '1',
  };
}

/** filters object -> plain object for setSearchParams (defaults are left out to keep URLs short) */
export function filtersToParams(filters) {
  const params = {};
  if (filters.q) params.q = filters.q;
  if (filters.cat !== 'all') params.cat = filters.cat;
  if (filters.sort !== 'popular') params.sort = filters.sort;
  if (filters.avail) params.avail = '1';
  if (filters.veg) params.veg = '1';
  if (filters.safe) params.safe = '1';
  return params;
}

const SORTERS = {
  popular: () => 0, // keep data order (menu.js is ordered by popularity)
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  fastest: (a, b) => a.prepMinutes - b.prepMinutes,
};

export function applyFilters(dishes, filters, allergies) {
  const query = filters.q.trim().toLowerCase();

  const result = dishes.filter((dish) => {
    const text = `${dish.name} ${dish.description} ${dish.category}`.toLowerCase();
    if (query && !text.includes(query)) return false;
    if (filters.cat !== 'all' && dish.category !== filters.cat) return false;
    if (filters.avail && dish.portionsLeft <= 0) return false;
    if (filters.veg && !dish.vegetarian) return false;
    if (filters.safe && dish.allergens.some((a) => allergies.includes(a))) return false;
    return true;
  });

  // Copy before sorting: Array.prototype.sort mutates.
  return [...result].sort(SORTERS[filters.sort] ?? SORTERS.popular);
}
