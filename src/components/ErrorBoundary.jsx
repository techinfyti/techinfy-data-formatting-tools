import { Component } from "react";

const CHUNK_ERROR_PATTERN = /dynamically imported module|failed to fetch|loading chunk|chunkloaderror/i;
const RELOAD_FLAG = "techinfy-chunk-reload";

// A stale service worker (or a page left open across a new deploy) can leave
// the browser holding JS that references a chunk file the current deployment
// no longer serves. That failed dynamic import throws during render, and with
// no boundary here React unmounts the whole tree to a blank white page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: CHUNK_ERROR_PATTERN.test(error?.message ?? "") };
  }

  componentDidCatch(error) {
    console.error("ErrorBoundary caught:", error);
    if (this.state.isChunkError) {
      // A newer version was deployed while this page was loaded. Reload once
      // automatically to pick it up — most visitors never see the fallback.
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
        if (!alreadyReloaded) sessionStorage.setItem(RELOAD_FLAG, "1");
      } catch {
        // sessionStorage unavailable (private mode etc.) — fall through to the fallback UI.
      }
      if (!alreadyReloaded) {
        window.location.reload();
      }
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container section" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h1>Something went wrong</h1>
        <p style={{ color: "var(--text-faint)", marginTop: "8px" }}>
          {this.state.isChunkError
            ? "A newer version of this page is available. Please refresh to continue."
            : "This page hit an unexpected error. Please refresh and try again."}
        </p>
        <button type="button" className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>
    );
  }
}
