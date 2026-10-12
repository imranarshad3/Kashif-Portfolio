"use client";

/**
 * Remembers that a navigation started from a morphing screenshot, so the destination
 * page can skip its own image entrance (the view-transition morph *is* the entrance).
 * Module state survives client-side navigation, which is all we need.
 */
let pending: string | null = null;

export function markMorph(slug: string) {
  pending = slug;
}

export function consumeMorph(slug: string) {
  const hit = pending === slug;
  pending = null;
  return hit;
}
