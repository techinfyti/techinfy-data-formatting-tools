import Seo from "../components/Seo.jsx";
import ToJsonConverter from "../components/ToJsonConverter.jsx";
import "./pages.css";

export default function XmlToJson() {
  return (
    <>
      <Seo
        title="XML to JSON Converter – Free Online XML Converter"
        description="Free online XML to JSON converter. Turn any XML document into clean, structured JSON instantly, directly in your browser — no data ever leaves your device."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>XML to JSON Converter</h1>
          <p>Paste or upload an XML document to convert it into structured JSON — instantly, in your browser.</p>
        </div>
      </header>

      <section className="container section">
        <ToJsonConverter defaultFormat="xml" />
      </section>
    </>
  );
}
