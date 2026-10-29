// The PWA service worker serves the previous build from its cache until the
// page reloads, so after a deploy a phone can keep showing the old site for
// days. Reload once when a new worker takes over, and re-check for updates
// whenever the tab comes back to the foreground.
export function setupServiceWorkerAutoRefresh() {
  if (!("serviceWorker" in navigator)) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    // Never wipe something the visitor has typed or pasted; the new version
    // simply shows up on their next visit instead.
    const hasUserData = [...document.querySelectorAll("textarea")].some((t) => t.value);
    if (hasUserData) return;
    reloading = true;
    window.location.reload();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.update())
      .catch(() => {});
  });
}
