"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { INTRO_KEY, INTRO_SKIP_CHECK, introIsDone, introWillPlay, markIntroDone } from "@/lib/intro";
import { getLenis } from "@/lib/scroll";
import { profile } from "@/content/profile";

const K_PATH = "M7 3h4.2v11.4L22 3h5.2L16.4 14.2 28 29h-5.3l-9.1-11.8-2.4 2.5V29H7z";
const WORDS = ["Code", "Create", "Automate", "Scale"];
const noop = () => () => {};

/** Jump straight to the curtain (slightly faster) unless it is already opening. */
function skipTimeline(tl: gsap.core.Timeline | null) {
  if (!tl || tl.time() >= tl.labels.curtain) return;
  tl.seek("curtain").timeScale(1.4);
}

/**
 * ~10 second cinematic landing sequence, once per browser session on a full load of the
 * home page. Skippable (button or Escape), never shown with reduced motion. While it plays,
 * the 3D hero loads and warms up behind the curtain.
 */
export function Intro() {
  // Server render always includes the overlay (so the hero never flashes); the inline script
  // hides it before first paint when it shouldn't play, and the client snapshot removes it.
  const play = useSyncExternalStore(noop, () => introWillPlay() && !introIsDone(), () => true);
  const [finished, setFinished] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // `play` is the server snapshot (true) during hydration, so check the real decision too —
    // otherwise a skipped intro still stops scrolling and jumps a deep link back to the top.
    if (!play || !introWillPlay() || introIsDone() || !root.current) return;
    const el = root.current;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    const lenis = getLenis();
    lenis?.stop();
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const name = SplitText.create("[data-intro-name]", { type: "chars", mask: "chars" });
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setFinished(true),
      });
      tlRef.current = tl;
      tl
        // 0 – 1.2s: a hairline of light opens across the dark
        .fromTo("[data-intro-line]", { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0.2)
        // 0.9 – 3.2s: the K monogram is drawn, then filled with gold
        .fromTo("[data-intro-k-stroke]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 2, ease: "power2.inOut" }, 0.9)
        .fromTo("[data-intro-k-fill]", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.out" }, 2.4)
        .fromTo("[data-intro-k]", { scale: 0.86, filter: "drop-shadow(0 0 0px rgb(var(--a-glow)/0))" }, { scale: 1, filter: "drop-shadow(0 0 28px rgb(var(--a-glow)/0.55))", duration: 2.2, ease: "power2.out" }, 1.4)
        // 3.0 – 4.6s: name rises letter by letter
        .from(name.chars, { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.045 }, 3.0)
        // 4.3 – 5.5s: role settles out of a shuffle
        .fromTo("[data-intro-role]", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 4.3)
        .from("[data-intro-role]", { duration: 1.2, ease: "none", scrambleText: { text: "", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ·", speed: 0.5 } }, 4.3);

      // 5.4 – 8.0s: the hero's four words, one at a time, in gold script
      WORDS.forEach((_, i) => {
        const at = 5.4 + i * 0.65;
        tl.fromTo(`[data-intro-word="${i}"]`, { opacity: 0, y: 14, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35 }, at);
        if (i < WORDS.length - 1) tl.to(`[data-intro-word="${i}"]`, { opacity: 0, y: -12, filter: "blur(6px)", duration: 0.3, ease: "power2.in" }, at + 0.42);
      });

      tl
        // a quiet timer along the bottom for the whole sequence
        .fromTo("[data-intro-progress]", { scaleX: 0 }, { scaleX: 1, duration: 8.3, ease: "none" }, 0)
        // 8.0 – 8.6s: everything gathers and dims
        .addLabel("curtain", 8.0)
        .to("[data-intro-content]", { opacity: 0, scale: 1.04, filter: "blur(4px)", duration: 0.6, ease: "power2.in" }, "curtain")
        .to("[data-intro-progress-wrap], [data-intro-glow], [data-intro-skip]", { opacity: 0, duration: 0.5 }, "curtain")
        // 8.6 – 10s: the curtain parts on the hero, whose own intro starts as it opens
        .add(() => markIntroDone(), "curtain+=0.55")
        .to("[data-intro-panel='top']", { yPercent: -100, duration: 1.4, ease: "expo.inOut" }, "curtain+=0.6")
        .to("[data-intro-panel='bottom']", { yPercent: 100, duration: 1.4, ease: "expo.inOut" }, "curtain+=0.6")
        .fromTo("[data-intro-seam]", { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 0.45, ease: "power2.out" }, "curtain+=0.15")
        .to("[data-intro-seam]", { scaleX: 1.6, opacity: 0, duration: 1.0, ease: "power2.out" }, "curtain+=0.6");
    }, el);

    const skip = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipTimeline(tlRef.current);
    };
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      ctx.revert();
      markIntroDone();
      getLenis()?.start();
    };
  }, [play]);

  useEffect(() => {
    if (finished) getLenis()?.start();
  }, [finished]);

  if (!play || finished) return null;

  return (
    <div
      id="intro"
      ref={root}
      role="presentation"
      suppressHydrationWarning
      className="fixed inset-0 z-[80] overflow-hidden [&[data-skip]]:hidden"
    >
      {/* pre-paint: hide immediately for returning visitors / reduced motion / deep links */}
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `if(${INTRO_SKIP_CHECK})document.getElementById("intro").setAttribute("data-skip","")` }}
      />
      {/* curtain halves */}
      <div data-intro-panel="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-intro-panel="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div data-intro-glow aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgb(var(--a-300)/0.10),transparent_55%)]" />
      {/* seam of light where the curtain splits */}
      <div data-intro-seam aria-hidden className="absolute inset-x-0 top-1/2 h-px opacity-0">
        <div className="mx-auto h-px w-[min(80vw,900px)] bg-gradient-to-r from-transparent via-gold-bright to-transparent shadow-[0_0_14px_rgb(var(--a-glow)/0.7)]" />
      </div>

      <div data-intro-content className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <svg data-intro-k viewBox="0 0 32 32" className="h-24 w-24 sm:h-28 sm:w-28" aria-hidden>
          <defs>
            <linearGradient id="intro-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
              <stop offset="0.5" style={{ stopColor: "rgb(var(--a-300))" }} />
              <stop offset="1" style={{ stopColor: "rgb(var(--a-400))" }} />
            </linearGradient>
          </defs>
          <path data-intro-k-fill d={K_PATH} fill="url(#intro-gold)" opacity="0" />
          <path data-intro-k-stroke d={K_PATH} fill="none" style={{ stroke: "rgb(var(--a-200))" }} strokeWidth="0.35" strokeLinejoin="round" />
        </svg>

        <div
          data-intro-line
          aria-hidden
          className="mt-9 h-px w-[min(60vw,520px)] origin-center bg-gradient-to-r from-transparent via-gold-bright to-transparent shadow-[0_0_12px_rgb(var(--a-glow)/0.6)]"
        />
        <p data-intro-name className="mt-8 font-display text-[clamp(1.8rem,5vw,3.2rem)] font-semibold tracking-[0.28em] text-text">
          {profile.name.toUpperCase()}
        </p>
        <p data-intro-role className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold opacity-0 sm:text-[12px]">
          {profile.title} · {profile.positioning}
        </p>
        <div aria-hidden className="relative mt-10 h-16 w-full">
          {WORDS.map((w, i) => (
            <span
              key={w}
              data-intro-word={i}
              className="absolute inset-x-0 font-script text-[clamp(2.4rem,6vw,3.6rem)] leading-none text-gold-bright opacity-0 drop-shadow-[0_0_16px_rgb(var(--a-glow)/0.45)]"
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      <div data-intro-progress-wrap aria-hidden className="absolute inset-x-0 bottom-10 mx-auto h-px w-40 overflow-hidden bg-white/10">
        <div data-intro-progress className="h-full origin-left bg-gold-bright" />
      </div>
      <button
        type="button"
        data-intro-skip
        onClick={() => skipTimeline(tlRef.current)}
        className="absolute bottom-6 right-6 max-sm:bottom-auto max-sm:right-4 max-sm:top-5 rounded-full border border-white/15 px-4 py-2 text-[12px] text-muted transition-colors hover:border-gold/40 hover:text-gold-bright"
      >
        Skip intro
      </button>
    </div>
  );
}
