// Core JSON formatting logic — pure, dependency-free, runs entirely in the browser.

// See converter.js's MAX_INPUT_LENGTH for why this is 100,000, not millions:
// large controlled-textarea reflows measurably freeze the browser tab.
export const JSON_MAX_INPUT_LENGTH = 100_000;

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep(value[key]);
        return acc;
      }, {});
  }
  return value;
}

/** Turn JSON.parse's raw error into a friendlier, line/column-aware message. */
function friendlyParseError(input, err) {
  const match = err.message.match(/position (\d+)/);
  if (!match) return "That doesn't look like valid JSON. Check for a missing comma, bracket, or quote.";
  const pos = Number(match[1]);
  const upToPos = input.slice(0, pos);
  const line = upToPos.split("\n").length;
  const lastNewline = upToPos.lastIndexOf("\n");
  const column = pos - lastNewline;
  return `Invalid JSON near line ${line}, column ${column}. Check for a missing comma, bracket, or quote there.`;
}

function parseJson(input) {
  try {
    return { value: JSON.parse(input), error: null };
  } catch (err) {
    return { value: null, error: friendlyParseError(input, err) };
  }
}

/**
 * Pretty-print or minify arbitrary JSON.
 * mode: "format" | "minify"
 * indent: 2 | 4 | "tab" (ignored when minifying)
 */
export function processJson({ input, mode, indent = 2, sortKeys = false }) {
  if (input == null || input.trim() === "") {
    return { output: "", error: null };
  }
  if (input.length > JSON_MAX_INPUT_LENGTH) {
    return {
      output: "",
      error: `Input is very large (${input.length.toLocaleString()} characters). Please shorten it to under ${JSON_MAX_INPUT_LENGTH.toLocaleString()} characters.`,
    };
  }

  const { value, error } = parseJson(input);
  if (error) return { output: "", error };

  try {
    const finalValue = sortKeys ? sortKeysDeep(value) : value;
    if (mode === "minify") {
      return { output: JSON.stringify(finalValue), error: null };
    }
    const indentArg = indent === "tab" ? "\t" : Number(indent);
    return { output: JSON.stringify(finalValue, null, indentArg), error: null };
  } catch {
    return { output: "", error: "Could not format this JSON. Please check the input and try again." };
  }
}
