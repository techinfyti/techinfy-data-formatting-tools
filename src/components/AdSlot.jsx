import "./AdSlot.css";

/**
 * Reserved space for future ad placements. Renders nothing but a labeled,
 * correctly-sized placeholder so layout does not shift once ads are added.
 * Swap the inner content for a real ad unit when monetization is enabled.
 */
export default function AdSlot({ variant = "banner", className = "" }) {
  return (
    <div className={`ad-slot ad-slot--${variant} ${className}`} aria-hidden="true">
      <span className="ad-slot__label">Ad space reserved</span>
    </div>
  );
}
