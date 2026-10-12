"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { accentColor, onAccentChange } from "@/lib/accent";

type Mood = { a: [string, number, number, number]; b: [string, number, number, number] };
// [colour, x%, y%, opacity] for each of the two light pools.
// "@300"-style colours follow the chosen accent theme; plain hex values are the room's warm light.
const MOODS: Record<string, Mood> = {
  home: { a: ["#e8a050", 78, 60, 0.22], b: ["#7a3f46", 30, 20, 0.12] },
  about: { a: ["@300", 18, 40, 0.16], b: ["#e8a050", 85, 75, 0.1] },
  skills: { a: ["@100", 68, 45, 0.16], b: ["@400", 20, 80, 0.1] },
  projects: { a: ["@300", 50, 70, 0.14], b: ["@300", 15, 25, 0.08] },
  experience: { a: ["#c98a3a", 50, 50, 0.16], b: ["#6b4a2a", 85, 20, 0.1] },
  companies: { a: ["@300", 15, 30, 0.12], b: ["#e8a050", 85, 80, 0.1] },
  contact: { a: ["#e3976a", 80, 70, 0.2], b: ["#4a3240", 30, 25, 0.16] },
};

let pools: { a: HTMLElement; b: HTMLElement } | null = null;
let reducedMotion = false;
let currentMood = "home";

const resolve = (color: string) => (color.startsWith("@") ? accentColor(color.slice(1) as "100" | "300" | "400") : color);

function paint(el: HTMLElement, [raw, x, y, alpha]: [string, number, number, number], duration: number) {
  const color = resolve(raw);
  gsap.to(el, { "--c": color, "--x": `${x}%`, "--y": `${y}%`, opacity: alpha, duration, ease: "sine.inOut", overwrite: "auto" });
}

/** Lets a section (e.g. the project showcase) tint the secondary light pool. */
export function setAmbientAccent(color: string) {
  if (!pools || currentMood !== "projects") return;
  gsap.to(pools.b, { "--c": color, opacity: 0.16, duration: reducedMotion ? 0 : 1.2, ease: "sine.inOut", overwrite: "auto" });
}

/**
 * A fixed layer of two soft champagne light pools behind the page. As each section
 * becomes the main one on screen the pools drift to its "mood", tying the sections
 * together like one continuously lit space. Pure CSS gradients — no blur filters.
 */
export function AmbientLight() {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    if (!a.current || !b.current) return;
    pools = { a: a.current, b: b.current };
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reducedMotion ? 0 : 1.8;
    paint(a.current, MOODS.home.a, 0);
    paint(b.current, MOODS.home.b, 0);
    const sections = Object.keys(MOODS)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    // Whichever section crosses the 55% line owns the light (robust to pinned overlaps).
    // Section bounds are measured on refresh only, so scrolling does no layout reads.
    let bounds: { id: string; top: number; bottom: number }[] = [];
    const measure = () => {
      bounds = sections.map((el) => {
        const box = (el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el).getBoundingClientRect();
        return { id: el.id, top: box.top + window.scrollY, bottom: box.bottom + window.scrollY };
      });
    };
    const update = (scrollY: number) => {
      const line = scrollY + window.innerHeight * 0.55;
      const hit = bounds.find((b) => b.top <= line && b.bottom > line);
      if (!hit || hit.id === currentMood || !a.current || !b.current) return;
      currentMood = hit.id;
      paint(a.current, MOODS[hit.id].a, d);
      paint(b.current, MOODS[hit.id].b, d);
    };
    currentMood = "home";
    ScrollTrigger.create({
      start: 0,
      end: "max",
      refreshPriority: -1, // after the pins have added their spacers
      onRefresh: (self) => {
        measure();
        update(self.scroll());
      },
      onUpdate: (self) => update(self.scroll()),
    });
    const stopAccent = onAccentChange(() => {
      if (!a.current || !b.current) return;
      paint(a.current, MOODS[currentMood].a, d);
      paint(b.current, MOODS[currentMood].b, d);
    });
    return () => {
      stopAccent();
      pools = null;
      currentMood = "home";
    };
  });

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div ref={a} className="ambient-pool absolute inset-0" />
      <div ref={b} className="ambient-pool absolute inset-0" />
    </div>
  );
}
