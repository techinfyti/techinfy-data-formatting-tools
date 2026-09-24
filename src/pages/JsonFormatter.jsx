import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import Seo from "../components/Seo.jsx";
import "../components/Converter.css";
import "./pages.css";
import { JSON_MAX_INPUT_LENGTH, processJson } from "../utils/jsonFormatter.js";
import LineNumberedTextarea from "../components/LineNumberedTextarea.jsx";

const SAMPLE_INPUT = JSON.stringify(
  { name: "Techinfy", tools: ["Delimiter Converter", "JSON Formatter"], free: true, rating: null },
  null,
  0
);

const BINARY_FILE_PATTERN = /\.(xlsx|xls|docx|doc|pdf|pptx|ppt|zip|rar|7z|png|jpe?g|gif|bmp|exe|bin)$/i;
// eslint-disable-next-line no-control-regex -- intentional: detecting binary content
const BINARY_CONTENT_PATTERN = /[�\x00-\x08\x0E-\x1F]/g;

// Cost scales with line count more than character count, so this is set
// low enough to catch large inputs even when lines are short.
const DEBOUNCE_THRESHOLD = 5_000;
const DEBOUNCE_DELAY = 200;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return delay <= 0 ? value : debounced;
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

function countLines(text) {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).filter((l) => l !== "").length;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("format");
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [toast, showToast] = useToast();
  const fileInputRef = useRef(null);

  const debouncedInput = useDebouncedValue(input, input.length > DEBOUNCE_THRESHOLD ? DEBOUNCE_DELAY : 0);

  const { output, error } = useMemo(
    () => processJson({ input: debouncedInput, mode, indent, sortKeys }),
    [debouncedInput, mode, indent, sortKeys]
  );

  // Rejecting an oversized paste/type here (rather than only flagging it
  // after the fact) keeps it out of React state entirely — a controlled
  // textarea reflows on every value change, and that cost is what caused a
  // real browser freeze on a very large paste. See JSON_MAX_INPUT_LENGTH.
  const setInputGuarded = (text) => {
    if (text.length > JSON_MAX_INPUT_LENGTH) {
      showToast(`That's too much text to paste at once (over ${JSON_MAX_INPUT_LENGTH.toLocaleString()} characters). Please use a smaller amount.`);
      return;
    }
    setInput(text);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputGuarded(text);
    } catch {
      showToast("Clipboard access was blocked. Paste manually with Ctrl/Cmd+V.");
    }
  };

  const handleClear = () => setInput("");
  const handleLoadSample = () => setInput(SAMPLE_INPUT);

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

  const handleDownload = () => {
    if (!output) {
      showToast("Nothing to download yet.");
      return;
    }
    try {
      const blob = new Blob([output], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "techinfy-data.json";
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
    if (file.size > JSON_MAX_INPUT_LENGTH * 2) {
      showToast("That file is too large to load.");
      e.target.value = "";
      return;
    }
    if (BINARY_FILE_PATTERN.test(file.name)) {
      showToast("That's a binary file, not plain text. Please upload a .json or .txt file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const suspicious = (text.match(BINARY_CONTENT_PATTERN) || []).length;
      if (text.length > 0 && suspicious / text.length > 0.02) {
        showToast("That file doesn't look like plain text. Please upload a .json or .txt file.");
        return;
      }
      setInput(text);
    };
    reader.onerror = () => showToast("Couldn't read that file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <Seo
        title="JSON Formatter – Validate, Pretty-Print & Minify JSON"
        description="Free online JSON formatter. Validate, pretty-print, minify and sort keys in any JSON document, directly in your browser — no data ever leaves your device."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>JSON Formatter</h1>
          <p>Paste any JSON to validate it, pretty-print it, minify it, or sort its keys — instantly, in your browser.</p>
        </div>
      </header>

      <section className="container section">
        <div className="converter">
          {toast && (
            <div className="toast" role="status" aria-live="polite">
              {toast}
            </div>
          )}

          <div className="converter__settings card">
            <div className="settings-row">
              <div className="settings-group">
                <span className="field-label">Mode</span>
                <div className="segmented" role="radiogroup" aria-label="Formatting mode">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={mode === "format"}
                    className={"segmented__btn" + (mode === "format" ? " is-active" : "")}
                    onClick={() => setMode("format")}
                  >
                    Pretty-print
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={mode === "minify"}
                    className={"segmented__btn" + (mode === "minify" ? " is-active" : "")}
                    onClick={() => setMode("minify")}
                  >
                    Minify
                  </button>
                </div>
              </div>

              {mode === "format" && (
                <div className="settings-group">
                  <label className="field-label" htmlFor="indent-select">Indent</label>
                  <select
                    id="indent-select"
                    className="select"
                    value={indent}
                    onChange={(e) => setIndent(e.target.value === "tab" ? "tab" : Number(e.target.value))}
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value="tab">Tab</option>
                  </select>
                </div>
              )}
            </div>

            <div className="formatting-options">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                />
                Sort keys alphabetically
              </label>
            </div>
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
                    Upload .json
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.txt"
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
                placeholder="Paste your JSON here…"
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
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownload}>
                    Download .json
                  </button>
                </div>
              </div>
              {error && (
                <div className="error-banner" role="alert">
                  <span aria-hidden="true">⚠️</span> {error}
                </div>
              )}
              <textarea
                className="panel__textarea"
                placeholder="Formatted JSON will appear here automatically…"
                value={output}
                readOnly
                spellCheck="false"
                aria-label="Converted output"
              />
              <div className="panel__footer">
                <span>{output.length.toLocaleString()} characters</span>
              </div>
            </div>
          </div>

          <p className="converter__privacy-note">
            🔒 Your data is processed locally in your browser and is not uploaded to our servers for conversion.
          </p>
        </div>
      </section>
    </>
  );
}
