import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import Converter from "../components/Converter.jsx";
import AdSlot from "../components/AdSlot.jsx";
import "./Home.css";

const HIGHLIGHTS = [
  {
    icon: "⚡",
    title: "Instant conversion",
    text: "Every option updates your output in real time — no submit button, no waiting.",
  },
  {
    icon: "🔒",
    title: "Private by design",
    text: "Conversion happens locally in your browser. Your lists are never uploaded to a server.",
  },
  {
    icon: "🧩",
    title: "Built-in presets",
    text: "Jump straight to SQL clauses, JSON arrays, CSV rows and quoted lists.",
  },
];

export default function Home() {
  return (
    <>
      <Seo
        title="Delimiter Tool – Free Online Delimiter Converter"
        description="Free online delimiter tool to convert and clean lists, CSV, SQL and JSON data. Switch between comma, pipe, tab and custom delimiters instantly, right in your browser."
      />

      <section className="container home-title">
        <h1>Free Online Delimiter Tool for Data Formatting</h1>
      </section>

      <section id="converter" className="container section section--top">
        <h2 className="section__heading">Delimiter Converter</h2>
        <p className="section__subheading">
          Turn a column of values into delimited text using any preset or custom delimiter.
        </p>
        <Converter />
      </section>

      <section className="container section highlights">
        <h2 className="section__heading">Why TechInfy Data Tools</h2>
        <div className="highlights__grid">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="highlight-card card">
              <div className="highlight-card__icon" aria-hidden="true">{h.icon}</div>
              <h3 className="highlight-card__title">{h.title}</h3>
              <p className="highlight-card__text">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <AdSlot variant="inline" />
      </section>

      <section className="container section cta">
        <div className="cta__box card">
          <h2 className="section__heading">Need a different data tool?</h2>
          <p className="section__subheading cta__subheading">
            Browse the full TechInfy Data Tools collection — more converters and formatters are on the way.
          </p>
          <Link to="/tools" className="btn btn-primary">View all tools</Link>
        </div>
      </section>
    </>
  );
}
