import { useState } from "react";
import Seo from "../components/Seo.jsx";
import "./pages.css";
import "./Contact.css";

const CONTACT_EMAIL = "techinfy.ti@gmail.com";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const mailtoHref = () => {
    const subject = encodeURIComponent(`TechInfy Data Tools — message from ${form.name || "website visitor"}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name || "Anonymous"} (${form.email || "no email given"})`);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with the TechInfy Data Tools team with questions, feedback or feature requests."
      />

      <header className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">Contact</span>
          <h1>Get in touch</h1>
          <p>
            Found a bug, have a feature request, or just want to say hello? We'd like to hear
            from you.
          </p>
        </div>
      </header>

      <section className="container section">
        <div className="contact-grid">
          <div className="card contact-form">
            <h2 className="section__heading" style={{ fontSize: "1.2rem" }}>Send a message</h2>
            <p className="section__subheading" style={{ marginBottom: 18 }}>
              This opens your email app with the message pre-filled — nothing is sent to a server.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = mailtoHref();
              }}
            >
              <div className="form-field">
                <label className="field-label" htmlFor="contact-name">Your name</label>
                <input
                  id="contact-name"
                  type="text"
                  className="text-input"
                  value={form.name}
                  onChange={update("name")}
                  autoComplete="name"
                />
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="contact-email">Your email</label>
                <input
                  id="contact-email"
                  type="email"
                  className="text-input"
                  value={form.email}
                  onChange={update("email")}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  className="text-input contact-textarea"
                  value={form.message}
                  onChange={update("message")}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Open email to send</button>
            </form>
          </div>

          <div className="card contact-info">
            <h2 className="section__heading" style={{ fontSize: "1.2rem" }}>Other ways to reach us</h2>
            <p className="section__subheading" style={{ marginBottom: 14 }}>
              Prefer email directly? Write to us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <p className="section__subheading" style={{ marginBottom: 0 }}>
              We read every message and typically reply within a few business days. We only use
              the details you provide to respond to your message.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
