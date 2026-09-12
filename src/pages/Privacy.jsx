import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import "./pages.css";

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="TechInfy Data Tools privacy policy: how conversion data is processed locally in your browser, what local storage is used for, and what we do not collect."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Privacy</span>
          <h1>Privacy Policy</h1>
        </div>
      </header>

      <section className="container section prose" style={{ maxWidth: 760 }}>
        <h2>Your conversion data</h2>
        <p>
          The text you paste or type into any TechInfy Data Tools converter is processed{" "}
          <strong>entirely on your device, inside your web browser</strong>. Conversion logic
          (splitting, joining, sorting, deduplicating, formatting) runs as JavaScript in the page
          you already loaded. We do not transmit the content of your input or output to any
          TechInfy server, and we do not store it in any database. If you close or refresh the
          tab, that data is gone.
        </p>

        <h2>Local storage</h2>
        <p>
          We use your browser's <code>localStorage</code> for exactly one thing: remembering
          whether you prefer light, dark, or system-matched theme. This is a small piece of data
          stored only on your device — it is never sent to us and does not identify you.
        </p>

        <h2>File uploads and downloads</h2>
        <p>
          If you use the "Upload file" option, the file is read locally by your browser using the
          standard File API and never leaves your device. If you use "Download", the output file
          is generated locally in your browser and saved directly by your browser — again, without
          any server involved.
        </p>

        <h2>Clipboard access</h2>
        <p>
          The Paste and Copy buttons use your browser's Clipboard API, which requires your
          browser's own permission prompt. We only read from or write to the clipboard when you
          click those buttons.
        </p>

        <h2>Cookies</h2>
        <p>
          TechInfy Data Tools does not set tracking cookies. Any storage used is limited to the
          local, on-device theme preference described above.
        </p>

        <h2>Analytics</h2>
        <p>
          The current version of this site does not include any analytics or tracking scripts. If
          that changes in the future, we will update this policy to describe what is collected
          and why before any such tool is enabled.
        </p>

        <h2>Advertising</h2>
        <p>
          The site does not currently display advertising. We have reserved space in the layout
          for possible future ad placements, but no ad network is active today, and no page
          content or user data is shared with an ad provider. This policy will be updated before
          any advertising is introduced.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy can be sent through our <Link to="/contact">Contact page</Link>.
        </p>
      </section>
    </>
  );
}
