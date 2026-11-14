# Sector Spoon - Student Meal Ordering (CS4032 Assignment 02)

**Student:** Abdullah kewan_24i-2034_CY-A
**GitHub:** https://github.com/i242034-star/sector-spoon
**Live site:** _https://sector-spoon.vercel.app_ (replace after deploying)

Sector Spoon is a **fictional** cloud kitchen in H-9, Islamabad that cooks home-style meals (pulao, rolls, bowls, desserts) for university students. The React site lets students browse today's menu, search and filter, open a dish, build an order with spice options and quantities, fill in a delivery or pickup form, review a calculated summary and place a **simulated** order.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
npm test           # run business-rule tests (node --test)
```

Requires Node.js 18+ (tested on Node 22).

## Routes

| Route | Purpose |
|---|---|
| `/` | Home: business intro and the three ordering rules |
| `/menu` | Browse, search, filter and sort (state kept in the query string) |
| `/menu/:dishId` | Dish details, spice option, quantity, add to order; unknown IDs show "Dish not found" |
| `/order` | Order (cart): change quantity/spice, remove, fix invalid items, totals |
| `/checkout` | Controlled, validated form plus business-rule checks |
| `/order/confirmed` | Confirmation with order number and final summary |
| `*` | 404 page with links back |

## Features

- 12 local dishes with stable IDs (`src/data/menu.js`), loaded through an async mock loader with loading, error and retry states
- Search (name, description, category), category filter, vegetarian, available-only and allergen filters, plus 4 sort options
- Cart with spice variants and quantities, saved in `localStorage` and re-validated against today's stock when restored
- Delivery/pickup preference, sector and allergies saved in `localStorage` and shared across header, menu and checkout
- Validation: name, Pakistani mobile format, sector + address (delivery), pickup slot, notes length. Errors show on blur or submit and the input is kept
- Responsive from 390 px to 1280 px+; keyboard accessible; skip link; visible focus

## Business rules

| # | Category | Rule | Where shown |
|---|---|---|---|
| 1 | Availability | Max **8 portions per dish** per order, never more than `portionsLeft`; sold-out dishes can't be added | Badge on card, stepper hint, details page |
| 2 | Eligibility | An order **can't be confirmed** if a dish contains an allergen the customer ticked (dairy, gluten, nuts, egg) | Warning tag on cards, notice on details, block + "Remove dish" at checkout |
| 3 | Pricing | Delivery needs a subtotal of **at least Rs 1,000**; delivery fee by sector (Rs 80-180); **free from Rs 3,000**; pickup has no minimum | Header bar on every page, cart blockers, checkout |

All rule functions are in `src/rules/orderRules.js`. The test file is `tests/orderRules.test.js` (6 cases: valid, exactly at the Rs 1,000 limit, Rs 999, pickup, free-delivery boundary, quantity limit).

## Reproducing edge cases

Open **Demo controls** in the footer (clearly labelled), tick an option, then press **Reload menu data**:

| Case | How |
|---|---|
| Loading failure + retry | Tick "Fail the next menu load" → Reload. The error box appears; "Try again" loads normally. |
| Changed availability / restored selection | Add 3 × Chicken Tikka Roll and 5 × Beef Biryani, tick "Reduce stock" → Reload. The cart flags the roll as sold out and the biryani as over the limit, with "Reduce to 2" / "Remove". |
| Empty dataset | Tick "Return an empty menu" → Reload. `/menu` shows "No dishes on the menu right now". |
| No matches | Search "pizza" on `/menu`. Shows "No dishes match" with "Clear search" / "Show the full menu". |
| Invalid URL | `/menu/abc` shows "Dish not found"; `/anything` shows the 404 page. |
| Missing image | Chicken Karahi Bowl has no image, so a "Photo coming soon" fallback is shown. |
| Long content | The Exam-Week Protein Bowl has a very long name; it is clamped to 3 lines on cards. |
| Invalid form input | Submit checkout with phone `12345`. A specific error appears, focus moves to the field, other fields are kept. |

## Simulated operations and limitations

- Orders are **simulated**: `submitOrder()` waits 900 ms and returns an order number. Nothing is sent, charged or cooked.
- Name, phone and address are never stored; only the order items and totals go into `sessionStorage` for the confirmation page.
- Stock is not reduced after ordering (there is no backend).
- Prices and fees are fictional.

## Concept map

| Concept | File | Component / function |
|---|---|---|
| Components and props | `src/components/DishCard.jsx` | `DishCard({ dish, quantityInOrder, conflicts, onAdd })` |
| Callback props | `src/pages/MenuPage.jsx` → `MenuControls.jsx` | `onChange={updateFilters}` |
| useState + controlled inputs | `src/pages/CheckoutPage.jsx` | `form`, `handleChange` |
| Functional updates / immutable arrays | `src/context/CartContext.jsx` | `setLines((prev) => …)` in `addItem`, `changeSpice`, `removeLine` |
| Immutable object update | `src/pages/CheckoutPage.jsx` | `setForm((prev) => ({ ...prev, [name]: value }))` |
| Shared state (Context) | `src/context/CartContext.jsx`, `MenuContext.jsx` | `CartProvider`, `MenuProvider` |
| Derived values | `src/hooks/useOrderSummary.js` | `subtotal`, `total`, `issues`, `allergenConflicts` |
| useEffect + cleanup | `src/context/MenuContext.jsx` | load effect with `ignore` flag |
| useEffect for storage sync | `src/context/CartContext.jsx` | `writeStorage(CART_KEY, lines)` |
| Async + error handling | `src/services/menuLoader.js` | `loadMenu`, `submitOrder` (`async/await`, `.catch`) |
| localStorage | `src/services/storage.js` | `readStorage`, `writeStorage` |
| Routing / URL params | `src/App.jsx`, `src/pages/DishPage.jsx` | `useParams`, `useSearchParams`, `useNavigate` |
| Conditional rendering | `src/components/LoadState.jsx` | loading / error / ready |
| Lists and keys | `src/pages/MenuPage.jsx` | `results.map(dish => <DishCard key={dish.id} …/>)` |
| Business rules (pure) | `src/rules/orderRules.js` | `checkQuantity`, `findAllergenConflicts`, `checkOrderValue` |
| Validation | `src/rules/checkoutValidation.js` | `validateCheckout` |

## Deployment

`vercel.json` (Vercel) and `public/_redirects` (Netlify) send every path to `index.html`, so direct links and refreshes on routes like `/menu/beef-biryani` work.
