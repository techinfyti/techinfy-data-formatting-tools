import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import "./pages.css";

export default function NotFound() {
  return (
    <>
      <Seo title="Page Not Found" />
      <section className="container section" style={{ textAlign: "center", padding: "96px 20px" }}>
        <h1 style={{ fontSize: "2.4rem", marginBottom: 12 }}>404</h1>
        <p className="section__subheading" style={{ margin: "0 auto 24px", textAlign: "center" }}>
          We couldn't find that page. It may have moved, or the link might be outdated.
        </p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </section>
    </>
  );
}
