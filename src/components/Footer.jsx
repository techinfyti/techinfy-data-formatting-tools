import { NavLink } from "react-router-dom";
import "./Footer.css";

const FOOTER_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__logo-row">
            <img className="site-footer__logo" src="/logo-footer.png" alt="TechInfy" />
            <span className="site-footer__title">Data Formatting Tools</span>
          </div>
          <p className="site-footer__tagline">
            Simple tools for everyday data conversion and formatting.
          </p>
        </div>

        <nav className="site-footer__links" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "site-footer__link" + (isActive ? " is-active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <p className="site-footer__copyright">© {year} TechInfy. All rights reserved.</p>
      </div>
    </footer>
  );
}
