"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

const SELECTOR = ".btn-gold, .btn-ghost, [data-magnetic]";

/**
 * Site-wide magnetic hover: buttons drift gently toward the cursor and spring back.
 * One delegated listener covers every current and future button. Fine pointers only,
 * and nothing runs when reduced motion is requested.
 */
export function MagneticButtons() {
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    const movers = new WeakMap<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
    let current: HTMLElement | null = null;

    const release = (el: HTMLElement) => {
      const m = movers.get(el);
      if (m) {
        m.x(0);
        m.y(0);
      }
    };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;
      if (current && current !== el) release(current);
      current = el;
      if (!el) return;
      let m = movers.get(el);
      if (!m) {
        m = {
          x: gsap.quickTo(el, "x", { duration: 0.55, ease: "elastic.out(1, 0.6)" }),
          y: gsap.quickTo(el, "y", { duration: 0.55, ease: "elastic.out(1, 0.6)" }),
        };
        movers.set(el, m);
      }
      const r = el.getBoundingClientRect();
      const strength = el.dataset.magnetic ? Number(el.dataset.magnetic) || 0.3 : 0.28;
      m.x((e.clientX - (r.left + r.width / 2)) * strength);
      m.y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeaveWindow = () => {
      if (current) release(current);
      current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      if (current) gsap.set(current, { x: 0, y: 0 });
    };
  }, []);
  return null;
}
