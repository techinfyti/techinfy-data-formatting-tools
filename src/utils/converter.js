// Core, dependency-free data conversion utilities.
// Everything here runs synchronously in the browser — no network calls.

export const DELIMITER_PRESETS = [
  { id: "comma", label: "Comma ( , )", value: "," },
  { id: "semicolon", label: "Semicolon ( ; )", value: ";" },
  { id: "pipe", label: "Pipe ( | )", value: "|" },
  { id: "tab", label: "Tab", value: "\t" },
  { id: "space", label: "Space", value: " " },
  { id: "newline", label: "New Line", value: "\n" },
];

// Measured directly, twice. First: a single controlled-textarea reflow
// scales roughly linearly with content size (100,000 lines/~640k chars took
// ~2s for one textarea; this page has two). Second, and more important:
// rapid back-to-back updates (e.g. pasting several times in quick
// succession) each reflow again with no gap to breathe, so even individually
// "safe" updates compound — a real burst growing to ~288,000 chars measured
// over 9 seconds of cumulative main-thread time even with updates throttled
// (see setInputGuarded), while the same burst capped at 150,000 chars
// measured under 3 seconds. 150,000 keeps a solid margin under that curve
// while still comfortably fitting realistic pasted data.
export const MAX_INPUT_LENGTH = 150_000;

/**
 * Resolve the active delimiter string from the UI state.
 * Handles named escape sequences a user might type into the custom field.
 */
export function resolveDelimiter({ presetId, customValue }) {
  if (presetId !== "custom") {
    const preset = DELIMITER_PRESETS.find((p) => p.id === presetId);
    return preset ? preset.value : ",";
  }
  if (customValue == null || customValue === "") return null; // invalid: caller should handle
  return customValue
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r");
}

function splitDelimited(text, delimiter) {
  if (!delimiter) return [text];
  if (delimiter === "\n") return text.split(/\r\n|\r|\n/);
  if (delimiter === " ") return text.split(/\s+/);
  return text.split(delimiter);
}

function quoteValue(value, { addQuotes, quoteChar }) {
  if (!addQuotes) return value;
  const q = quoteChar === "single" ? "'" : '"';
  const escaped = value.split(q).join(q + q);
  return `${q}${escaped}${q}`;
}

/**
 * Apply formatting options (trim, dedupe, sort, empty-line removal, quoting, prefix/suffix)
 * to an ordered list of string values. Order of operations is fixed and documented in the UI.
 */
export function applyFormatting(values, options) {
  let result = values;

  if (options.trimSpaces) {
    result = result.map((v) => v.trim());
  }

  if (options.removeEmptyLines) {
    result = result.filter((v) => v.trim() !== "");
  }

  if (options.removeDuplicates) {
    const seen = new Set();
    result = result.filter((v) => {
      const key = options.trimSpaces ? v : v.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (options.sortOrder === "asc") {
    result = [...result].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  } else if (options.sortOrder === "desc") {
    result = [...result].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: "base" }));
  }

  if (options.removePrefix) {
    result = result.map((v) => (v.startsWith(options.removePrefix) ? v.slice(options.removePrefix.length) : v));
  }
  if (options.removeSuffix) {
    result = result.map((v) => (v.endsWith(options.removeSuffix) ? v.slice(0, v.length - options.removeSuffix.length) : v));
  }

  if (options.prefix) {
    result = result.map((v) => `${options.prefix}${v}`);
  }
  if (options.suffix) {
    result = result.map((v) => `${v}${options.suffix}`);
  }

  if (options.addQuotes) {
    result = result.map((v) => quoteValue(v, options));
  }

  return result;
}

/**
 * Main conversion entry point.
 * mode: "listToDelimited" | "delimitedToList"
 */
export function convert({ input, mode, delimiter, options }) {
  if (input == null || input.trim() === "") {
    return { output: "", count: 0, error: null };
  }

  if (delimiter == null) {
    return { output: "", count: 0, error: "Please enter a custom delimiter, or choose a preset." };
  }

  try {
    if (mode === "delimitedToList") {
      const values = applyFormatting(splitDelimited(input, delimiter), options);
      return { output: values.join("\n"), count: values.length, error: null };
    }

    // listToDelimited: one value per line (a pasted spreadsheet column). Each line is
    // also split by the chosen delimiter if it contains it, so a single-line list like
    // "apple,orange,fruit" still splits into values, and so does an embedded delimiter
    // inside one line of multi-line input. Whitespace is only treated as a separator
    // when Space is the chosen delimiter, so "New York" stays intact under a comma.
    const sourceValues = input.split(/\r\n|\r|\n/).flatMap((line) => {
      if (line.trim() === "") return [line];
      const byDelimiter = splitDelimited(line, delimiter);
      return byDelimiter.length > 1 ? byDelimiter : [line];
    });

    const values = applyFormatting(sourceValues, options);
    return { output: values.join(delimiter), count: values.length, error: null };
  } catch {
    return { output: "", count: 0, error: "Something went wrong while converting. Please check your input and try again." };
  }
}

/** Split raw textarea input into a clean list of non-empty trimmed lines (used by presets). */
export function toLines(input) {
  if (!input) return [];
  return input.split(/\r\n|\r|\n/).map((l) => l.trim()).filter((l) => l !== "");
}

function escapeForJs(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export const PRESETS = [
  {
    id: "sql-in",
    label: "SQL IN Clause",
    description: "Wraps values for a SQL IN (...) clause.",
    run: (input) => {
      const lines = toLines(input);
      const quoted = lines.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
      return `IN (${quoted})`;
    },
  },
  {
    id: "sql-values",
    label: "SQL Values List",
    description: "Just the parenthesized, quoted value list (no IN keyword).",
    run: (input) => {
      const lines = toLines(input);
      const quoted = lines.map((v) => `'${v.replace(/'/g, "''")}'`).join(", ");
      return `(${quoted})`;
    },
  },
  {
    id: "json-array",
    label: "JSON Array",
    description: "Pretty-printed JSON array of strings.",
    run: (input) => JSON.stringify(toLines(input), null, 2),
  },
  {
    id: "js-array",
    label: "JavaScript Array",
    description: "A JS array literal, one value per line.",
    run: (input) => {
      const lines = toLines(input);
      if (lines.length === 0) return "[]";
      const body = lines.map((v) => `  "${escapeForJs(v)}"`).join(",\n");
      return `[\n${body}\n]`;
    },
  },
  {
    id: "csv",
    label: "CSV",
    description: "Comma-separated values, quoted when they contain commas or quotes.",
    run: (input) => {
      const lines = toLines(input);
      return lines
        .map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
        .join(",");
    },
  },
  {
    id: "quoted-list",
    label: "Quoted List",
    description: 'Double-quoted values separated by ", ".',
    run: (input) => toLines(input).map((v) => `"${v.replace(/"/g, '\\"')}"`).join(", "),
  },
];
