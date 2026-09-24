import { useLayoutEffect, useRef, useState } from "react";
import "./LineNumberedTextarea.css";

// Extra lines rendered above/below the visible window, so a fast scroll
// doesn't show a blank gap for a frame before React catches up.
const VIRTUALIZE_BUFFER_LINES = 15;

// Lines in the hidden calibration block used to measure per-line pixel
// height. More than 1 for measurement precision; otherwise arbitrary.
const CALIBRATION_LINES = 20;

function countLines(text) {
  return text ? text.split("\n").length : 1;
}

const calibrationText = Array.from({ length: CALIBRATION_LINES }, (_, i) => i + 1).join("\n");

/**
 * A textarea with a synced line-number gutter, like a code editor.
 * Wrapping is disabled (long lines scroll horizontally instead) so each
 * line always occupies exactly one visual row — otherwise a wrapped line
 * would throw off every number below it.
 *
 * The gutter is virtualized: it only ever renders the handful of line
 * numbers currently visible (plus a small buffer), positioned with a CSS
 * transform computed from the textarea's real scroll position — never the
 * full list. A document with 100,000 lines and one with 20 cost the same
 * to render here, which is what makes very large pastes safe to display at
 * all (see MAX_INPUT_LENGTH for why the *input* side still has a ceiling —
 * this only fixes the gutter's own added cost, not the textarea's).
 *
 * The per-line pixel height is measured off a tiny hidden calibration
 * block, not the real textarea — reading layout (scrollHeight etc.) off
 * the actual content forces the browser to fully reflow it first, which
 * is exactly the cost this component exists to avoid at large sizes.
 *
 * The box stays a fixed height and scrolls internally for large pastes
 * (matching delim.co's own input box) rather than growing the page.
 */
export default function LineNumberedTextarea({ value, onChange, placeholder, readOnly, ariaLabel, maxLength, onExceedsMaxLength }) {
  const gutterRef = useRef(null);
  const textareaRef = useRef(null);
  const calibrationRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [metrics, setMetrics] = useState({ lineHeight: 21, clientHeight: 288 });

  // No debounce needed here: virtualization already removed the expensive
  // part (rendering every line number), so counting lines is cheap enough
  // to do on every render. Debouncing it previously left totalLines lagging
  // scrollTop by up to a debounce cycle — e.g. right after pasting content
  // that auto-scrolls to the bottom, the gutter would clamp to the *old*
  // (much smaller) line count and show the wrong numbers for a moment.
  const totalLines = countLines(value);

  // Measure once on mount and again on resize (font/zoom can change
  // line-height) — never on content changes, so this stays O(1) no matter
  // how large the pasted document is.
  useLayoutEffect(() => {
    function measure() {
      if (!calibrationRef.current || !gutterRef.current) return;
      const lineHeight = calibrationRef.current.getBoundingClientRect().height / CALIBRATION_LINES;
      const clientHeight = gutterRef.current.clientHeight;
      setMetrics((prev) =>
        prev.lineHeight === lineHeight && prev.clientHeight === clientHeight
          ? prev
          : { lineHeight, clientHeight }
      );
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { lineHeight, clientHeight } = metrics;
  const firstVisibleLine = Math.max(1, Math.floor(scrollTop / lineHeight) - VIRTUALIZE_BUFFER_LINES + 1);
  const lastVisibleLine = Math.min(totalLines, Math.ceil((scrollTop + clientHeight) / lineHeight) + VIRTUALIZE_BUFFER_LINES);
  const offsetY = (firstVisibleLine - 1) * lineHeight - scrollTop;

  let visibleNumbers = "";
  for (let n = firstVisibleLine; n <= lastVisibleLine; n++) {
    visibleNumbers += n === firstVisibleLine ? n : `\n${n}`;
  }

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // A native paste reflows the DOM the instant the browser inserts it —
  // before React's onChange (or any JS-level guard/throttle) ever runs.
  // Blocking it here, before insertion, is the only way to avoid paying
  // that reflow cost at all for a paste that would be rejected anyway.
  const handlePasteCapture = (e) => {
    if (maxLength == null) return;
    const pasted = e.clipboardData?.getData("text") ?? "";
    if (value.length + pasted.length > maxLength) {
      e.preventDefault();
      onExceedsMaxLength?.();
    }
  };

  return (
    <div className="line-numbered">
      <div className="line-numbered__gutter" ref={gutterRef} aria-hidden="true">
        <div ref={calibrationRef} className="line-numbered__gutter-calibration">
          {calibrationText}
        </div>
        <div className="line-numbered__gutter-inner" style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleNumbers}
        </div>
      </div>
      <textarea
        ref={textareaRef}
        className="line-numbered__textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        onPaste={handlePasteCapture}
        readOnly={readOnly}
        spellCheck="false"
        aria-label={ariaLabel}
        wrap="off"
      />
    </div>
  );
}
