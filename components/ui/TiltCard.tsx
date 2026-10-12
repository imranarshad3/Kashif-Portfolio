"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** Subtle pointer-driven 3D tilt with a moving gold sheen. */
export function TiltCard({ children, className = "", max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`;
    ref.current.style.setProperty("--sheen-x", `${(x + 0.5) * 100}%`);
    ref.current.style.setProperty("--sheen-y", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative transition-transform duration-300 ease-out [transform-style:preserve-3d] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 [background:radial-gradient(420px_circle_at_var(--sheen-x,30%)_var(--sheen-y,0%),rgb(var(--a-200)/0.10),transparent_45%)]"
      />
      {children}
    </div>
  );
}
