import { useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import Converter from "../components/Converter.jsx";
import "./pages.css";
import "./Guide.css";

const SAMPLE = "10234\n10235\n10235\n10236\n10237";

const FAQS = [
  {
    question: "How do I convert an Excel column to a comma separated list?",
    answer:
      "Copy the cells in Excel, paste them into the Input box on this page, and the comma separated list appears in the Output box straight away. Click Copy to use it anywhere.",
  },
  {
    question: "Can I add quotes around each value?",
    answer:
      "Yes. Open More Filters, tick Add quotes and choose single or double quotes. Single quotes are handy for SQL; double quotes suit code and CSV-style data.",
  },
  {
    question: "Can I put a space after each comma?",
    answer:
      "Yes. Choose Custom… in the Delimiter list and type a comma followed by a space.",
  },
  {
    question: "Does it remove blank cells and duplicates?",
    answer:
      "Blank cells and extra spaces around values are removed by default. To drop repeated values as well, tick Remove duplicate values under More Filters.",
  },
  {
    question: "Is my Excel data uploaded anywhere?",
    answer:
      "No. The conversion runs entirely in your browser, so nothing you paste is sent to a server. See our Privacy Policy for details.",
  },
  {
    question: "How much data can I paste?",
    answer:
      "Up to 75,000 characters at a time, which covers most everyday columns. For a bigger list, convert it in a few parts.",
  },
];

export default function ExcelColumnToCommaList() {
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
        title="Excel Column to Comma Separated List Converter"
        description="Convert an Excel column to a comma separated list in seconds. Paste your cells, add quotes or remove duplicates, and copy. Free, runs in your browser."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Guide</span>
          <h1>Convert Excel Column to Comma Separated List</h1>
          <p>Paste a column from Excel and get a comma separated list instantly. Free, and it runs in your browser.</p>
        </div>
      </header>

      <section className="container section guide-tool">
        <Converter
          placeholder="Paste your Excel column here…"
          sampleInput={SAMPLE}
        />
      </section>

      <section className="container section prose guide">
        <h2>How to convert an Excel column to a comma separated list</h2>
        <ol className="guide-steps">
          <li>
            <strong>Select the column.</strong> In Excel, click the first cell, hold Shift and click
            the last one, or click the column letter to select the whole column.
          </li>
          <li>
            <strong>Copy it.</strong> Press Ctrl+C (Cmd+C on a Mac).
          </li>
          <li>
            <strong>Paste it above.</strong> Click the Input box and press Ctrl+V (Cmd+V), or use the
            Paste button.
          </li>
          <li>
            <strong>Copy the result.</strong> Your comma separated list appears in the Output box
            immediately. Click Copy and paste it where you need it.
          </li>
        </ol>
        <p>
          Blank cells and stray spaces are cleaned up automatically, so a column with gaps still
          gives you a tidy list.
        </p>

        <h2>Example</h2>
        <p>A column with a repeated value, copied from Excel:</p>
        <div className="guide-example">
          <div>
            <span className="guide-example__label">Pasted column</span>
            <pre className="guide-code">{"10234\n10235\n10235\n10236"}</pre>
          </div>
          <div>
            <span className="guide-example__label">Comma separated list</span>
            <pre className="guide-code">{"10234,10235,10235,10236"}</pre>
          </div>
          <div>
            <span className="guide-example__label">With duplicates removed and single quotes added</span>
            <pre className="guide-code">{"'10234','10235','10236'"}</pre>
          </div>
        </div>

        <h2>Options worth knowing</h2>
        <p>Open <strong>More Filters</strong> above the Input box to:</p>
        <ul>
          <li><strong>Remove duplicate values</strong> so each item appears once.</li>
          <li><strong>Add quotes</strong> (single or double) around every value, handy for text in SQL or code.</li>
          <li><strong>Sort A–Z or Z–A</strong> before joining.</li>
          <li><strong>Add a prefix or suffix</strong> to every value, or <strong>remove text</strong> from each one.</li>
        </ul>
        <p>
          Need a space after each comma? Choose <strong>Custom…</strong> in the Delimiter list and
          type a comma followed by a space.
        </p>

        <h2>Using an Excel formula instead</h2>
        <p>
          In Excel 2019 and Microsoft 365 you can also type <code>=TEXTJOIN(",",TRUE,A1:A10)</code>,
          which joins the cells A1 to A10 with commas and skips blanks. Older versions of Excel don't
          have TEXTJOIN, and a formula can't add quotes or remove duplicates for you, which is where
          pasting into this page is quicker. It works the same way for a column copied from Google
          Sheets or any other spreadsheet.
        </p>

        <h2>Frequently asked questions</h2>
        <div className="guide-faq">
          {FAQS.map((f) => (
            <details key={f.question} className="guide-faq__item">
              <summary className="guide-faq__question">{f.question}</summary>
              <p className="guide-faq__answer">{f.answer}</p>
            </details>
          ))}
        </div>

        <h2>Related tools</h2>
        <ul>
          <li><Link to="/excel-to-json">Excel to JSON Converter</Link>: turn a whole spreadsheet into JSON.</li>
          <li><Link to="/#converter">Delimiter Converter</Link>: pipe, tab, semicolon or a custom delimiter, plus a SQL IN clause preset.</li>
          <li><Link to="/tools">All tools</Link></li>
        </ul>
      </section>
    </>
  );
}
