// YAML → JSON conversion. Parsing is delegated to js-yaml, which the caller
// loads dynamically (see ToJsonConverter) so it only ships to the browser
// when a visitor actually picks YAML as the source format.

export const YAML_MAX_INPUT_LENGTH = 2_000_000;

/** Turn js-yaml's YAMLException into a friendlier, line/column-aware message. */
function friendlyYamlError(err) {
  const mark = err?.mark;
  if (mark && typeof mark.line === "number") {
    const reason = err.reason ? ` ${err.reason}.` : "";
    return `Invalid YAML near line ${mark.line + 1}, column ${mark.column + 1}.${reason} Check indentation and colons.`;
  }
  return "That doesn't look like valid YAML. Check indentation, colons, and list dashes.";
}

/**
 * Convert YAML text into JSON.
 * yamlLib: the dynamically-imported js-yaml module (null while still loading).
 */
export function yamlToJson({ input, yamlLib, indent = 2 }) {
  if (input == null || input.trim() === "") {
    return { output: "", error: null };
  }
  if (input.length > YAML_MAX_INPUT_LENGTH) {
    return {
      output: "",
      error: `Input is very large (${input.length.toLocaleString()} characters). Please shorten it to under ${YAML_MAX_INPUT_LENGTH.toLocaleString()} characters.`,
    };
  }
  if (!yamlLib) {
    return { output: "", error: null };
  }

  try {
    const value = yamlLib.load(input);
    if (value === undefined) {
      return { output: "", error: null };
    }
    const indentArg = indent === "tab" ? "\t" : Number(indent);
    return { output: JSON.stringify(value, null, indentArg), error: null };
  } catch (err) {
    return { output: "", error: friendlyYamlError(err) };
  }
}
