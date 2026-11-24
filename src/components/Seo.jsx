import { useEffect } from "react";

const SITE_URL = "https://delimitertool.com";
const SITE_NAME = "TechInfy Data Tools";
const OG_SITE_NAME = "Free Online Comma Separator & Delimiter Tool";
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

    // index.html hard-codes the canonical as the home page; without this every
    // route would tell search engines it is a duplicate of "/".
    const canonicalUrl = `${SITE_URL}${window.location.pathname}`;
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
    setMetaTag("property", "og:url", canonicalUrl);

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:site_name", OG_SITE_NAME);
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
  }, [title, description]);

  return null;
}
