import { useEffect } from "react";

const SITE_NAME = "TechInfy Data Tools";
const DEFAULT_DESCRIPTION =
  "Free online delimiter tool to convert and clean lists, CSV, SQL and JSON data. Switch between comma, pipe, tab and custom delimiters instantly, right in your browser.";

function setMetaTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets document title + meta description/OG tags per page.
 * No external dependency (e.g. react-helmet) needed for a page count this small.
 */
export default function Seo({ title, description = DEFAULT_DESCRIPTION }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `Delimiter Tool – Free Online Delimiter Converter | TechInfy`;
    document.title = fullTitle;

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
  }, [title, description]);

  return null;
}
