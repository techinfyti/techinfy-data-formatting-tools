import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import Seo from "../components/Seo.jsx";
import "../components/Converter.css";
import "./pages.css";
import { CSV_MAX_INPUT_LENGTH, csvToJson } from "../utils/csvToJson.js";

const SAMPLE_INPUT = 'name,role,city\nAda Lovelace,Engineer,London\nGrace Hopper,Admiral,New York\n"Smith, John",Analyst,Boston';

const DELIMITER_OPTIONS = [
  { id: ",", label: "Comma ( , )" },
  { id: ";", label: "Semicolon ( ; )" },
  { id: "\t", label: "Tab" },
  { id: "|", label: "Pipe ( | )" },
];

const BINARY_FILE_PATTERN = /\.(xlsx|xls|docx|doc|pdf|pptx|ppt|zip|rar|7z|png|jpe?g|gif|bmp|exe|bin)$/i;
// eslint-disable-next-line no-control-regex -- intentional: detecting binary content
const BINARY_CONTENT_PATTERN = /[�\x00-\x08\x0E-\x1F]/g;

const DEBOUNCE_THRESHOLD = 50_000;
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

export default function CsvToJson() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [indent, setIndent] = useState(2);
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(false);
  const [toast, showToast] = useToast();
  const fileInputRef = useRef(null);

  const debouncedInput = useDebouncedValue(input, input.length > DEBOUNCE_THRESHOLD ? DEBOUNCE_DELAY : 0);

  const { output, error, rowCount } = useMemo(
    () => csvToJson({ input: debouncedInput, delimiter, hasHeader, inferTypes, indent }),
    [debouncedInput, delimiter, hasHeader, inferTypes, indent]
  );

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
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
    if (file.size > CSV_MAX_INPUT_LENGTH * 2) {
      showToast("That file is too large to load.");
      e.target.value = "";
      return;
    }
    if (BINARY_FILE_PATTERN.test(file.name)) {
      showToast("That's a binary file, not plain text. Please upload a .csv or .tsv file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const suspicious = (text.match(BINARY_CONTENT_PATTERN) || []).length;
      if (text.length > 0 && suspicious / text.length > 0.02) {
        showToast("That file doesn't look like plain text. Please upload a .csv or .tsv file.");
        return;
      }
      setInput(text);
      if (file.name.toLowerCase().endsWith(".tsv")) setDelimiter("\t");
    };
    reader.onerror = () => showToast("Couldn't read that file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <Seo
        title="CSV to JSON Converter – Free Online CSV Converter"
        description="Free online CSV to JSON converter. Turn any CSV or TSV file into clean, structured JSON instantly, directly in your browser — no data ever leaves your device."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>CSV to JSON Converter</h1>
          <p>Paste or upload a CSV file to convert it into structured JSON — instantly, in your browser.</p>
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
              <div className="settings-group settings-group--delimiter">
                <label className="field-label" htmlFor="delimiter-select">Delimiter</label>
                <select
                  id="delimiter-select"
                  className="select"
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                >
                  {DELIMITER_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>

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
            </div>

            <div className="formatting-options">
              <div className="formatting-options__grid">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                  />
                  First row is a header
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={inferTypes}
                    onChange={(e) => setInferTypes(e.target.checked)}
                  />
                  Convert numbers &amp; booleans automatically
                </label>
              </div>
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
                    Upload .csv/.tsv
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.tsv,.txt"
                      onChange={handleFileUpload}
                      className="visually-hidden"
                    />
                  </label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                className="panel__textarea"
                placeholder="Paste your CSV here…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck="false"
                aria-label="Input data"
              />
              <div className="panel__footer">
                <span>{input.length.toLocaleString()} characters</span>
                <span aria-hidden="true">·</span>
                <span>{countLines(input).toLocaleString()} lines</span>
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
                placeholder="Converted JSON will appear here automatically…"
                value={output}
                readOnly
                spellCheck="false"
                aria-label="Converted output"
              />
              <div className="panel__footer">
                <span>{output.length.toLocaleString()} characters</span>
                <span aria-hidden="true">·</span>
                <span>{rowCount.toLocaleString()} rows</span>
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
