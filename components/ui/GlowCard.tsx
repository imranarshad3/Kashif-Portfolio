"use client";

import { useRef, type ReactNode } from "react";

/**
 * Glass card with a champagne-gold highlight that follows the cursor across its
 * surface and lights up the border nearest the pointer.
 */
export function GlowCard({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "article" | "li" }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${e.clientX - r.left}px`);
    el.style.setProperty("--gy", `${e.clientY - r.top}px`);
  };
  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      className={`glow-card group/glow relative isolate overflow-hidden ${className}`}
    >
      {children}
    </Tag>
  );
}
