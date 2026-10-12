"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { BadgeCheck, Bot, CreditCard, Database, Workflow } from "lucide-react";
import { profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";

const capabilities = [
  { icon: CreditCard, label: "Payments & billing" },
  { icon: Bot, label: "AI agents & RAG" },
  { icon: Database, label: "Data models & APIs" },
  { icon: Workflow, label: "Multi-tenant SaaS" },
];

// Arch outline in a 100 × 125 box (matches the frame's aspect), used for the gold rim light.
const ARCH = "M1 124 V50 A49 49 0 0 1 99 50 V124 Z";

/**
 * Desktop hero portrait: the untouched photo inside an arched glass frame with a drawn gold rim,
 * floating in the room with its own parallax depth. The "Currently" panel docks beneath it.
 * Animation hooks — entrance: [data-portrait], [data-portrait-photo], [data-portrait-rim], [data-hero-panel];
 * scroll exit: [data-portrait-column] (a separate element, so the two never fight over a property).
 */
export function HeroPortrait({ src }: { src: string }) {
  const frame = useRef<HTMLDivElement>(null);

  // Mouse parallax: the frame drifts with the pointer, the photo counter-drifts inside it for depth.
  useEffect(() => {
    const el = frame.current;
    if (!el || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const photo = el.querySelector<HTMLElement>("[data-portrait-photo]");
    const fx = gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" });
    const fy = gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 1.2, ease: "power3.out" }); // canonical name: quickTo can't reset the "rotateY" alias
    const px = photo ? gsap.quickTo(photo, "xPercent", { duration: 1.4, ease: "power3.out" }) : null;
    const py = photo ? gsap.quickTo(photo, "yPercent", { duration: 1.4, ease: "power3.out" }) : null;
    const move = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      fx(nx * 10);
      fy(ny * 8);
      ry(-8 + nx * 5);
      px?.(-nx * 1.6);
      py?.(-ny * 1.2);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div data-portrait-column className="pointer-events-none absolute bottom-8 right-6 top-28 hidden w-[300px] flex-col items-end justify-end xl:right-10 xl:flex [perspective:1100px] [transform-style:preserve-3d]">
      {/* floor glow: the portrait is lit by the room */}
      <div aria-hidden className="absolute -bottom-6 right-0 h-24 w-[320px] rounded-[50%] bg-[radial-gradient(ellipse,rgb(var(--a-glow)/0.22),transparent_70%)] blur-xl" />

      <div data-portrait className="relative w-[256px] [transform-style:preserve-3d]">
        {/* fixed tilt lives on this wrapper; the mouse parallax moves the inner element */}
        <div className="relative [transform:rotateY(-8deg)] [transform-style:preserve-3d]">
        <div ref={frame} className="pointer-events-auto relative [transform-style:preserve-3d]">
          {/* soft drop shadow cast onto the room */}
          <div aria-hidden className="absolute inset-x-4 -bottom-4 top-10 rounded-t-[999px] bg-black/70 blur-2xl [transform:translateZ(-40px)]" />
          {/* glass frame */}
          <div className="glass glass-blur relative rounded-t-[999px] rounded-b-[22px] p-2 shadow-[inset_0_1px_0_rgb(var(--a-100)/0.25),0_40px_80px_-30px_rgba(0,0,0,0.95)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[16px] bg-black">
              <div data-portrait-photo className="absolute -inset-[3%]">
                <Image
                  src={src}
                  alt={`Portrait of ${profile.name}`}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1280px) 256px, 0px"
                  quality={90}
                  className="object-cover object-[50%_20%]"
                />
              </div>
              {/* frame lighting only — warm glint along the inner edge, deeper shade at the base */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(var(--a-100)/0.22),inset_0_-60px_60px_-30px_rgba(6,6,8,0.75)]" />
            </div>
            {/* gold rim light, drawn in on entrance */}
            <svg aria-hidden viewBox="0 0 100 125" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <linearGradient id="portrait-rim" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
                  <stop offset="0.45" style={{ stopColor: "rgb(var(--a-300))" }} stopOpacity="0.55" />
                  <stop offset="1" style={{ stopColor: "rgb(var(--a-200))" }} />
                </linearGradient>
              </defs>
              <path
                data-portrait-rim
                d={ARCH}
                fill="none"
                stroke="url(#portrait-rim)"
                strokeWidth="0.5"
                style={{ filter: "drop-shadow(0 0 4px rgb(var(--a-glow)/0.7))" }}
              />
            </svg>
          </div>
        </div>
        </div>
      </div>

      {/* "Currently" plaque docked under the portrait */}
      <div data-hero-panel className="pointer-events-auto relative z-10 -mt-5 w-[300px] [transform-style:preserve-3d]">
        {/* pushed forward in 3D so the tilted frame's near edge never cuts across it */}
        <div className="rounded-2xl border border-gold/25 bg-[linear-gradient(160deg,rgba(32,27,20,0.96),rgba(12,11,10,0.97))] p-4 [transform:translateZ(60px)] shadow-[inset_0_1px_0_rgb(var(--a-100)/0.2),0_24px_50px_-20px_rgba(0,0,0,0.95)]">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-faint">
            <BadgeCheck className="h-3 w-3 text-gold" aria-hidden /> Currently
          </p>
          <p className="mt-1 text-[13px] leading-snug text-text">
            {profile.currentRole.title}
            <span className="text-muted"> · {profile.currentRole.company}</span>
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 border-t border-white/10 pt-3">
            {capabilities.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[11.5px] leading-tight text-muted">
                <Icon className="h-3.5 w-3.5 shrink-0 text-gold-bright" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-gold-bright">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-gold-bright/60 motion-reduce:animate-none" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-gold-bright" />
            </span>
            Available {profile.availability} · {profile.rate}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact arched portrait for tablet/phone, shown beside the hero eyebrow.
 * Uses its own small copy of the photo (resized only) and loads lazily, so desktops — where it's
 * hidden — never download or preload it. The desktop frame loads eagerly as the page's largest paint.
 */
export function HeroPortraitBadge({ src }: { src: string }) {
  return (
    <span className="relative inline-block h-[70px] w-14 shrink-0 overflow-hidden rounded-t-[999px] rounded-b-xl border border-gold/40 bg-black shadow-[0_0_0_3px_rgb(var(--a-100)/0.06),0_10px_30px_-10px_rgb(var(--a-glow)/0.55)] xl:hidden">
      <Image src={src} alt={`Portrait of ${profile.name}`} fill sizes="56px" quality={90} className="object-cover object-[50%_20%]" />
    </span>
  );
}
