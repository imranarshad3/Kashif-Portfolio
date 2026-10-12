"use client";

import { useSyncExternalStore } from "react";
import { ACCENT_KEY as KEY } from "./accentScript";

export type AccentId = "gold" | "rose" | "platinum" | "emerald" | "sapphire";

/** Swatch colours mirror the --a-100 / --a-300 / --a-400 values in globals.css. */
export const ACCENTS: { id: AccentId; label: string; swatch: [string, string, string] }[] = [
  { id: "gold", label: "Champagne Gold", swatch: ["#f8e2b2", "#d9b26f", "#a9803f"] },
  { id: "rose", label: "Rose Gold", swatch: ["#fcded6", "#d69585", "#a06258"] },
  { id: "platinum", label: "Platinum", swatch: ["#f4f6fa", "#b6bdca", "#788090"] },
  { id: "emerald", label: "Emerald", swatch: ["#d6f6e4", "#5cbe8e", "#267e5c"] },
  { id: "sapphire", label: "Sapphire", swatch: ["#deeaff", "#709cea", "#3a62ba"] },
];

const EVENT = "accentchange";
const IDS = ACCENTS.map((a) => a.id);

function read(): AccentId {
  const a = document.documentElement.getAttribute("data-accent") as AccentId | null;
  return a && IDS.includes(a) ? a : "gold";
}

export function setAccent(id: AccentId) {
  if (id === "gold") document.documentElement.removeAttribute("data-accent");
  else document.documentElement.setAttribute("data-accent", id);
  try {
    localStorage.setItem(KEY, id);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useAccent() {
  return useSyncExternalStore(subscribe, read, () => "gold" as AccentId);
}

/** Subscribe outside React (e.g. GSAP-driven effects). */
export const onAccentChange = subscribe;

export type AccentSlot = "100" | "200" | "300" | "400" | "glow";

/** Current accent slot as "r, g, b" (for building rgba() strings in canvas code). */
export function accentTriplet(slot: AccentSlot) {
  if (typeof window === "undefined") return "217, 178, 111";
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--a-${slot}`).trim();
  return v.split(/\s+/).join(", ");
}

/** Current accent slot as a colour string usable by three.js / GSAP, e.g. "rgb(217, 178, 111)". */
export function accentColor(slot: AccentSlot) {
  return `rgb(${accentTriplet(slot)})`;
}

/** All slots as rgb() strings, keyed by slot. */
export function accentPalette() {
  return { "100": accentColor("100"), "200": accentColor("200"), "300": accentColor("300"), "400": accentColor("400"), glow: accentColor("glow") };
}
export type AccentPalette = ReturnType<typeof accentPalette>;
