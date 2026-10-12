"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis, jumpTo, registerLenis, scrollToTarget, sectionTop } from "@/lib/scroll";

const POSITIONS_KEY = "kashif-scroll-positions";

/**
 * Scroll positions per URL, so back/forward lands where the visitor left — measured after
 * the destination's pins exist. The browser's own restoration can't do that: it restores
 * while the previous page is still on screen, and the position gets clamped.
 */
const positions = new Map<string, number>();
const entryKey = () => window.location.pathname + window.location.hash;
let renderedPath: string | null = null;
let pendingRestore = false;

function loadPositions() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(POSITIONS_KEY) ?? "{}") as Record<string, number>;
    for (const [k, v] of Object.entries(saved)) positions.set(k, v);
  } catch {}
}

function savePositions() {
  try {
    sessionStorage.setItem(POSITIONS_KEY, JSON.stringify(Object.fromEntries(positions)));
  } catch {}
}

/**
 * Inertial page scrolling (Lenis) driven by GSAP's ticker, so ScrollTrigger pins and
 * scrubs advance in lock-step with the smoothed scroll. Also turns same-page anchor
 * links into eased, focus-managed scrolls and owns scroll restoration.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Through ScrollTrigger: it re-applies its remembered value on every refresh, so setting
    // history.scrollRestoration directly would silently revert to "auto".
    ScrollTrigger.clearScrollMemory("manual");
    loadPositions();

    const lenis = new Lenis({
      // a touch more glide; wheel distance trimmed so long glides don't overshoot sections
      lerp: 0.07,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      smoothWheel: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    registerLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Remember where this history entry is — except mid route change, when the URL already
    // names the next page while the old one is still painted.
    const onScroll = () => {
      if (!pendingRestore && renderedPath === window.location.pathname) positions.set(entryKey(), window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", savePositions);

    // Same-page anchors: "#about", or "/#about" while already on "/".
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const el = document.getElementById(url.hash.slice(1));
      if (!el) return;
      e.preventDefault();
      if (window.location.hash !== url.hash) history.pushState(history.state, "", url.hash);
      scrollToTarget(el, { focus: true });
    };
    document.addEventListener("click", onClick);

    // Back/forward: between section hashes glide there; across pages, restore once the
    // destination has rendered (see the pathname effect below).
    const onPop = () => {
      if (window.location.pathname !== renderedPath) {
        pendingRestore = true;
        return;
      }
      const id = window.location.hash.slice(1);
      if (id && document.getElementById(id)) scrollToTarget(id);
      else if (!id) scrollToTarget(0);
    };
    window.addEventListener("popstate", onPop);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", savePositions);
      gsap.ticker.remove(tick);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);

  // After a route change (and on first load): restore the history position or honour a
  // "/#section" hash — and keep it anchored while the page finishes laying out. Sections can
  // hydrate after this component, and each pin they create inserts a spacer that would
  // otherwise push the target away. The anchor lets go as soon as the visitor takes over.
  useEffect(() => {
    const firstLoad = renderedPath === null;
    const navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    const restore = pendingRestore || (firstLoad && (navType === "reload" || navType === "back_forward"));
    const saved = restore ? positions.get(entryKey()) : undefined;
    const hash = window.location.hash.slice(1);
    const target = () => {
      if (saved !== undefined) return saved;
      const el = hash ? document.getElementById(hash) : null;
      if (el) return sectionTop(el);
      return restore ? 0 : null;
    };
    let raf = 0;
    const apply = () => {
      const y = target();
      if (y !== null && Math.abs(window.scrollY - y) > 1) jumpTo(y);
    };
    const reapply = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    const ro = new ResizeObserver(reapply);
    const inputs = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", reapply);
      inputs.forEach((t) => window.removeEventListener(t, release));
      clearTimeout(timeout);
    };
    const timeout = window.setTimeout(release, 4000);

    // two frames: let this route's sections mount and create their ScrollTriggers first
    raf = requestAnimationFrame(
      () =>
        (raf = requestAnimationFrame(() => {
          getLenis()?.resize();
          ScrollTrigger.refresh();
          apply();
          pendingRestore = false;
          renderedPath = pathname;
          if (target() === null) return release();
          ro.observe(document.body);
          ScrollTrigger.addEventListener("refresh", reapply);
          inputs.forEach((t) => window.addEventListener(t, release, { passive: true }));
        })),
    );
    return () => {
      cancelAnimationFrame(raf);
      release();
    };
  }, [pathname]);

  return null;
}
