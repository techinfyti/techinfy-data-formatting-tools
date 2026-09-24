import { useRef } from "react";
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
 */
export default function LineNumberedTextarea({ value, onChange, placeholder, readOnly, ariaLabel }) {
  const gutterRef = useRef(null);

  const handleScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  return (
    <div className="line-numbered">
      <div className="line-numbered__gutter" ref={gutterRef} aria-hidden="true">
        {getLineNumbers(value)}
      </div>
      <textarea
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
