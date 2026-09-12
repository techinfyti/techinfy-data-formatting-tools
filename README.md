# TechInfy Data Tools

A free, browser-based data conversion toolkit built for TechInfy. The flagship
tool converts between column/list data and delimited text (comma, semicolon,
pipe, tab, space, newline, or a custom delimiter), with live formatting
options and quick presets for SQL, JSON, JavaScript, CSV and quoted lists.

Everything runs client-side in the browser — no backend, no accounts, and no
user data is ever uploaded or stored on a server.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/) — lightweight, fast dev/build tooling
- [react-router-dom](https://reactrouter.com/) for client-side routing
- Plain CSS with custom properties for theming (no CSS framework)
- Zero backend, zero database

## Project structure

```
src/
  components/     Reusable UI: Header, Footer, Converter, ToolCard, Seo, AdSlot
  context/        ThemeContext (light/dark/system, persisted to localStorage)
  data/           Static data (tools.js — the Tools page catalog)
  pages/          Route-level pages: Home, Tools, About, Privacy, Contact, NotFound
  utils/          converter.js — pure, dependency-free conversion logic
public/           Static assets: favicon, robots.txt, sitemap.xml, _redirects
```

### Adding a new tool

1. Add an entry to `src/data/tools.js` with `status: "soon"` (or `"available"`
   once implemented, plus a route in `to`).
2. If implementing it, add the pure logic to `src/utils/`, build a component
   under `src/components/`, and either extend `Converter.jsx` or create a new
   page/route in `src/App.jsx`.

This keeps the tool catalog and the underlying logic decoupled, so new tools
can be added without touching the existing ones.

## Local development

Requires Node.js 18+.

```bash
npm install
npm run dev
```

This starts a local dev server (default `http://localhost:5173`) with hot
module reload.

## Production build

```bash
npm run build
```

Outputs a static site to `dist/`. Preview it locally with:

```bash
npm run preview
```

## Linting

```bash
npm run lint
```

## Deployment

The build output in `dist/` is a fully static site — deploy it to any static
host. Since the app uses client-side routing, the host must rewrite all paths
to `index.html`.

**Vercel** — a `vercel.json` with the required rewrite is already included.
Import the repo or run `vercel deploy` from the project root; no extra config
needed.

**Netlify** — a `public/_redirects` file (`/* /index.html 200`) is already
included and will be copied into `dist/` on build. Set the build command to
`npm run build` and the publish directory to `dist`.

**Cloudflare Pages** — also honors `_redirects` automatically. Set the build
command to `npm run build` and the output directory to `dist`.

Any other static host (S3 + CloudFront, GitHub Pages, etc.) needs an
equivalent "rewrite unknown paths to index.html" rule for the same reason.

## Privacy

No conversion input/output ever leaves the browser. The only data persisted
is a single theme preference (`light` / `dark` / `system`) in
`localStorage`. See [`/privacy`](src/pages/Privacy.jsx) for the full policy,
which is kept in sync with the actual implementation.

## SEO

Each page sets its own `<title>` and meta description via
`src/components/Seo.jsx`. `index.html` carries the default title, meta
description, Open Graph tags and favicon. `public/robots.txt` and
`public/sitemap.xml` are included — update the domain in both (and in
`index.html`'s canonical link) before going live.
