/**
 * Problem 2 fix: remaining portions are visible on the listing itself,
 * always as text (not colour alone).
 */
export default function AvailabilityBadge({ portionsLeft }) {
  if (portionsLeft <= 0) {
    return <span className="badge badge--soldout">Sold out today</span>;
  }
  if (portionsLeft <= 5) {
    return <span className="badge badge--low">Only {portionsLeft} left</span>;
  }
  return <span className="badge badge--ok">{portionsLeft} available</span>;
}
