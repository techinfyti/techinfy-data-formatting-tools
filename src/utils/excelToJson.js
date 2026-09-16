// Excel → JSON conversion. Parsing is delegated to SheetJS (xlsx), which the
// caller loads dynamically (see ToJsonConverter) so it only ships to the
// browser when a visitor actually picks Excel as the source format.

export const EXCEL_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB — spreadsheets carry more overhead than plain text

/**
 * SheetJS silently accepts arbitrary bytes as a degenerate CSV-like sheet
 * instead of throwing, so a corrupted or wrong-type upload would otherwise
 * produce garbled JSON with no error. Check the file's magic bytes first:
 * .xlsx/.xlsm are ZIP archives (PK..), legacy .xls is an OLE compound file.
 */
export function isLikelySpreadsheet(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)) return true;
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) return true;
  return false;
}

/**
 * Convert one sheet of a parsed SheetJS workbook into JSON.
 * xlsxLib: the dynamically-imported xlsx module (for its .utils helpers).
 * workbook: the result of xlsxLib.read(...).
 */
export function excelToJson({ xlsxLib, workbook, sheetName, hasHeader = true, indent = 2 }) {
  if (!xlsxLib || !workbook || !sheetName) {
    return { output: "", error: null, rowCount: 0 };
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { output: "", error: "Could not find that sheet in this file.", rowCount: 0 };
  }

  try {
    const rows = xlsxLib.utils.sheet_to_json(sheet, hasHeader ? { defval: null } : { header: 1, defval: null });
    const indentArg = indent === "tab" ? "\t" : Number(indent);
    return { output: JSON.stringify(rows, null, indentArg), error: null, rowCount: rows.length };
  } catch {
    return { output: "", error: "Could not read this spreadsheet. Please check the file and try again.", rowCount: 0 };
  }
}
