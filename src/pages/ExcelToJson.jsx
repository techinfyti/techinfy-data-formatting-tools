import Seo from "../components/Seo.jsx";
import ToJsonConverter from "../components/ToJsonConverter.jsx";
import "./pages.css";

export default function ExcelToJson() {
  return (
    <>
      <Seo
        title="Excel to JSON Converter – Free Online XLSX Converter"
        description="Free online Excel to JSON converter. Turn any .xlsx or .xls spreadsheet into clean, structured JSON instantly, directly in your browser — no data ever leaves your device."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>Excel to JSON Converter</h1>
          <p>Upload an .xlsx or .xls file to convert it into structured JSON — instantly, in your browser.</p>
        </div>
      </header>

      <section className="container section">
        <ToJsonConverter defaultFormat="excel" />
      </section>
    </>
  );
}
