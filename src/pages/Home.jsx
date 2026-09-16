import { useEffect } from "react";
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

const FAQS = [
  {
    question: "What is a delimiter tool?",
    answer:
      "A delimiter tool converts a plain list of values (one per line) into delimited text — like a comma-separated list — or the other way around, using whatever separator your workflow needs: comma, pipe, tab, semicolon, space, or a custom character.",
  },
  {
    question: "How do I convert a list into comma-separated values?",
    answer:
      "Paste your list into the Input box with one value per line, make sure Comma is selected as the delimiter, and the comma-separated result appears instantly in the Output box — no button to click.",
  },
  {
    question: "Can I use a custom delimiter?",
    answer:
      "Yes. Choose \"Custom…\" from the Delimiter dropdown and type any character or sequence you want — a pipe, a colon, double dashes, anything.",
  },
  {
    question: "Is my data uploaded anywhere?",
    answer:
      "No. Every conversion runs locally in your browser using JavaScript already loaded on the page — nothing you type or paste is sent to a server. See our Privacy Policy for details.",
  },
  {
    question: "What delimiters does this tool support?",
    answer:
      "Comma, semicolon, pipe, tab, space, and newline are built in as presets, plus a custom delimiter field for anything else.",
  },
  {
    question: "Can I turn a list into a SQL IN clause or JSON array?",
    answer:
      "Yes — under Quick presets you'll find one-click options for a SQL IN clause, a SQL values list, a JSON array, a JavaScript array, CSV, and a quoted list.",
  },
];

export default function Home() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

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

      <section className="container section faq">
        <h2 className="section__heading">Frequently asked questions</h2>
        <div className="faq__list">
          {FAQS.map((f) => (
            <details key={f.question} className="faq__item">
              <summary className="faq__question">{f.question}</summary>
              <p className="faq__answer">{f.answer}</p>
            </details>
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
