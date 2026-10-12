"use client";

import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import { siUpwork } from "simple-icons";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { Stars } from "./Stars";

/** Verified reviews only, each paired with the dates of the contract it was left on. */
const reviews = profile.reviews.map((r) => ({ ...r, period: experience.find((e) => e.reviewId === r.id)?.period }));

/** Seconds a review stays fully readable before the droplet falls. */
const DWELL = 5;
const RINGS = 4;

/**
 * Floating Upwork review cards for the desktop hero.
 *
 * Each card holds for 5s, then a droplet falls onto the glass: a splash flash, concentric ripples
 * running outward, the content refracting through an SVG displacement filter while a feathered
 * hole opens from the centre and the card dissolves. The next card rises in on a staggered reveal.
 * Everything runs on GSAP's ticker (no extra rAF); the loop idles whenever `active` is false
 * (hero off-screen, scrolled away or still behind the intro), on hover/focus, or when paused.
 * Reduced motion: no float, parallax, ripple or auto-advance — a plain cross-fade on demand.
 */
export function HeroReviews({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const filterId = `review-liquid-${uid}`;
  const root = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const displace = useRef<SVGFEDisplacementMapElement>(null);
  const turbulence = useRef<SVGFETurbulenceElement>(null);

  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false); // hover or keyboard focus inside the carousel
  const [userPaused, setUserPaused] = useState(false);
  const current = useRef(0);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const running = active && !held && !userPaused && !reduced && reviews.length > 1;
  const runningRef = useRef(running);

  const goRef = useRef<(to: number) => void>(() => {});

  /** Queue the next review after the dwell; it waits (paused) while the loop is idle. */
  const schedule = useCallback(() => {
    timer.current?.kill();
    timer.current = gsap.delayedCall(DWELL, () => goRef.current((current.current + 1) % reviews.length));
    if (!runningRef.current) timer.current.pause();
  }, []);

  /** Dissolve the current card through a water-drop ripple, then raise card `to`. */
  const go = useCallback(
    (to: number) => {
      const from = current.current;
      if (to === from) return;
      transition.current?.progress(1); // a click mid-transition finishes it instantly
      timer.current?.kill();
      const out = slides.current[from];
      const inn = slides.current[to];
      if (!out || !inn) return;
      current.current = to;
      setIndex(to);

      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({ onComplete: schedule });
      transition.current = tl;

      if (still) {
        tl.to(out, { autoAlpha: 0, duration: 0.35 }).fromTo(inn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 });
        return;
      }

      const card = out.querySelector<HTMLElement>("[data-review-card]")!;
      const body = out.querySelector<HTMLElement>("[data-review-body]")!;
      const drop = out.querySelector("[data-drop]");
      const splash = out.querySelector("[data-splash]");
      const rings = out.querySelectorAll("[data-ring]");
      const w = card.offsetWidth;

      tl.set(card, { "--hole": "0px" })
        .call(() => {
          card.classList.add("is-dissolving");
          body.style.filter = `url(#${filterId})`;
        })
        // the droplet falls onto the glass and stretches as it lands
        .fromTo(drop, { attr: { cy: -150 }, opacity: 0, scaleY: 1.6 }, { attr: { cy: 0 }, opacity: 1, scaleY: 1, duration: 0.42, ease: "power2.in", transformOrigin: "50% 50%" })
        .to(drop, { opacity: 0, scale: 2.2, duration: 0.2, ease: "power1.out", transformOrigin: "50% 50%" })
        .fromTo(splash, { attr: { r: 2 }, opacity: 0.95 }, { attr: { r: 46 }, opacity: 0, duration: 0.7, ease: "expo.out" }, "<")
        // ripples run outward across the glass…
        .fromTo(
          rings,
          { attr: { r: 3 }, opacity: 0.85, strokeWidth: 2.2 },
          { attr: { r: w * 0.62 }, opacity: 0, strokeWidth: 0.4, duration: 1.9, ease: "power2.out", stagger: 0.17 },
          "<",
        )
        // …the surface refracts…
        .fromTo(displace.current, { attr: { scale: 0 } }, { attr: { scale: 26 }, duration: 0.9, ease: "sine.inOut" }, "<0.05")
        .fromTo(turbulence.current, { attr: { baseFrequency: "0.004 0.012" } }, { attr: { baseFrequency: "0.02 0.034" }, duration: 1.3, ease: "sine.inOut" }, "<")
        // …and the glass dissolves from the point of impact
        .to(card, { "--hole": `${Math.round(w * 0.9)}px`, duration: 1.25, ease: "power2.in" }, "<0.15")
        .to(out, { autoAlpha: 0, scale: 1.03, duration: 0.55, ease: "power1.in" }, "-=0.55")
        .call(() => {
          card.classList.remove("is-dissolving");
          body.style.filter = "";
          gsap.set(out, { clearProps: "scale" });
          gsap.set(card, { clearProps: "--hole" });
        });

      // the next review surfaces with a staggered reveal while the last ripples fade
      tl.fromTo(
        inn,
        { autoAlpha: 0, y: 36, z: -90, rotationX: 14, scale: 0.94, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, z: 0, rotationX: 0, scale: 1, filter: "blur(0px)", duration: 1.15, ease: "expo.out", clearProps: "filter,z,rotationX" },
        "-=0.75",
      ).from(inn.querySelectorAll("[data-review-stagger]"), { y: 12, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }, "<0.15");
    },
    [filterId, schedule],
  );

  useEffect(() => {
    goRef.current = go;
  }, [go]);

  // Run / idle the auto-advance with visibility, hover/focus and the pause toggle. A paused dwell
  // resumes where it stopped; a transition in flight schedules the next dwell itself.
  useEffect(() => {
    runningRef.current = running;
    if (!running) {
      timer.current?.pause();
      return;
    }
    if (transition.current?.isActive()) return;
    if (timer.current && timer.current.progress() < 1) timer.current.resume();
    else schedule();
  }, [running, schedule]);

  useEffect(() => () => {
    timer.current?.kill();
    transition.current?.kill();
  }, []);

  // Gentle float, paused while off-screen.
  const floatTween = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    if (reduced || !float.current) return;
    floatTween.current = gsap.to(float.current, { y: -9, rotation: 0.35, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    return () => {
      floatTween.current?.kill();
      floatTween.current = null;
    };
  }, [reduced]);
  useEffect(() => {
    floatTween.current?.[active ? "resume" : "pause"]();
  }, [active]);

  // Mouse-responsive parallax and a reflection that follows the light.
  useEffect(() => {
    const el = tilt.current;
    if (!el || reduced || !window.matchMedia("(hover: hover)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 1.1, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 1.1, ease: "power3.out" });
    const tx = gsap.quickTo(el, "x", { duration: 1.3, ease: "power3.out" });
    const ty = gsap.quickTo(el, "y", { duration: 1.3, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      rx(-ny * 6);
      ry(nx * 9);
      tx(nx * 12);
      ty(ny * 8);
      el.style.setProperty("--glint-x", `${50 + nx * 40}%`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);

  const step = (dir: 1 | -1) => go((current.current + dir + reviews.length) % reviews.length);

  if (reviews.length === 0) return null;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Upwork client reviews"
      className="relative [perspective:1200px]"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      {/* shared liquid-refraction filter, animated during a dissolve */}
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap ref={displace} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div ref={float} className="will-change-transform">
        <div ref={tilt} className="relative [transform-style:preserve-3d]">
          {/* soft shadow cast onto the room */}
          <div aria-hidden className="absolute inset-x-6 -bottom-5 top-8 rounded-3xl bg-black/60 blur-2xl [transform:translateZ(-50px)]" />
          <div className="grid" aria-live={running ? "off" : "polite"}>
            {reviews.map((r, i) => (
              <div
                key={r.id}
                ref={(el) => {
                  slides.current[i] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`Review ${i + 1} of ${reviews.length}`}
                aria-hidden={i !== index}
                className={`relative [grid-area:1/1] ${i === 0 ? "" : "invisible opacity-0"}`}
              >
                <figure data-review-card className="review-glass relative overflow-hidden rounded-[22px] p-5">
                  <div data-review-body>
                    <div data-review-stagger className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-faint">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                          <path d={siUpwork.path} fill={`#${siUpwork.hex}`} />
                        </svg>
                        Upwork review
                      </span>
                      <span className="flex items-center gap-1.5 font-display text-[13px] text-gold-bright">
                        {r.rating.toFixed(1)} <Stars rating={r.rating} label={`Client rating: ${r.rating} out of 5`} size="sm" />
                      </span>
                    </div>
                    <blockquote data-review-stagger className="mt-3.5 text-[13.5px] leading-relaxed text-text/90">
                      <Quote className="mr-1.5 inline h-3.5 w-3.5 -translate-y-1 text-gold" aria-hidden />
                      {r.quote}
                    </blockquote>
                    <figcaption data-review-stagger className="mt-4 border-t border-white/10 pt-3">
                      <p className="text-[11.5px] leading-snug text-muted">{r.engagement}</p>
                      <p className="mt-1 text-[11px] text-faint">
                        {r.author} · Completed contract{r.period ? ` · ${r.period}` : ""}
                      </p>
                    </figcaption>
                  </div>
                  {/* reflections: a fixed top glint and one that follows the pointer */}
                  <span aria-hidden className="review-glint pointer-events-none absolute inset-0 rounded-[inherit]" />
                </figure>
                {/* droplet, splash and ripples — sit over the card, outside its dissolve mask */}
                <svg aria-hidden viewBox="-150 -100 300 200" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                  <defs>
                    <radialGradient id={`drop-${uid}-${i}`} cx="0.38" cy="0.32" r="0.7">
                      <stop offset="0" stopColor="#fffdf6" />
                      <stop offset="0.45" style={{ stopColor: "rgb(var(--a-100))" }} stopOpacity="0.8" />
                      <stop offset="1" style={{ stopColor: "rgb(var(--a-300))" }} stopOpacity="0.15" />
                    </radialGradient>
                  </defs>
                  <circle data-splash cx="0" cy="0" r="0" fill={`url(#drop-${uid}-${i})`} opacity="0" />
                  {Array.from({ length: RINGS }, (_, k) => (
                    <circle key={k} data-ring cx="0" cy="0" r="0" fill="none" stroke="#fff6e2" strokeOpacity={0.9 - k * 0.15} opacity="0" style={{ filter: "drop-shadow(0 0 3px rgb(var(--a-glow)/0.8))" }} />
                  ))}
                  <ellipse data-drop cx="0" cy="-150" rx="4.5" ry="5.5" fill={`url(#drop-${uid}-${i})`} opacity="0" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show review ${i + 1} of ${reviews.length}`}
                aria-current={i === index}
                className="group grid h-6 place-items-center px-0.5"
              >
                <span className={`block h-[3px] rounded-full transition-all duration-500 ${i === index ? "w-7 bg-gold-bright shadow-[0_0_10px_rgb(var(--a-glow)/0.8)]" : "w-3 bg-white/20 group-hover:bg-white/40"}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {!reduced && (
              <button type="button" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? "Resume review rotation" : "Pause review rotation"} className="review-ctl">
                {userPaused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
              </button>
            )}
            <button type="button" onClick={() => step(-1)} aria-label="Previous review" className="review-ctl">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next review" className="review-ctl">
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
