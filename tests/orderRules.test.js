// Automated test for the pricing/fulfilment rule (Task 6.2).
// Run with:  npm test   (which runs: node --test)
// The function under test is the SAME one used by the React app
// (src/hooks/useOrderSummary.js and src/components/FulfilmentBar.jsx).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkOrderValue,
  MIN_DELIVERY_SUBTOTAL,
  FREE_DELIVERY_FROM,
  checkQuantity,
  MAX_PER_ITEM,
} from '../src/rules/orderRules.js';

test('valid: delivery order above the minimum is accepted and charged the zone fee', () => {
  const result = checkOrderValue({ subtotal: 1500, method: 'delivery', zoneFee: 150 });
  assert.equal(result.ok, true);
  assert.equal(result.fee, 150);
  assert.equal(result.shortfall, 0);
});

test('boundary: subtotal exactly at the minimum (Rs 1000) is accepted', () => {
  const result = checkOrderValue({ subtotal: MIN_DELIVERY_SUBTOTAL, method: 'delivery', zoneFee: 100 });
  assert.equal(result.ok, true);
  assert.equal(result.fee, 100);
});

test('broken: subtotal one rupee below the minimum is rejected with the shortfall', () => {
  const result = checkOrderValue({ subtotal: MIN_DELIVERY_SUBTOTAL - 1, method: 'delivery', zoneFee: 100 });
  assert.equal(result.ok, false);
  assert.equal(result.shortfall, 1);
  assert.match(result.message, /Add Rs 1 more/);
});

test('pickup has no minimum order and no fee', () => {
  const result = checkOrderValue({ subtotal: 180, method: 'pickup', zoneFee: 150 });
  assert.deepEqual(result, { ok: true, fee: 0, shortfall: 0, message: '' });
});

test('boundary: delivery becomes free exactly at the free-delivery threshold', () => {
  assert.equal(checkOrderValue({ subtotal: FREE_DELIVERY_FROM - 1, method: 'delivery', zoneFee: 150 }).fee, 150);
  assert.equal(checkOrderValue({ subtotal: FREE_DELIVERY_FROM, method: 'delivery', zoneFee: 150 }).fee, 0);
});

// Extra coverage for the availability rule.
test('quantity rule: exactly the per-dish limit is allowed, one more is not', () => {
  assert.equal(checkQuantity(MAX_PER_ITEM, 20).ok, true);
  assert.equal(checkQuantity(MAX_PER_ITEM + 1, 20).ok, false);
  assert.equal(checkQuantity(3, 3).ok, true);
  assert.equal(checkQuantity(4, 3).ok, false);
});
