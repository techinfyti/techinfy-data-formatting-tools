import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import "./Converter.css";
import { CSV_MAX_INPUT_LENGTH, csvToJson } from "../utils/csvToJson.js";
import { xmlToJson } from "../utils/xmlToJson.js";
import { yamlToJson } from "../utils/yamlToJson.js";
import { EXCEL_MAX_FILE_SIZE, excelToJson, isLikelySpreadsheet } from "../utils/excelToJson.js";
import { textToJson } from "../utils/textToJson.js";
import LineNumberedTextarea from "./LineNumberedTextarea.jsx";

const TEXT_SAMPLES = {
  lines: "Apple\nOrange\nBanana\nMango\nGrape",
  keyValue: "name: Ada Lovelace\nrole: Engineer\ncity: London",
};

const TEXT_MODES = [
  { id: "lines", label: "List (one item per line)" },
  { id: "keyValue", label: 'Key: value pairs (object)' },
];

const EXCEL_SAMPLE_ROWS = [
  ["name", "role", "city"],
  ["Ada Lovelace", "Engineer", "London"],
  ["Grace Hopper", "Admiral", "New York"],
];

// Registry of supported "From format" options. Each entry is self-contained
// (sample data, default delimiter, upload hints) so adding a new format later
// is a matter of adding one entry here plus a branch in convertInput below.
export const TO_JSON_FORMATS = [
  {
    id: "csv",
    label: "CSV",
    sample: 'name,role,city\nAda Lovelace,Engineer,London\nGrace Hopper,Admiral,New York\n"Smith, John",Analyst,Boston',
    delimiter: ",",
    delimiterSelectable: true,
    uploadAccept: ".csv,.tsv,.txt",
    uploadLabel: "Upload .csv/.tsv",
    placeholder: "Paste your CSV here…",
  },
  {
    id: "tsv",
    label: "TSV (Tab-separated)",
    sample: "name\trole\tcity\nAda Lovelace\tEngineer\tLondon\nGrace Hopper\tAdmiral\tNew York",
    delimiter: "\t",
    delimiterSelectable: false,
    uploadAccept: ".tsv,.csv,.txt",
    uploadLabel: "Upload .tsv/.csv",
    placeholder: "Paste your TSV here…",
  },
  {
    id: "xml",
    label: "XML",
    sample: '<?xml version="1.0"?>\n<person id="1">\n  <name>Ada Lovelace</name>\n  <role>Engineer</role>\n  <skills>\n    <skill>Mathematics</skill>\n    <skill>Programming</skill>\n  </skills>\n</person>',
    delimiter: null,
    delimiterSelectable: false,
    hasHeaderApplicable: false,
    showRowCount: false,
    uploadAccept: ".xml,.txt",
    uploadLabel: "Upload .xml",
    placeholder: "Paste your XML here…",
  },
  {
    id: "yaml",
    label: "YAML",
    sample: 'name: Ada Lovelace\nrole: Engineer\nactive: true\nskills:\n  - Mathematics\n  - Programming\naddress:\n  city: London\n  zip: "SW1A"',
    delimiter: null,
    delimiterSelectable: false,
    hasHeaderApplicable: false,
    showRowCount: false,
    typeInferenceApplicable: false,
    uploadAccept: ".yaml,.yml,.txt",
    uploadLabel: "Upload .yaml/.yml",
    placeholder: "Paste your YAML here…",
  },
  {
    id: "excel",
    label: "Excel",
    delimiter: null,
    delimiterSelectable: false,
    typeInferenceApplicable: false,
    isBinaryUpload: true,
    uploadAccept: ".xlsx,.xls,.xlsm",
    uploadLabel: "Upload .xlsx/.xls",
  },
  {
    id: "text",
    label: "Plain Text",
    delimiter: null,
    delimiterSelectable: false,
    hasHeaderApplicable: false,
    hasModeSelect: true,
    rowCountLabel: "items",
    uploadAccept: ".txt",
    uploadLabel: "Upload .txt",
    placeholder: "Paste your text here, one item per line…",
  },
];

const DELIMITER_OPTIONS = [
  { id: ",", label: "Comma ( , )" },
  { id: ";", label: "Semicolon ( ; )" },
  { id: "\t", label: "Tab" },
  { id: "|", label: "Pipe ( | )" },
];

const BINARY_FILE_PATTERN = /\.(xlsx|xls|docx|doc|pdf|pptx|ppt|zip|rar|7z|png|jpe?g|gif|bmp|exe|bin)$/i;
// eslint-disable-next-line no-control-regex -- intentional: detecting binary content
const BINARY_CONTENT_PATTERN = /[�\x00-\x08\x0E-\x1F]/g;

// Cost scales with line count more than character count, so this is set
// low enough to catch large inputs even when lines are short.
const DEBOUNCE_THRESHOLD = 5_000;
const DEBOUNCE_DELAY = 200;

// Each large update reflows the (controlled) textarea, and that cost is
// real even when a single update stays under the max length. Rapid
// back-to-back updates (e.g. pasting several times in quick succession)
// each trigger their own reflow with no gap to breathe — individually fine,
// but the cumulative main-thread time is exactly what caused a real
// multi-second "Page Unresponsive" freeze well under the size limit, and
// on real (slower) hardware a queued/deferred trailing update still let
// that backlog build up. Rejecting a large update outright when one was
// just accepted, rather than queuing it for later, guarantees the rate of
// expensive reflows stays capped no matter how fast pastes arrive.
const COOLDOWN_MS = 1_000;

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

/** Dispatches to the right parser for the active "From format". */
function convertInput({
  formatId,
  input,
  delimiter,
  hasHeader,
  inferTypes,
  indent,
  yamlLib,
  yamlLibFailed,
  excelLib,
  excelLibFailed,
  workbook,
  selectedSheet,
  textMode,
}) {
  switch (formatId) {
    case "csv":
    case "tsv":
      return csvToJson({ input, delimiter, hasHeader, inferTypes, indent });
    case "xml":
      return xmlToJson({ input, inferTypes, indent });
    case "yaml":
      if (yamlLibFailed) {
        return { output: "", error: "Couldn't load YAML support. Check your connection and reload the page." };
      }
      return yamlToJson({ input, yamlLib, indent });
    case "excel":
      if (excelLibFailed) {
        return { output: "", error: "Couldn't load Excel support. Check your connection and reload the page.", rowCount: 0 };
      }
      return excelToJson({ xlsxLib: excelLib, workbook, sheetName: selectedSheet, hasHeader, indent });
    case "text":
      return textToJson({ input, mode: textMode, inferTypes, indent });
    default:
      return { output: "", error: "Unsupported format." };
  }
}

export default function ToJsonConverter({ defaultFormat = "csv" }) {
  const [formatId, setFormatId] = useState(defaultFormat);
  const format = useMemo(() => TO_JSON_FORMATS.find((f) => f.id === formatId) ?? TO_JSON_FORMATS[0], [formatId]);

  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(format.delimiter);
  const [indent, setIndent] = useState(2);
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(false);
  const [toast, showToast] = useToast();
  const [yamlLib, setYamlLib] = useState(null);
  const [yamlLibFailed, setYamlLibFailed] = useState(false);
  const [excelLib, setExcelLib] = useState(null);
  const [excelLibFailed, setExcelLibFailed] = useState(false);
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [excelFileName, setExcelFileName] = useState("");
  const [textMode, setTextMode] = useState("lines");
  const fileInputRef = useRef(null);
  const lastAppliedRef = useRef(0);

  const handleFormatChange = (nextId) => {
    const next = TO_JSON_FORMATS.find((f) => f.id === nextId);
    if (!next) return;
    setFormatId(nextId);
    setDelimiter(next.delimiter);
    if (nextId === "yaml") setYamlLibFailed(false);
    if (nextId === "excel") setExcelLibFailed(false);
  };

  // YAML support (js-yaml) is only fetched once a visitor actually picks YAML,
  // so CSV/TSV/XML visitors never download it.
  useEffect(() => {
    if (formatId !== "yaml" || yamlLib) return;
    let cancelled = false;
    import("js-yaml")
      .then((mod) => {
        if (!cancelled) setYamlLib(mod);
      })
      .catch(() => {
        if (!cancelled) setYamlLibFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [formatId, yamlLib]);

  // Excel support (SheetJS) is only fetched once a visitor actually picks Excel.
  useEffect(() => {
    if (formatId !== "excel" || excelLib) return;
    let cancelled = false;
    import("xlsx")
      .then((mod) => {
        if (!cancelled) setExcelLib(mod);
      })
      .catch(() => {
        if (!cancelled) setExcelLibFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [formatId, excelLib]);

  const debouncedInput = useDebouncedValue(input, input.length > DEBOUNCE_THRESHOLD ? DEBOUNCE_DELAY : 0);

  const isLoadingFormatLib =
    (formatId === "yaml" && !yamlLib && !yamlLibFailed) || (formatId === "excel" && !excelLib && !excelLibFailed);

  const { output, error, rowCount } = useMemo(
    () =>
      convertInput({
        formatId,
        input: debouncedInput,
        delimiter,
        hasHeader,
        inferTypes,
        indent,
        yamlLib,
        yamlLibFailed,
        excelLib,
        excelLibFailed,
        workbook,
        selectedSheet,
        textMode,
      }),
    [
      formatId,
      debouncedInput,
      delimiter,
      hasHeader,
      inferTypes,
      indent,
      yamlLib,
      yamlLibFailed,
      excelLib,
      excelLibFailed,
      workbook,
      selectedSheet,
      textMode,
    ]
  );

  // Rejecting an oversized paste/type here (rather than only flagging it
  // after the fact) keeps it out of React state entirely — a controlled
  // textarea reflows on every value change, and that cost is what caused a
  // real browser freeze on a very large paste. All the per-format limits
  // are the same value, so any of them works as this general guard.
  const setInputGuarded = (text) => {
    if (text.length > CSV_MAX_INPUT_LENGTH) {
      showToast(`That's too much text to paste at once (over ${CSV_MAX_INPUT_LENGTH.toLocaleString()} characters). Please use a smaller amount.`);
      return;
    }

    // Small edits stay instant — the cooldown only kicks in once a single
    // update is already big enough for its own reflow to be noticeable.
    if (text.length <= DEBOUNCE_THRESHOLD) {
      setInput(text);
      return;
    }

    const now = Date.now();
    if (now - lastAppliedRef.current < COOLDOWN_MS) {
      showToast("You're adding data too quickly — please wait a moment before pasting more.");
      return;
    }
    lastAppliedRef.current = now;
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

  const handleClear = () => {
    setInput("");
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheet("");
    setExcelFileName("");
  };

  const handleLoadSample = () => {
    if (format.isBinaryUpload) {
      if (!excelLib) return;
      const ws = excelLib.utils.aoa_to_sheet(EXCEL_SAMPLE_ROWS);
      const wb = excelLib.utils.book_new();
      excelLib.utils.book_append_sheet(wb, ws, "Sheet1");
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0]);
      setExcelFileName("sample.xlsx");
      return;
    }
    if (format.hasModeSelect) {
      setInput(TEXT_SAMPLES[textMode] ?? TEXT_SAMPLES.lines);
      return;
    }
    setInput(format.sample);
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
      showToast("That's a binary file, not plain text. Please upload a text file in a supported format.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const suspicious = (text.match(BINARY_CONTENT_PATTERN) || []).length;
      if (text.length > 0 && suspicious / text.length > 0.02) {
        showToast("That file doesn't look like plain text. Please upload a text file in a supported format.");
        return;
      }
      setInput(text);
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".tsv")) handleFormatChange("tsv");
      else if (lowerName.endsWith(".csv")) handleFormatChange("csv");
      else if (lowerName.endsWith(".xml")) handleFormatChange("xml");
      else if (lowerName.endsWith(".yaml") || lowerName.endsWith(".yml")) handleFormatChange("yaml");
    };
    reader.onerror = () => showToast("Couldn't read that file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExcelFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > EXCEL_MAX_FILE_SIZE) {
      showToast("That file is too large to load.");
      e.target.value = "";
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      if (!isLikelySpreadsheet(buffer)) {
        showToast("That doesn't look like a valid Excel file. Please upload a .xlsx or .xls file.");
        return;
      }
      let lib = excelLib;
      if (!lib) {
        lib = await import("xlsx");
        setExcelLib(lib);
      }
      const wb = lib.read(buffer, { type: "array" });
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        showToast("That file doesn't have any sheets to read.");
        return;
      }
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0]);
      setExcelFileName(file.name);
    } catch {
      showToast("Couldn't read that file. Please upload a valid .xlsx or .xls file.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="converter">
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className="converter__settings card">
        <div className="settings-row">
          <div className="settings-group">
            <label className="field-label" htmlFor="format-select">From format</label>
            <select
              id="format-select"
              className="select"
              value={formatId}
              onChange={(e) => handleFormatChange(e.target.value)}
            >
              {TO_JSON_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          {format.delimiterSelectable && (
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
          )}

          {format.hasModeSelect && (
            <div className="settings-group settings-group--delimiter">
              <label className="field-label" htmlFor="text-mode-select">Shape</label>
              <select
                id="text-mode-select"
                className="select"
                value={textMode}
                onChange={(e) => setTextMode(e.target.value)}
              >
                {TEXT_MODES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

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
            {format.hasHeaderApplicable !== false && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                />
                First row is a header
              </label>
            )}
            {format.typeInferenceApplicable !== false && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={inferTypes}
                  onChange={(e) => setInferTypes(e.target.checked)}
                />
                Convert numbers &amp; booleans automatically
              </label>
            )}
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
              {!format.isBinaryUpload && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={handlePaste}>
                  Paste
                </button>
              )}
              <label className="btn btn-secondary btn-sm file-upload-btn">
                {format.uploadLabel}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={format.uploadAccept}
                  onChange={format.isBinaryUpload ? handleExcelFileUpload : handleFileUpload}
                  className="visually-hidden"
                />
              </label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
          {format.isBinaryUpload ? (
            <div className="panel__status">
              {workbook ? (
                <>
                  <p className="panel__status-filename">📄 {excelFileName}</p>
                  {sheetNames.length > 1 && (
                    <div className="settings-group">
                      <label className="field-label" htmlFor="sheet-select">Sheet</label>
                      <select
                        id="sheet-select"
                        className="select"
                        value={selectedSheet}
                        onChange={(e) => setSelectedSheet(e.target.value)}
                      >
                        {sheetNames.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <p className="panel__status-placeholder">
                  {isLoadingFormatLib ? "Loading Excel support…" : 'Upload an .xlsx or .xls file, or click "Load sample" above.'}
                </p>
              )}
            </div>
          ) : (
            <LineNumberedTextarea
              placeholder={format.placeholder}
              value={input}
              onChange={(e) => setInputGuarded(e.target.value)}
              ariaLabel="Input data"
              maxLength={CSV_MAX_INPUT_LENGTH}
              onExceedsMaxLength={() => showToast(`That's too much text to paste at once (over ${CSV_MAX_INPUT_LENGTH.toLocaleString()} characters). Please use a smaller amount.`)}
            />
          )}
          <div className="panel__footer">
            {format.isBinaryUpload ? (
              workbook && <span>{sheetNames.length.toLocaleString()} sheet{sheetNames.length !== 1 ? "s" : ""} found</span>
            ) : (
              <>
                <span>{input.length.toLocaleString()} characters</span>
                <span aria-hidden="true">·</span>
                <span>{countLines(debouncedInput).toLocaleString()} lines</span>
              </>
            )}
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
            placeholder={
              isLoadingFormatLib
                ? `Loading ${format.label} support…`
                : "Converted JSON will appear here automatically…"
            }
            value={output}
            readOnly
            spellCheck="false"
            aria-label="Converted output"
          />
          <div className="panel__footer">
            <span>{output.length.toLocaleString()} characters</span>
            {format.showRowCount !== false && rowCount != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{rowCount.toLocaleString()} {format.rowCountLabel ?? "rows"}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="converter__privacy-note">
        🔒 Your data is processed locally in your browser and is not uploaded to our servers for conversion.
      </p>
    </div>
  );
}
