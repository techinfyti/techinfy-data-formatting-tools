// CSV/TSV → JSON conversion — pure, dependency-free, runs entirely in the browser.

// See converter.js's MAX_INPUT_LENGTH for the reasoning behind this value:
// large controlled-textarea reflows measurably freeze the browser tab.
export const CSV_MAX_INPUT_LENGTH = 150_000;

/** RFC4180-ish parser: handles quoted fields, embedded delimiters/newlines, and "" escapes. */
function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // ignore; \n (if present) closes the row
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return { rows: rows.filter((r) => !r.every((f) => f === "")), unterminatedQuote: inQuotes };
}

function coerce(value) {
  if (value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

/**
 * Convert CSV/TSV text into JSON.
 * delimiter: "," | "\t" | ";" | "|" | custom single/multi-char string
 * output: "objects" (array of row objects, using the header row) | "arrays" (array of arrays)
 */
export function csvToJson({ input, delimiter = ",", hasHeader = true, inferTypes = false, indent = 2 }) {
  if (input == null || input.trim() === "") {
    return { output: "", error: null, rowCount: 0 };
  }
  if (input.length > CSV_MAX_INPUT_LENGTH) {
    return {
      output: "",
      error: `Input is very large (${input.length.toLocaleString()} characters). Please shorten it to under ${CSV_MAX_INPUT_LENGTH.toLocaleString()} characters.`,
      rowCount: 0,
    };
  }
  if (!delimiter) {
    return { output: "", error: "Please choose a delimiter.", rowCount: 0 };
  }

  try {
    const { rows, unterminatedQuote } = parseDelimited(input, delimiter);
    if (unterminatedQuote) {
      return { output: "", error: 'Unterminated quote — check for a missing closing " character.', rowCount: 0 };
    }
    if (rows.length === 0) {
      return { output: "", error: null, rowCount: 0 };
    }

    const transform = (v) => (inferTypes ? coerce(v) : v);
    let result;

    if (hasHeader) {
      const [headerRow, ...dataRows] = rows;
      const header = headerRow.map((h, i) => (h.trim() !== "" ? h.trim() : `column_${i + 1}`));
      result = dataRows.map((r) => {
        const obj = {};
        header.forEach((key, i) => {
          obj[key] = transform(r[i] ?? "");
        });
        return obj;
      });
    } else {
      result = rows.map((r) => r.map(transform));
    }

    const indentArg = indent === "tab" ? "\t" : Number(indent);
    return { output: JSON.stringify(result, null, indentArg), error: null, rowCount: result.length };
  } catch {
    return { output: "", error: "Could not parse this file. Please check the input and try again.", rowCount: 0 };
  }
}
