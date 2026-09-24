import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import {
  DELIMITER_PRESETS,
  MAX_INPUT_LENGTH,
  PRESETS,
  resolveDelimiter,
  convert,
} from "../utils/converter.js";
import LineNumberedTextarea from "./LineNumberedTextarea.jsx";
import "./Converter.css";

const SAMPLE_INPUT = "Apple\nOrange\nBanana\nMango\nGrape";

// Common binary formats a user might mistakenly drop in — reject by name up
// front with a clear message rather than loading them as garbled "text".
const BINARY_FILE_PATTERN = /\.(xlsx|xls|docx|doc|pdf|pptx|ppt|zip|rar|7z|png|jpe?g|gif|bmp|exe|bin)$/i;
// Fallback for binary files with a misleading extension: real text files
// rarely contain the Unicode replacement character or raw control bytes.
// eslint-disable-next-line no-control-regex -- intentional: detecting binary content
const BINARY_CONTENT_PATTERN = /[�\x00-\x08\x0E-\x1F]/g;

const DEFAULT_OPTIONS = {
  removeDuplicates: false,
  removeEmptyLines: true,
  trimSpaces: true,
  sortOrder: "none",
  addQuotes: false,
  quoteChar: "double",
  removePrefix: "",
  removeSuffix: "",
  prefix: "",
  suffix: "",
};

function countLines(text) {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).filter((l) => l !== "").length;
}

function useToast() {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((msg) => {
    setMessage(msg);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return [message, show];
}

// Above this size, debounce the (expensive) conversion so a large paste or
// fast typing doesn't block the textarea from updating. Below it, updates
// stay instant — the whole point of a live converter. Cost scales with line
// count more than character count, so this is set low enough to catch
// large inputs even when lines are short (e.g. ~10k short lines is only
// ~50k characters, which used to sail past a naive char-only threshold).
const DEBOUNCE_THRESHOLD = 5_000;
const DEBOUNCE_DELAY = 200;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  // Below the threshold, skip the state round-trip entirely and reflect
  // the value immediately — keeps everyday typing at zero added latency.
  return delay <= 0 ? value : debounced;
}

const MODE = "listToDelimited";

export default function Converter({ id }) {
  const [input, setInput] = useState("");
  const [presetId, setPresetId] = useState("comma");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [activeQuickPreset, setActiveQuickPreset] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toast, showToast] = useToast();
  const fileInputRef = useRef(null);

  const isTooLarge = input.length > MAX_INPUT_LENGTH;

  const debouncedInput = useDebouncedValue(
    input,
    input.length > DEBOUNCE_THRESHOLD ? DEBOUNCE_DELAY : 0
  );

  const delimiter = useMemo(
    () => resolveDelimiter({ presetId, customValue: customDelimiter }),
    [presetId, customDelimiter]
  );

  const { output, count, error } = useMemo(() => {
    if (isTooLarge) {
      return { output: "", count: 0, error: `Input is very large (${input.length.toLocaleString()} characters). Please shorten it to under ${MAX_INPUT_LENGTH.toLocaleString()} characters.` };
    }
    if (activeQuickPreset) {
      const preset = PRESETS.find((p) => p.id === activeQuickPreset);
      if (!preset) return { output: "", count: 0, error: null };
      if (!debouncedInput.trim()) return { output: "", count: 0, error: null };
      try {
        return { output: preset.run(debouncedInput), count: countLines(debouncedInput), error: null };
      } catch {
        return { output: "", count: 0, error: "Could not apply this preset to the current input." };
      }
    }
    return convert({ input: debouncedInput, mode: MODE, delimiter, options });
  }, [debouncedInput, delimiter, options, isTooLarge, activeQuickPreset, input.length]);

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Rejecting an oversized paste/type here (rather than only flagging it
  // after the fact) keeps it out of React state entirely — a controlled
  // textarea reflows on every value change, and that cost is what caused a
  // real browser freeze on a very large paste. See MAX_INPUT_LENGTH.
  const setInputGuarded = (text) => {
    if (text.length > MAX_INPUT_LENGTH) {
      showToast(`That's too much text to paste at once (over ${MAX_INPUT_LENGTH.toLocaleString()} characters). Please use a smaller amount.`);
      return;
    }
    setInput(text);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputGuarded(text);
      setActiveQuickPreset(null);
    } catch {
      showToast("Clipboard access was blocked. Paste manually with Ctrl/Cmd+V.");
    }
  };

  const handleClear = () => {
    setInput("");
    setActiveQuickPreset(null);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_INPUT);
    setActiveQuickPreset(null);
  };

  const handleCopy = async () => {
    if (!output) {
      showToast("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      showToast("Copied!");
    } catch {
      showToast("Couldn't copy automatically — please select and copy manually.");
    }
  };

  const handleDownload = (extension) => {
    if (!output) {
      showToast("Nothing to download yet.");
      return;
    }
    try {
      const mime = extension === "csv" ? "text/csv" : "text/plain";
      const blob = new Blob([output], { type: `${mime};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `techinfy-data.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showToast("Download failed. Please try copying the output instead.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_INPUT_LENGTH * 2) {
      showToast("That file is too large to load.");
      e.target.value = "";
      return;
    }
    if (BINARY_FILE_PATTERN.test(file.name)) {
      showToast("That's a binary file (e.g. Excel/Word), not plain text. Please export it as .csv or .txt first.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const suspicious = (text.match(BINARY_CONTENT_PATTERN) || []).length;
      if (text.length > 0 && suspicious / text.length > 0.02) {
        showToast("That file doesn't look like plain text. Please upload a .txt, .csv, .tsv or .log file.");
        return;
      }
      setInput(text);
      setActiveQuickPreset(null);
    };
    reader.onerror = () => showToast("Couldn't read that file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const runQuickPreset = (id) => {
    setActiveQuickPreset((current) => (current === id ? null : id));
  };

  return (
    <section id={id} className="converter" aria-label="Data converter">
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className="converter__settings card">
        <div className="settings-row">
          <div className="settings-group settings-group--delimiter">
            <label className="field-label" htmlFor="delimiter-select">Delimiter</label>
            <select
              id="delimiter-select"
              className="select"
              value={presetId}
              onChange={(e) => {
                setPresetId(e.target.value);
                setActiveQuickPreset(null);
              }}
            >
              {DELIMITER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
              <option value="custom">Custom…</option>
            </select>
          </div>

          {presetId === "custom" && (
            <div className="settings-group settings-group--delimiter">
              <label className="field-label" htmlFor="custom-delimiter">Custom delimiter</label>
              <input
                id="custom-delimiter"
                type="text"
                className="text-input"
                placeholder="e.g. :: or #"
                value={customDelimiter}
                onChange={(e) => {
                  setCustomDelimiter(e.target.value);
                  setActiveQuickPreset(null);
                }}
              />
            </div>
          )}

          <div className="settings-group settings-group--advanced">
            <span className="field-label visually-hidden">More options</span>
            <button
              type="button"
              className="btn btn-secondary advanced-toggle"
              aria-expanded={showAdvanced}
              aria-controls="more-options-panel"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <span className="advanced-toggle__label">More options</span>
              <span className={"advanced-toggle__chevron" + (showAdvanced ? " is-open" : "")} aria-hidden="true">▾</span>
            </button>
          </div>
        </div>

        {showAdvanced && (
        <div id="more-options-panel" className="advanced-filter-panel">
        <div className="formatting-options">
          <span className="field-label">Formatting options</span>
          <div className="formatting-options__grid">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={options.trimSpaces}
                onChange={(e) => handleOptionChange("trimSpaces", e.target.checked)}
              />
              Trim spaces
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={options.removeEmptyLines}
                onChange={(e) => handleOptionChange("removeEmptyLines", e.target.checked)}
              />
              Remove empty lines
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={options.removeDuplicates}
                onChange={(e) => handleOptionChange("removeDuplicates", e.target.checked)}
              />
              Remove duplicate values
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={options.sortOrder === "asc"}
                onChange={() => handleOptionChange("sortOrder", options.sortOrder === "asc" ? "none" : "asc")}
              />
              Sort A–Z
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={options.sortOrder === "desc"}
                onChange={() => handleOptionChange("sortOrder", options.sortOrder === "desc" ? "none" : "desc")}
              />
              Sort Z–A
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={options.addQuotes}
                onChange={(e) => handleOptionChange("addQuotes", e.target.checked)}
              />
              Add quotes
            </label>
            {options.addQuotes && (
              <div className="quote-choice" role="radiogroup" aria-label="Quote style">
                <label className="checkbox-row">
                  <input
                    type="radio"
                    name="quote-char"
                    checked={options.quoteChar === "single"}
                    onChange={() => handleOptionChange("quoteChar", "single")}
                  />
                  Single quotes ( ' )
                </label>
                <label className="checkbox-row">
                  <input
                    type="radio"
                    name="quote-char"
                    checked={options.quoteChar === "double"}
                    onChange={() => handleOptionChange("quoteChar", "double")}
                  />
                  Double quotes ( " )
                </label>
              </div>
            )}
            <div className="text-field-group">
              <label className="field-label" htmlFor="remove-prefix-input">Remove prefix</label>
              <input
                id="remove-prefix-input"
                type="text"
                className="text-input"
                placeholder="e.g. item_"
                value={options.removePrefix}
                onChange={(e) => handleOptionChange("removePrefix", e.target.value)}
              />
            </div>
            <div className="text-field-group">
              <label className="field-label" htmlFor="remove-suffix-input">Remove suffix</label>
              <input
                id="remove-suffix-input"
                type="text"
                className="text-input"
                placeholder="e.g. .csv"
                value={options.removeSuffix}
                onChange={(e) => handleOptionChange("removeSuffix", e.target.value)}
              />
            </div>
            <div className="text-field-group">
              <label className="field-label" htmlFor="prefix-input">Add prefix</label>
              <input
                id="prefix-input"
                type="text"
                className="text-input"
                placeholder="e.g. item_"
                value={options.prefix}
                onChange={(e) => handleOptionChange("prefix", e.target.value)}
              />
            </div>
            <div className="text-field-group">
              <label className="field-label" htmlFor="suffix-input">Add suffix</label>
              <input
                id="suffix-input"
                type="text"
                className="text-input"
                placeholder="e.g. .csv"
                value={options.suffix}
                onChange={(e) => handleOptionChange("suffix", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="quick-presets">
          <span className="field-label">Quick presets</span>
          <div className="quick-presets__list">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={"chip" + (activeQuickPreset === p.id ? " is-active" : "")}
                onClick={() => runQuickPreset(p.id)}
                title={p.description}
                aria-pressed={activeQuickPreset === p.id}
              >
                {p.label}
              </button>
            ))}
            {activeQuickPreset && (
              <button type="button" className="chip chip--clear" onClick={() => setActiveQuickPreset(null)}>
                Clear preset ✕
              </button>
            )}
          </div>
        </div>
        </div>
        )}
      </div>

      <div className="converter__panels">
        <div className="panel card">
          <div className="panel__header">
            <h3 className="panel__title">Input</h3>
            <div className="panel__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleLoadSample}>
                Load sample
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handlePaste}>
                Paste
              </button>
              <label className="btn btn-secondary btn-sm file-upload-btn">
                Upload .txt/CSV
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.tsv,.log"
                  onChange={handleFileUpload}
                  className="visually-hidden"
                />
              </label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
          <LineNumberedTextarea
            placeholder="Paste or type your data here…"
            value={input}
            onChange={(e) => setInputGuarded(e.target.value)}
            ariaLabel="Input data"
          />
          <div className="panel__footer">
            <span>{input.length.toLocaleString()} characters</span>
            <span aria-hidden="true">·</span>
            <span>{countLines(debouncedInput).toLocaleString()} lines</span>
          </div>
        </div>

        <div className="panel card">
          <div className="panel__header">
            <h3 className="panel__title">Output</h3>
            <div className="panel__actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
                Copy
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDownload("txt")}>
                Download .txt
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDownload("csv")}>
                Download .csv
              </button>
            </div>
          </div>
          <textarea
            className="panel__textarea"
            placeholder="Your converted output will appear here automatically…"
            value={output}
            readOnly
            spellCheck="false"
            aria-label="Converted output"
          />
          <div className="panel__footer">
            <span>{output.length.toLocaleString()} characters</span>
            <span aria-hidden="true">·</span>
            <span>{count.toLocaleString()} values</span>
            {error && (
              <span className="panel__error" role="alert">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="converter__privacy-note">
        🔒 Your data is processed locally in your browser and is not uploaded to our servers for conversion.
      </p>
    </section>
  );
}
