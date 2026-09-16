import Seo from "../components/Seo.jsx";
import ToJsonConverter from "../components/ToJsonConverter.jsx";
import "./pages.css";

export default function TsvToJson() {
  return (
    <>
      <Seo
        title="TSV to JSON Converter – Free Online TSV Converter"
        description="Free online TSV to JSON converter. Turn any tab-separated (TSV) file into clean, structured JSON instantly, directly in your browser — no data ever leaves your device."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>TSV to JSON Converter</h1>
          <p>Paste or upload a tab-separated file to convert it into structured JSON — instantly, in your browser.</p>
        </div>
      </header>

      <section className="container section">
        <ToJsonConverter defaultFormat="tsv" />
      </section>
    </>
  );
}
