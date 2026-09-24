import { useEffect, useRef, useState } from "react";
import "./LineNumberedTextarea.css";

// Above this size, debounce the (expensive) gutter recompute so fast typing
// or a large paste doesn't lag — splitting/joining thousands of lines on
// every keystroke is the main cost, not the character count itself.
const DEBOUNCE_THRESHOLD = 5_000;
const DEBOUNCE_DELAY = 200;

/** Line numbers must count every line (including blank ones) to stay aligned with the textarea's rows. */
function getLineNumbers(text) {
  const count = text ? text.split("\n").length : 1;
  return Array.from({ length: count }, (_, i) => i + 1).join("\n");
}

/**
 * A textarea with a synced line-number gutter, like a code editor.
 * Wrapping is disabled (long lines scroll horizontally instead) so each
 * line always occupies exactly one visual row — otherwise a wrapped line
 * would throw off every number below it.
 *
 * The box stays a fixed height and scrolls internally for large pastes
 * (matching delim.co's own input box) rather than growing the page.
 */
export default function LineNumberedTextarea({ value, onChange, placeholder, readOnly, ariaLabel }) {
  const gutterRef = useRef(null);
  const textareaRef = useRef(null);
  const delay = value.length > DEBOUNCE_THRESHOLD ? DEBOUNCE_DELAY : 0;
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  // Below the threshold, skip the state round-trip and reflect the value
  // immediately — keeps everyday typing at zero added latency.
  const debouncedValue = delay <= 0 ? value : debounced;

  // While debounced, the gutter's own height lags behind the textarea's, so
  // a scroll during that window clamps the gutter's scrollTop to its
  // too-small max. Once the debounce catches up and the gutter regrows, it
  // otherwise stays stuck at that clamped position — re-sync it here.
  useEffect(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [debouncedValue]);

  const handleScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  return (
    <div className="line-numbered">
      <div className="line-numbered__gutter" ref={gutterRef} aria-hidden="true">
        {getLineNumbers(debouncedValue)}
      </div>
      <textarea
        ref={textareaRef}
        className="line-numbered__textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        readOnly={readOnly}
        spellCheck="false"
        aria-label={ariaLabel}
        wrap="off"
      />
    </div>
  );
}
