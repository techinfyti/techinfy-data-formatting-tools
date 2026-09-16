// XML → JSON conversion — pure, dependency-free, runs entirely in the browser
// via the native DOMParser (no external library needed).

export const XML_MAX_INPUT_LENGTH = 2_000_000;

function coerce(value) {
  if (value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

/**
 * Convert an XML element into a plain JSON-serializable value.
 * Attributes become "@name" keys, mixed text content becomes "#text",
 * and repeated child tag names collapse into an array.
 */
function elementToJson(el, inferTypes) {
  const children = Array.from(el.children);
  const attributes = Array.from(el.attributes ?? []);
  const hasAttributes = attributes.length > 0;

  if (children.length === 0) {
    const text = (el.textContent ?? "").trim();
    if (!hasAttributes) {
      if (text === "") return null;
      return inferTypes ? coerce(text) : text;
    }
    const obj = {};
    for (const attr of attributes) obj[`@${attr.name}`] = attr.value;
    if (text !== "") obj["#text"] = inferTypes ? coerce(text) : text;
    return obj;
  }

  const obj = {};
  for (const attr of attributes) obj[`@${attr.name}`] = attr.value;

  for (const child of children) {
    const key = child.tagName;
    const value = elementToJson(child, inferTypes);
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (Array.isArray(obj[key])) obj[key].push(value);
      else obj[key] = [obj[key], value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

/** Turn the browser's raw parsererror text into a friendlier, line/column-aware message. */
function friendlyXmlError(rawMessage) {
  const match = rawMessage.match(/line (\d+)[^\d]+column (\d+)/i);
  if (match) {
    return `Invalid XML near line ${match[1]}, column ${match[2]}. Check for an unclosed tag, mismatched tag, or unescaped character there.`;
  }
  return "That doesn't look like valid XML. Check for an unclosed tag, mismatched tag, or unescaped character.";
}

export function xmlToJson({ input, inferTypes = false, indent = 2 }) {
  if (input == null || input.trim() === "") {
    return { output: "", error: null };
  }
  if (input.length > XML_MAX_INPUT_LENGTH) {
    return {
      output: "",
      error: `Input is very large (${input.length.toLocaleString()} characters). Please shorten it to under ${XML_MAX_INPUT_LENGTH.toLocaleString()} characters.`,
    };
  }

  const doc = new DOMParser().parseFromString(input, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    return { output: "", error: friendlyXmlError(errorNode.textContent || "") };
  }

  const root = doc.documentElement;
  if (!root || root.nodeName === "parsererror") {
    return { output: "", error: "That doesn't look like valid XML. Check for an unclosed tag, mismatched tag, or unescaped character." };
  }

  try {
    const result = { [root.tagName]: elementToJson(root, inferTypes) };
    const indentArg = indent === "tab" ? "\t" : Number(indent);
    return { output: JSON.stringify(result, null, indentArg), error: null };
  } catch {
    return { output: "", error: "Could not convert this XML. Please check the input and try again." };
  }
}
