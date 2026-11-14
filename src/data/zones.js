// Delivery zones (Islamabad sectors) served from the H-9 kitchen.
// Fees are flat per zone; the pricing rule may waive them.

export const KITCHEN_LOCATION = 'Plot 14, H-9/1 Markaz, Islamabad (fictional)';

export const deliveryZones = [
  { id: 'h-8', name: 'H-8', fee: 100 },
  { id: 'h-9', name: 'H-9', fee: 80 },
  { id: 'h-10', name: 'H-10', fee: 120 },
  { id: 'h-11', name: 'H-11 (FAST, hostels)', fee: 150 },
  { id: 'h-12', name: 'H-12 (NUST)', fee: 180 },
  { id: 'g-9', name: 'G-9', fee: 130 },
  { id: 'g-10', name: 'G-10', fee: 150 },
  { id: 'i-8', name: 'I-8', fee: 150 },
];

export const PICKUP_SLOTS = ['12:30', '13:00', '13:30', '19:00', '19:30', '20:00'];
