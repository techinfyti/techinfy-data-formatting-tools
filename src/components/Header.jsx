import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import "./Header.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const order = ["light", "dark", "system"];
  const icons = { light: "☀️", dark: "🌙", system: "🖥️" };
  const labels = { light: "Light mode", dark: "Dark mode", system: "System theme" };

  const cycle = () => {
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="btn btn-secondary btn-icon theme-toggle"
      onClick={cycle}
      aria-label={`Theme: ${labels[theme]}. Click to change.`}
      title={labels[theme]}
    >
      <span aria-hidden="true">{icons[theme]}</span>
    </button>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <img className="brand__logo" src="/logo-full.png" alt="TechInfy" height="52" />
          <span className="brand__text-sub">Data Formatting Tools</span>
        </NavLink>

        <nav className="site-nav site-nav--desktop" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "site-nav__link" + (isActive ? " is-active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-ghost btn-icon menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="site-nav site-nav--mobile" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => "site-nav__link" + (isActive ? " is-active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
