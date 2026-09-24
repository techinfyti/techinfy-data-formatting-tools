import { useEffect, useRef } from "react";
import "./LineNumberedTextarea.css";

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
 * The box grows to fit all content (page scrolls, not the box) rather
 * than capping at a fixed height, matching how a plain textarea behaves.
 */
export default function LineNumberedTextarea({ value, onChange, placeholder, readOnly, ariaLabel }) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    if (!textarea) return;
    // Reset both first: a flex row stretches its items to the tallest one,
    // so a still-tall gutter from the previous render would otherwise keep
    // forcing the textarea's measured scrollHeight to stay large too.
    textarea.style.height = "auto";
    if (gutter) gutter.style.height = "auto";
    const nextHeight = Math.max(textarea.scrollHeight, 320);
    textarea.style.height = `${nextHeight}px`;
    if (gutter) gutter.style.height = `${nextHeight}px`;
  }, [value]);

  return (
    <div className="line-numbered">
      <div className="line-numbered__gutter" ref={gutterRef} aria-hidden="true">
        {getLineNumbers(value)}
      </div>
      <textarea
        ref={textareaRef}
        className="line-numbered__textarea"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        spellCheck="false"
        aria-label={ariaLabel}
        wrap="off"
      />
    </div>
  );
}
