import Seo from "../components/Seo.jsx";
import ToJsonConverter from "../components/ToJsonConverter.jsx";
import "./pages.css";

export default function TextToJson() {
  return (
    <>
      <Seo
        title="Text to JSON Converter – Free Online Text Converter"
        description="Free online text to JSON converter. Turn a plain list or key: value pairs into clean, structured JSON instantly, directly in your browser — no data ever leaves your device."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>Text to JSON Converter</h1>
          <p>Paste a plain list or key: value pairs to convert it into structured JSON — instantly, in your browser.</p>
        </div>
      </header>

      <section className="container section">
        <ToJsonConverter defaultFormat="text" />
      </section>
    </>
  );
}
