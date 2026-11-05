import { useEffect } from "react";

// Keeps --header-offset correct when the header's height changes without a scroll
// (announcement bar dismissed, message wraps on mobile, window resized).
export function NavHeightSync() {
  useEffect(() => {
    const nav = document.getElementById("nav-outer");
    if (!nav) return;
    const root = document.documentElement;

    const sync = () => {
      // Only publish while the header is showing; NavScrollBehavior owns the hidden state.
      if (nav.style.transform === "") {
        root.style.setProperty("--header-offset", `${nav.offsetHeight}px`);
      }
    };

    const ro = new ResizeObserver(sync);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  return null;
}

