import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import Converter from "../components/Converter.jsx";
import { GUIDES } from "../data/guides.js";
import { GUIDE_CONTENT } from "../data/guideContent.jsx";
import { DEFAULT_OPTIONS, PRESETS, convert, resolveDelimiter } from "../utils/converter.js";
import "./pages.css";
import "./Guide.css";

// Runs the real converter so an example can never disagree with the tool.
function runExample(input, settings) {
  if (settings.quickPreset) {
    return PRESETS.find((p) => p.id === settings.quickPreset).run(input);
  }
  return convert({
    input,
    mode: settings.mode ?? "listToDelimited",
    delimiter: resolveDelimiter({ presetId: settings.presetId ?? "comma", customValue: "" }),
    options: { ...DEFAULT_OPTIONS, ...settings.options },
  }).output;
}

function Block({ block }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "p":
      return <p>{block.content}</p>;
    case "ul":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="guide-steps">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "code":
      return <pre className="guide-code">{block.text}</pre>;
    case "example":
      return (
        <>
          {block.intro && <p>{block.intro}</p>}
          <div className="guide-example">
            <div>
              <span className="guide-example__label">{block.inputLabel ?? "Input"}</span>
              <pre className="guide-code">{block.input}</pre>
            </div>
            {block.results.map((r) => (
              <div key={r.label}>
                <span className="guide-example__label">{r.label}</span>
                <pre className="guide-code">{runExample(block.input, r)}</pre>
              </div>
            ))}
          </div>
        </>
      );
    default:
      return null;
  }
}

export default function GuidePage({ slug }) {
  const guide = GUIDES.find((g) => g.slug === slug);
  const content = GUIDE_CONTENT[slug];

  useEffect(() => {
    if (!content) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [content]);

  if (!guide || !content) return <Navigate to="/tools" replace />;

  return (
    <>
      <Seo title={guide.seoTitle} description={guide.seoDescription} />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Guide</span>
          <h1>{guide.h1}</h1>
          <p>{guide.hero}</p>
        </div>
      </header>

      <section className="container section guide-tool">
        <Converter
          placeholder={content.converter.placeholder}
          sampleInput={content.converter.sampleInput}
          defaults={content.converter.defaults}
        />
      </section>

      <section className="container section prose guide">
        {content.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        <h2>Frequently asked questions</h2>
        <div className="guide-faq">
          {content.faqs.map((f) => (
            <details key={f.question} className="guide-faq__item">
              <summary className="guide-faq__question">{f.question}</summary>
              <p className="guide-faq__answer">{f.answer}</p>
            </details>
          ))}
        </div>

        <h2>Related tools</h2>
        <ul>
          {content.related.map((r) => {
            const rel =
              typeof r === "string"
                ? (() => {
                    const g = GUIDES.find((x) => x.slug === r);
                    return { to: `/${g.slug}`, label: g.cardName, blurb: g.blurb };
                  })()
                : r;
            return (
              <li key={rel.to}>
                <Link to={rel.to}>{rel.label}</Link>
                {rel.blurb ? `: ${rel.blurb.charAt(0).toLowerCase()}${rel.blurb.slice(1)}` : null}
              </li>
            );
          })}
          <li><Link to="/#converter">Delimiter Converter</Link>: pipe, tab, semicolon or a custom delimiter.</li>
          <li><Link to="/tools">All tools</Link></li>
        </ul>
      </section>
    </>
  );
}
