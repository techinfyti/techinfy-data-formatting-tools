import Seo from "../components/Seo.jsx";
import ToolCard from "../components/ToolCard.jsx";
import AdSlot from "../components/AdSlot.jsx";
import { TOOLS } from "../data/tools.js";
import "./pages.css";

export default function Tools() {
  return (
    <>
      <Seo
        title="Data Conversion Tools"
        description="Browse TechInfy's growing collection of free, browser-based data tools: delimiter conversion, duplicate removal, sorting, JSON and SQL formatting, and more."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Tools</span>
          <h1>A growing toolbox for everyday data work</h1>
          <p>
            Every tool below runs entirely in your browser and opens the Delimiter Converter
            with the right option or preset ready to use.
          </p>
        </div>
      </header>

      <section className="container section">
        <div className="cards-grid">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="container">
        <AdSlot variant="inline" />
      </section>
    </>
  );
}
