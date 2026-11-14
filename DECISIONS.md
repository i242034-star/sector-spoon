# Frontend Decisions - Sector Spoon

Three decisions, one for each problem found on the reference restaurant websites.
Screenshots for the "Evidence" rows go in the report (`/docs/screenshots/`).

---

## Decision 1 - Show delivery fee and minimum order on every page

| Field | Content |
|---|---|
| **Problem** | On the reference site the delivery charge and the minimum order value only appear on the final checkout step, after the customer has built the whole order. |
| **Decision** | A delivery/pickup bar sits under the header on every page. It shows the minimum order (Rs 1,000), the free-delivery threshold (Rs 3,000), the fee for the selected sector, and a progress meter with text such as "Add Rs 40 more to reach the delivery minimum". The cart page lists every reason checkout is blocked. |
| **Alternative** | Show the fee only on the cart page, or show a one-time pop-up on the first visit. |
| **Reason** | Students order on a tight budget. Seeing the full cost while choosing dishes lets them decide early whether to add one more dish, switch to pickup, or leave, instead of finding out at the end. |
| **Tradeoff** | The header takes more vertical space, which matters most on phones. On small screens the bar is not sticky, so it scrolls away. |
| **Code location** | `src/components/FulfilmentBar.jsx` (`FulfilmentBar`), the rule in `src/rules/orderRules.js` (`checkOrderValue`), and the blocker list in `src/pages/CartPage.jsx` |
| **Type** | Information hierarchy |
| **Evidence** | 1. Open `/menu`, choose sector H-11. 2. Add one Paneer Roll (Rs 480). 3. The bar shows "Fee: Rs 150 · Add Rs 520 more…". 4. Add another: the meter fills and turns green at Rs 1,000. |

---

## Decision 2 - Show remaining portions on the listing and block what can't be ordered

| Field | Content |
|---|---|
| **Problem** | On the reference site, sold-out or limited items look the same as available ones. The customer only finds out when adding to the cart fails, or at checkout. |
| **Decision** | Every card shows an availability badge with text ("12 available", "Only 3 left", "Sold out today"). Sold-out cards are greyed out and their Add button is disabled. The quantity stepper stops at the real limit (8 per dish, or fewer if stock is lower). There is an "Available now only" filter. Saved orders are re-checked against today's stock. |
| **Alternative** | Hide sold-out dishes completely. |
| **Reason** | Hiding them confuses regular customers who are looking for a favourite dish. Showing "Sold out today" explains why it's missing and stops wasted effort. |
| **Tradeoff** | More visual noise on each card, and the cart has to handle the case where stock drops after something was added (more state logic). |
| **Code location** | `src/components/AvailabilityBadge.jsx`, `src/components/DishCard.jsx`, `src/rules/orderRules.js` (`checkQuantity`, `maxAllowedQuantity`), `src/hooks/useOrderSummary.js` (issue detection) |
| **Type** | Interaction / state |
| **Evidence** | 1. On `/menu`, Seekh Kabab Wrap shows "Sold out today" with a disabled button. 2. Open Chicken Tikka Roll: the stepper stops at 3. 3. Turn on Demo controls → "Reduce stock" and reload: the cart flags the roll as sold out and offers "Remove". |

---

## Decision 3 - Keep search and filters in the URL so Back restores them

| Field | Content |
|---|---|
| **Problem** | On the reference site, opening an item and pressing Back resets the category, search text and scroll position, so the customer has to filter again. |
| **Decision** | Search, category, sort and toggles are stored in the query string (`/menu?q=roll&cat=Wraps+%26+Rolls`) with `useSearchParams`. Dish links carry the current query in router state, and the details page shows "← Back to menu (your filters are kept)". Browser Back/Forward and refresh restore the same view. |
| **Alternative** | Keep filters in React context or localStorage. |
| **Reason** | The URL is the natural home for "what am I looking at": it works with the browser Back button, survives a refresh, and can be shared with a friend ("look at these veg bowls"). |
| **Tradeoff** | URLs become longer, and every filter value has to be parsed and checked (`filtersFromParams`). Typing in search replaces the history entry instead of pushing one, so Back skips individual keystrokes. |
| **Code location** | `src/pages/MenuPage.jsx` (`updateFilters`), `src/utils/filterDishes.js` (`filtersFromParams`, `filtersToParams`, `applyFilters`), `src/pages/DishPage.jsx` (`backTo`) |
| **Type** | Interaction / state |
| **Evidence** | 1. On `/menu` search "roll" and tick "Vegetarian only". 2. Open Paneer Tikka Roll. 3. Press browser Back, or the back link: the search and filter are still applied. 4. Refresh: still applied. |
