import Seo from "../components/Seo.jsx";
import ToJsonConverter from "../components/ToJsonConverter.jsx";
import "./pages.css";

export default function YamlToJson() {
  return (
    <>
      <Seo
        title="YAML to JSON Converter – Free Online YAML Converter"
        description="Free online YAML to JSON converter. Turn any YAML file — config, Kubernetes manifest, Docker Compose — into clean, structured JSON instantly, directly in your browser."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>YAML to JSON Converter</h1>
          <p>Paste or upload a YAML file to convert it into structured JSON — instantly, in your browser.</p>
        </div>
      </header>

      <section className="container section">
        <ToJsonConverter defaultFormat="yaml" />
      </section>
    </>
  );
}
