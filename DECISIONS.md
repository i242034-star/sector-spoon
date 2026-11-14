# Frontend Decisions - Sector Spoon

One decision for each problem observed on the reference restaurant websites (checked on 14 Nov 2026).
The screenshots are in the PDF report.

| # | Reference problem | Decision type |
|---|---|---|
| 1 | Cheezious asks for sign-in before anything can go in the cart | Interaction / state |
| 2 | Domino's Pakistan shows no delivery charges or minimum order on the menu, and requires a full address before adding an item | Information hierarchy |
| 3 | Domino's Pakistan: pressing browser Back changes the URL but leaves the item pop-up open | Interaction / state |

---

## Decision 1 - Let customers build an order without signing in

| Field | Content |
|---|---|
| **Problem** | On cheezious.com/menu, pressing "+ Add to cart" on any item opens "Please Sign-In to Place an Order" and asks for a phone number and OTP. The cart stays empty, so the customer can't see a total or compare a few items without first giving a phone number. |
| **Decision** | The cart works as a guest from the first click. Items, spice choices and quantities are kept in React state (CartContext) and saved in localStorage, so they survive a refresh or closing the tab. Name and phone are only asked for at the last step (checkout), and are never stored. |
| **Alternative** | Ask for a phone number up front but let the customer skip it ("Continue as guest"). |
| **Reason** | Students often compare options with friends before deciding. Letting them build and price an order first keeps the decision quick; contact details are only needed once they are actually ordering. |
| **Tradeoff** | A cart saved only in the browser doesn't follow the customer to another device, and a saved cart can go out of date. Every restored line has to be re-checked against today's stock (more state logic). |
| **Code location** | `src/context/CartContext.jsx` (`CartProvider`, `addItem`, the localStorage effect), `src/hooks/useOrderSummary.js` (re-checks restored lines), `src/pages/CheckoutPage.jsx` (contact fields only here) |
| **Evidence** | 1. Open `/menu` and press "Add to order" on Chicken Yakhni Pulao: it is added at once and the header count shows 1. 2. Close the tab and reopen: the order is still there. 3. Name/phone only appear on `/checkout`. |

---

## Decision 2 - Show delivery charges, minimum order and delivery area on every page

| Field | Content |
|---|---|
| **Problem** | On dominos.com.pk/menu the page shows item prices only. The header says "Delivering to PLEASE SELECT L…", and no text on the menu mentions a delivery charge or minimum order. Pressing "Add to Order" shows "Please select your location" and asks for a full street address. The item was not added (the cart stayed at 0). |
| **Decision** | A delivery/pickup bar sits under the header on every page. Choosing a sector (not a full address) immediately shows that sector's fee, the Rs 1,000 delivery minimum and the Rs 3,000 free-delivery threshold, with a progress meter ("Add Rs 520 more to reach the delivery minimum"). Pickup shows "no minimum order, no fee". The full address is only asked for at checkout. |
| **Alternative** | Show the fees only in the cart, or show a one-time pop-up on the first visit. |
| **Reason** | Students order on a budget. Seeing the full cost while choosing lets them decide early whether to add a dish, switch to pickup, or leave, instead of finding out at the end. |
| **Tradeoff** | The header takes more vertical space, which matters most on phones. On small screens the bar is not sticky and the menu filters are collapsed to make room. |
| **Code location** | `src/components/FulfilmentBar.jsx` (`FulfilmentBar`), `src/rules/orderRules.js` (`checkOrderValue`), `src/pages/CartPage.jsx` (blocker list), `src/components/MenuControls.jsx` (collapsible filters on mobile) |
| **Evidence** | 1. On `/menu` choose sector H-11. 2. Add one Paneer Tikka Roll (Rs 480). 3. The bar shows "Fee: Rs 150 · Add Rs 520 more to reach the delivery minimum". 4. Add one more: the meter fills and turns green. |

---

## Decision 3 - Dish details are real pages, and filters live in the URL

| Field | Content |
|---|---|
| **Problem** | On dominos.com.pk/menu, opening "6 Pcs Chicken Wings" opens a pop-up and changes the URL to `#item_6PcsChickenWings_117`. Pressing the browser Back button changes the URL back to `#CHICKENCORNER`, but the pop-up stays open, so Back doesn't do what the customer expects. On Android, Back is the usual way to close something. |
| **Decision** | Each dish has its own route (`/menu/:dishId`). Search, category, sort and toggles are kept in the query string (`/menu?q=roll&cat=Wraps+%26+Rolls`) with `useSearchParams`. Back, Forward and refresh therefore always match what is on screen, and "← Back to menu (your filters are kept)" returns to the same filtered list. |
| **Alternative** | Open dish details in a modal and keep filters in React context or localStorage. |
| **Reason** | A real page makes the browser's Back button, refresh and sharing a link all work without extra code, and the URL always describes what the customer is looking at. |
| **Tradeoff** | Opening a dish is a full page change instead of an overlay, so the list is no longer visible behind it. Filter values in the URL also have to be parsed and checked (`filtersFromParams`). |
| **Code location** | `src/App.jsx` (routes), `src/pages/MenuPage.jsx` (`updateFilters`), `src/utils/filterDishes.js` (`filtersFromParams`, `filtersToParams`, `applyFilters`), `src/pages/DishPage.jsx` (`backTo`) |
| **Evidence** | 1. On `/menu` choose category "Wraps & Rolls". 2. Open Paneer Tikka Roll (`/menu/paneer-roll`). 3. Press browser Back: you are on `/menu?cat=Wraps+%26+Rolls` with the same 3 dishes and nothing left open. |
