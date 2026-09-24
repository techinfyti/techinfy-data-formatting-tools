// Plain text → JSON conversion — pure, dependency-free, runs entirely in the browser.

// See converter.js's MAX_INPUT_LENGTH for the reasoning behind this value:
// large controlled-textarea reflows measurably freeze the browser tab.
export const TEXT_MAX_INPUT_LENGTH = 75_000;

function coerce(value) {
  if (value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

/**
 * Convert plain text into JSON.
 * mode: "lines" (one JSON array item per non-blank line) |
 *       "keyValue" (each "key: value" or "key=value" line becomes an object entry)
 */
export function textToJson({ input, mode = "lines", inferTypes = false, indent = 2 }) {
  if (input == null || input.trim() === "") {
    return { output: "", error: null, rowCount: 0 };
  }
  if (input.length > TEXT_MAX_INPUT_LENGTH) {
    return {
      output: "",
      error: `Input is very large (${input.length.toLocaleString()} characters). Please shorten it to under ${TEXT_MAX_INPUT_LENGTH.toLocaleString()} characters.`,
      rowCount: 0,
    };
  }

  const lines = input.split(/\r\n|\r|\n/).filter((l) => l.trim() !== "");
  const indentArg = indent === "tab" ? "\t" : Number(indent);

  try {
    if (mode === "keyValue") {
      const obj = {};
      for (const line of lines) {
        const match = line.match(/^([^:=]+)[:=](.*)$/);
        if (!match) {
          return { output: "", error: `Couldn't parse this line as "key: value" — "${line.trim()}".`, rowCount: 0 };
        }
        const key = match[1].trim();
        const rawValue = match[2].trim();
        obj[key] = inferTypes ? coerce(rawValue) : rawValue;
      }
      return { output: JSON.stringify(obj, null, indentArg), error: null, rowCount: Object.keys(obj).length };
    }

    const values = lines.map((l) => (inferTypes ? coerce(l.trim()) : l.trim()));
    return { output: JSON.stringify(values, null, indentArg), error: null, rowCount: values.length };
  } catch {
    return { output: "", error: "Could not convert this text. Please check the input and try again.", rowCount: 0 };
  }
}
