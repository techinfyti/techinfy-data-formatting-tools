import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import "./pages.css";

export default function About() {
  return (
    <>
      <Seo
        title="About Us"
        description="Learn about TechInfy Data Tools — a free, privacy-first browser toolkit for converting and formatting lists, CSV, SQL and JSON data."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">About</span>
          <h1>Small tools, built to just work</h1>
          <p>
            TechInfy Data Tools is a focused set of browser-based utilities for people who move
            data between formats every day.
          </p>
        </div>
      </header>

      <section className="container section prose" style={{ maxWidth: 760 }}>
        <h2>Why we built this</h2>
        <p>
          Developers, testers, analysts and students regularly need to reshape small pieces of
          data — turning a column of spreadsheet values into a SQL clause, splitting a
          comma-separated string back into a list, or cleaning up messy pasted text. These are
          quick jobs, but the tools available for them are often cluttered, slow, or ask you to
          install something. TechInfy Data Tools exists to make that five-second task take five
          seconds.
        </p>

        <h2>What makes it different</h2>
        <p>
          Every conversion runs directly in your browser using JavaScript already loaded on the
          page. There's no upload step, no account, and no waiting on a server round-trip — the
          output updates as you type or toggle an option. We built it as a set of independent
          tools sharing one interface, so new utilities can be added over time without changing
          how the ones you already use behave.
        </p>

        <h2>Who it's for</h2>
        <ul>
          <li><strong>Developers</strong> turning lists into SQL clauses, JSON arrays or JS literals.</li>
          <li><strong>QA and testers</strong> preparing bulk test data or comparing lists.</li>
          <li><strong>Analysts</strong> reshaping exported spreadsheet columns for another system.</li>
          <li><strong>Students and general users</strong> who just need to clean up a pasted list.</li>
        </ul>

        <h2>The TechInfy name</h2>
        <p>
          TechInfy Data Tools is built and maintained under the TechInfy brand. Our goal is to
          keep every tool fast, free to use, and honest about what happens to your data — see our{" "}
          <Link to="/privacy">Privacy Policy</Link> for the specifics.
        </p>
      </section>
    </>
  );
}
