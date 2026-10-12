"use client";

import type Lenis from "lenis";

/**
 * Single smooth-scroll instance shared by the app. `SmoothScroll` registers it;
 * everything that moves the page programmatically goes through `scrollToTarget`
 * so navigation feels the same everywhere (nav, CTAs, carousel arrows).
 */
let instance: Lenis | null = null;
let programmaticUntil = 0;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}

/** True while a programmatic scroll is in flight — lets the nav ignore sections it passes through. */
export function isProgrammaticScroll() {
  return performance.now() < programmaticUntil;
}

/** Fired on window when a programmatic scroll lands (or a position is restored). */
export const SCROLL_SETTLED = "smoothscroll:settled";

/**
 * Document position of a section. A pinned element is position:fixed mid-pin, so its
 * spacer holds the real position.
 */
export function sectionTop(el: HTMLElement) {
  const spacer = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
  return spacer.getBoundingClientRect().top + window.scrollY;
}

/** Jump without animation (route changes, restoring history); keeps Lenis in sync. */
export function jumpTo(y: number) {
  // Lenis clamps to its cached scroll limit, which lags behind freshly inserted pin spacers
  instance?.resize();
  if (instance) instance.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
  window.dispatchEvent(new Event(SCROLL_SETTLED));
}

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

/** Longer journeys get a little more time, within a calm range. */
function durationFor(distance: number) {
  return Math.min(1.8, Math.max(0.9, 0.7 + Math.abs(distance) / 3200));
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Target = string | HTMLElement | number;

function resolve(target: Target): { y: number; el: HTMLElement | null } | null {
  if (typeof target === "number") return { y: target, el: null };
  const el = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : target;
  if (!el) return null;
  return { y: sectionTop(el), el };
}

/**
 * Smoothly scroll to a section id, element or Y position.
 * Moves keyboard focus to the destination section (without a second jump) when `focus` is set.
 */
export function scrollToTarget(
  target: Target,
  {
    focus = false,
    offset = 0,
    duration: fixedDuration,
    onComplete,
  }: { focus?: boolean; offset?: number; duration?: number; onComplete?: () => void } = {},
) {
  const resolved = resolve(target);
  if (!resolved) return;
  const { el } = resolved;
  const y = Math.max(0, resolved.y + offset);
  const distance = y - window.scrollY;
  const duration = fixedDuration ?? durationFor(distance);

  const done = () => {
    programmaticUntil = 0;
    if (focus && el) {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
    window.dispatchEvent(new Event(SCROLL_SETTLED));
    onComplete?.();
  };

  if (reducedMotion() || !instance) {
    window.scrollTo({ top: y, behavior: "auto" });
    done();
    return;
  }

  programmaticUntil = performance.now() + duration * 1000 + 150;
  instance.resize(); // see jumpTo
  instance.scrollTo(y, { duration, easing: easeInOutExpo, onComplete: done, force: true });
}
