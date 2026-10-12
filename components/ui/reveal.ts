"use client";

import { gsap, SplitText, type ScrollTrigger } from "@/lib/gsap";

/** One slow pass of champagne light across gold gradient words inside `el`. */
export function goldSweep(el: Element, delay = 0) {
  const words = el.querySelectorAll(".text-gold-gradient");
  if (!words.length) return null;
  return gsap.fromTo(
    words,
    { "--sweep": "-60%" },
    { "--sweep": "160%", duration: 1.8, ease: "power2.inOut", delay, stagger: 0.12 },
  );
}

/**
 * Counts `[data-countup]` up to the number already rendered in the element, so the
 * final value is in the HTML for no-JS and reduced-motion visitors.
 * Optional `data-from` sets the start (e.g. a year), decimals follow the rendered text.
 */
export function countUp(el: HTMLElement, opts: { scrollTrigger?: ScrollTrigger.Vars; delay?: number } = {}) {
  const final = el.textContent?.trim() ?? "";
  const target = Number.parseFloat(final);
  if (!Number.isFinite(target)) return null;
  const decimals = final.includes(".") ? final.split(".")[1].length : 0;
  const from = Number(el.dataset.from ?? 0);
  const counter = { v: from };
  const render = () => {
    el.textContent = counter.v.toFixed(decimals);
  };
  return gsap.fromTo(
    counter,
    { v: from },
    {
      v: target,
      duration: 1.6,
      ease: "power3.out",
      delay: opts.delay ?? 0,
      immediateRender: false,
      scrollTrigger: opts.scrollTrigger,
      onUpdate: render,
      onComplete: () => {
        el.textContent = final;
      },
      onReverseComplete: () => {
        el.textContent = final;
      },
    },
  );
}

/** Masked line-by-line headline reveal, re-split automatically on resize/font load. Reversible. */
export function revealHeadline(el: HTMLElement, trigger: Element = el) {
  SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-line",
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({ scrollTrigger: { trigger, start: "top 85%", toggleActions: "play none none reverse" } });
      tl.from(self.lines, { yPercent: 108, rotate: 1.5, duration: 1.15, ease: "expo.out", stagger: 0.11 });
      const sweep = goldSweep(el);
      if (sweep) tl.add(sweep, 0.45);
      return tl;
    },
  });
}

/** Brief letter shuffle that settles into the eyebrow's real text. */
export function scrambleIn(el: HTMLElement, trigger: Element = el) {
  const text = el.textContent ?? "";
  if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", text.trim());
  gsap.from(el, {
    duration: 0.9,
    ease: "none",
    scrambleText: { text: "", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ·", speed: 0.6, revealDelay: 0.15 },
    scrollTrigger: { trigger, start: "top 85%", toggleActions: "play none none reverse" },
    onReverseComplete: () => {
      el.textContent = text;
    },
  });
}

/**
 * Standard reveals for each `[data-reveal-group]` in scope (reversible):
 * `[data-split]` headlines get masked lines + gold sweep, `[data-scramble]` eyebrows shuffle in,
 * and every other `[data-reveal]` item rises in with a stagger.
 */
export function revealGroups(scope: Element) {
  const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]", scope);
  groups.forEach((group) => {
    group.querySelectorAll<HTMLElement>("[data-split]").forEach((h) => revealHeadline(h, group));
    group.querySelectorAll<HTMLElement>("[data-scramble]").forEach((e) => scrambleIn(e, group));
    group.querySelectorAll<HTMLElement>("[data-countup]").forEach((e) =>
      countUp(e, { delay: 0.3, scrollTrigger: { trigger: group, start: "top 85%", toggleActions: "play none none reverse" } }),
    );
    const items = group.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    gsap.from(items, {
      y: 28,
      autoAlpha: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: "top 85%", toggleActions: "play none none reverse" },
    });
  });
}
