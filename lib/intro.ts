"use client";

/**
 * Landing intro coordination. The decision is made once per page load, synchronously,
 * so the hero (which sets up in a layout effect) and the intro agree on it.
 */
export const INTRO_KEY = "kashif-intro-seen";

function shouldSkip() {
  try {
    return (
      sessionStorage.getItem(INTRO_KEY) === "1" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.location.hash.length > 1 ||
      // only on a full page load of the home page, never after client-side navigation
      new URL((performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.name ?? location.href).pathname !== "/"
    );
  } catch {
    return true;
  }
}

/** The same rules as `shouldSkip`, inlined so they run before first paint (see <Intro />). */
export const INTRO_SKIP_CHECK = `(function(){try{return sessionStorage.getItem("${INTRO_KEY}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches||location.hash.length>1}catch(e){return true}})()`;

let decided: boolean | null = null;
let done = false;
const waiters = new Set<() => void>();

export function introWillPlay() {
  if (typeof window === "undefined") return false;
  if (decided === null) {
    decided = !shouldSkip();
    if (!decided) done = true;
  }
  return decided;
}

/** Runs `cb` once the intro curtain opens (immediately if there is no intro). */
export function onIntroDone(cb: () => void) {
  introWillPlay();
  if (done) {
    cb();
    return () => {};
  }
  waiters.add(cb);
  return () => waiters.delete(cb);
}

export function introIsDone() {
  return done;
}

export function markIntroDone() {
  if (done) return;
  done = true;
  waiters.forEach((cb) => cb());
  waiters.clear();
}
