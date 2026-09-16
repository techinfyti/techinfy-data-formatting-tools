import Seo from "../components/Seo.jsx";
import ToJsonConverter from "../components/ToJsonConverter.jsx";
import "./pages.css";

export default function CsvToJson() {
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
        <ToJsonConverter defaultFormat="csv" />
      </section>
    </>
  );
}
