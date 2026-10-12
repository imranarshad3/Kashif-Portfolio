"use client";

import dynamic from "next/dynamic";
import { ArrowRight, FileDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SceneControl } from "../three/OfficeScene";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { gsap } from "@/lib/gsap";
import { useGsap, useInViewport, useIsDesktop, useMediaQuery, useReducedMotion, useWebGL } from "@/lib/hooks";
import { Stars } from "../ui/Stars";
import { countUp, goldSweep } from "../ui/reveal";
import { introWillPlay, onIntroDone } from "@/lib/intro";
import { HERO_PENDING } from "@/lib/heroPrepaint";
import { HeroPortrait, HeroPortraitBadge } from "../ui/HeroPortrait";

const OfficeScene = dynamic(() => import("../three/OfficeScene"), { ssr: false });

const stack = ["Python", "Node.js", "React", "Next.js", "PostgreSQL", "AWS"];


function SceneFallback() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_55%,rgba(232,150,80,0.28),transparent_55%),radial-gradient(ellipse_at_40%_30%,rgba(120,60,70,0.25),transparent_60%)]" />
      <div className="absolute bottom-[22%] right-[12%] h-[38%] w-[34%] rounded-lg border border-white/10 bg-[linear-gradient(160deg,#141826,#0b0d13)] shadow-[0_0_80px_rgba(120,140,255,0.15)]" />
    </div>
  );
}

const WELCOME = "WELCOME TO MY DIGITAL WORLD";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const control = useRef<SceneControl>({ progress: 0, pointer: { x: 0, y: 0 }, fly: false, portrait: false });
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const portraitColumn = useMediaQuery("(min-width: 1280px)") && !!profile.photo;

  useEffect(() => {
    control.current.portrait = portraitColumn;
  }, [portraitColumn]);
  const webgl = useWebGL();
  const inView = useInViewport(root);
  // The scene fades in over the placeholder only once its first frames are drawn (no black frame).
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  // Behind the landing curtain the scene only warms up; it runs once the curtain opens.
  const [curtainOpen, setCurtainOpen] = useState(false);
  useEffect(() => onIntroDone(() => setCurtainOpen(true)), []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      control.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      control.current.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useGsap(root, () => {
    // Entrance elements were hidden before first paint (see heroPrepaint). Un-hide them before the
    // `from` tweens below record their end state; they re-hide them in this same frame.
    document.documentElement.classList.remove(HERO_PENDING);
    const mm = gsap.matchMedia();
    mm.add(
      { full: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" },
      (ctx) => {
        const { full, desktop } = ctx.conditions as { full: boolean; desktop: boolean };
        if (!full) {
          gsap.set("[data-hero-line], [data-hero-fade]", { clearProps: "all" });
          return;
        }
        // With the landing intro playing, the hero's entrance waits for the curtain to open.
        const waiting = introWillPlay();
        const intro = gsap.timeline({ defaults: { ease: "power4.out" }, delay: waiting ? 0 : 0.15, paused: waiting });
        const stopWaiting = onIntroDone(() => intro.play());
        intro
          .from("[data-hero-line]", { yPercent: 115, rotate: 2, duration: 1.2, stagger: 0.12 })
          .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.7")
          .from("[data-hero-panel]", { opacity: 0, y: 40, rotateX: 12, duration: 1.1 }, "-=0.8");
        // Portrait: the arch opens upward, the photo settles, then the gold rim light traces round it
        if (root.current!.querySelector("[data-portrait]")) {
          intro
            .fromTo("[data-portrait]", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 22px 22px)", y: 40 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", y: 0, duration: 1.5, ease: "expo.out" }, 0.55)
            .fromTo("[data-portrait-photo] img", { scale: 1.18, filter: "brightness(0.6)" }, { scale: 1, filter: "brightness(1)", duration: 2, ease: "power3.out" }, 0.6)
            .fromTo("[data-portrait-rim]", { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: 1.6, ease: "power2.inOut" }, 1.1);
        }
        gsap.utils.toArray<HTMLElement>("[data-countup]", root.current).forEach((el, i) => {
          const c = countUp(el);
          if (c) intro.add(c, 0.9 + i * 0.12);
        });
        const sweep = goldSweep(root.current!.querySelector("h1")!);
        if (sweep) intro.add(sweep, 0.9);

        // One scrubbed timeline drives the camera, the copy/panel exit and — on desktop —
        // the flight into the monitor, which dissolves into the About section.
        control.current.fly = desktop;
        const scroll = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: desktop ? "+=240%" : "bottom top",
            pin: desktop,
            scrub: 0.6,
            onUpdate: (self) => {
              control.current.progress = self.progress;
            },
          },
        });
        if (desktop) {
          // Welcome: types itself once the camera is inside the screen; reverses on the way back.
          const welcome = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
          const chars = gsap.utils.toArray<HTMLElement>("[data-welcome-char]", root.current!);
          welcome
            .to("[data-welcome]", { autoAlpha: 1, duration: 0.5 }, 0)
            .fromTo("[data-welcome-glow]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 }, 0);
          chars.forEach((c, i) => welcome.set(c, { display: "inline" }, 0.35 + i * 0.06));
          const typed = 0.35 + chars.length * 0.06;
          welcome
            .fromTo("[data-welcome-sub]", { opacity: 0, y: 12, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 }, typed + 0.15)
            .fromTo("[data-welcome-rule]", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "expo.out" }, typed + 0.1);
          const sweep = goldSweep(root.current!.querySelector("[data-welcome-sub]")!);
          if (sweep) welcome.add(sweep, typed + 0.6);
          let welcomeOn = false;
          scroll.eventCallback("onUpdate", () => {
            // timeline progress tracks the scrubbed scroll position (and survives teardown,
            // unlike scroll.scrollTrigger, which is null once the context reverts)
            const on = scroll.progress() >= 0.72;
            if (on === welcomeOn) return;
            welcomeOn = on;
            if (on) welcome.timeScale(1).play();
            else welcome.timeScale(1.6).reverse();
          });

          scroll
            .to("[data-hero-copy]", { yPercent: -18, opacity: 0, duration: 0.28 }, 0)
            // the portrait column recedes into the room as the camera pushes in
            .to("[data-portrait-column]", { yPercent: -10, z: -180, rotateY: 16, opacity: 0, duration: 0.28 }, 0.02)
            .to("[data-hero-scrollcue]", { opacity: 0, duration: 0.1 }, 0)
            // as the screen fills the frame its light becomes a warm veil (code stays faintly visible)
            .fromTo("[data-hero-veil]", { opacity: 0 }, { opacity: 0.93, duration: 0.1, ease: "power1.in" }, 0.64)
            .set({}, {}, 1); // keep the timeline exactly 1 long so positions match scroll progress
        } else {
          scroll
            .to("[data-hero-copy]", { yPercent: -18, opacity: 0, duration: 0.85 }, 0)
            .to("[data-portrait-column]", { y: -80, opacity: 0, duration: 0.8 }, 0)
            .to({}, { duration: 0.15 });
        }
        return () => {
          control.current.fly = false;
          stopWaiting();
        };
      },
    );
  });

  return (
    <section id="home" ref={root} aria-label="Introduction" className="relative h-svh min-h-[640px] overflow-hidden bg-ink">
      {/* 3D workspace */}
      <div className="absolute inset-0">
        {!sceneReady && <SceneFallback />}
        {webgl && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ease-out ${sceneReady ? "opacity-100" : "opacity-0"}`}>
            <OfficeScene control={control} reduced={reduced} lowPower={!isDesktop} active={inView && curtainOpen} onReady={onSceneReady} />
          </div>
        )}
      </div>
      {/* Legibility gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,8,0.94)_0%,rgba(6,6,8,0.75)_32%,rgba(6,6,8,0.1)_62%,transparent_80%)] max-lg:bg-[linear-gradient(180deg,rgba(6,6,8,0.55)_0%,rgba(6,6,8,0.82)_55%,rgba(6,6,8,0.95)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      {/* end of the monitor flight: screen glow → page background (desktop) */}
      {/* end of the monitor flight: the screen's light becomes a warm veil (desktop) */}
      <div
        aria-hidden
        data-hero-veil
        className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,#221b11_0%,#0d0b09_45%,#060608_80%)] opacity-0"
      />
      {/* welcome, typed once the camera is inside the screen (desktop flight only) */}
      <div data-welcome aria-hidden className="pointer-events-none invisible absolute inset-0 z-30 flex items-center justify-center px-10 opacity-0">
        <div data-welcome-glow className="absolute left-1/2 top-1/2 h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgb(var(--a-glow)/0.16),transparent_65%)]" />
        <div className="relative text-center">
          <p className="font-display text-[clamp(1.8rem,3.6vw,3.4rem)] font-semibold leading-[1.15] tracking-[0.12em] text-text">
            {WELCOME.split(" ").map((word, wi, words) => (
              <span key={wi}>
                <span className="inline-block whitespace-nowrap">
                  {[...word].map((ch, ci) => (
                    <span key={ci} data-welcome-char className={`hidden ${wi >= 3 ? "text-gold-gradient" : ""}`}>
                      {ch}
                    </span>
                  ))}
                </span>
                {wi < words.length - 1 && (
                  <span data-welcome-char className="hidden">
                    {" "}
                  </span>
                )}
              </span>
            ))}
            <span className="welcome-cursor ml-1 inline-block h-[0.82em] w-[3px] translate-y-[0.08em] bg-gold-bright shadow-[0_0_14px_rgb(var(--a-200)/0.9)]" />
          </p>
          <div data-welcome-rule className="mx-auto mt-6 h-px w-48 origin-center bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p data-welcome-sub className="mt-5 font-script text-[clamp(1.8rem,3vw,2.6rem)] opacity-0">
            <span className="text-gold-gradient">Where Ideas Become Reality.</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-16 sm:px-6 lg:px-10">
        <div data-hero-copy className="max-w-xl">
          <div data-hero-fade className="flex items-center gap-4">
            {profile.photoBadge && <HeroPortraitBadge src={profile.photoBadge} />}
            <p className="eyebrow">
              {profile.title} · {profile.positioning}
            </p>
          </div>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,6.4vw,5rem)] font-semibold leading-[1.02] tracking-[-0.02em]">
            {["Turning", "Ideas Into"].map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">
                  {line}
                </span>
              </span>
            ))}
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="text-gold-gradient block">
                Real Products
              </span>
            </span>
          </h1>
          <p data-hero-fade className="mt-6 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
            {profile.intro}
          </p>
          <p data-hero-fade className="mt-4 flex flex-wrap gap-x-2 text-[13px] text-faint">
            {stack.map((s, i) => (
              <span key={s} className={i === 0 ? "text-gold-bright" : ""}>
                {s}
                {i < stack.length - 1 && <span className="ml-2 text-faint/60">·</span>}
              </span>
            ))}
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn-gold">
              View My Work <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a href={profile.upworkUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Message on Upwork
            </a>
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} className="btn-ghost" download>
                <FileDown className="h-4 w-4" aria-hidden /> Resume
              </a>
            )}
          </div>

          <dl data-hero-fade className="mt-10 grid max-w-md grid-cols-3 border-t border-white/10 pt-6 [&>div+div]:border-l [&>div+div]:border-white/10 [&>div+div]:pl-4 sm:[&>div+div]:pl-6 [&>div]:pr-3">
            <div>
              <dt className="sr-only">Professional engineering since</dt>
              <dd className="font-display text-2xl text-text tabular-nums">
                <span data-countup data-from="2016">2022</span>
              </dd>
              <dd className="mt-1 text-[11px] leading-tight text-faint">Engineering professionally since</dd>
            </div>
            <div>
              <dt className="sr-only">Featured products</dt>
              <dd className="font-display text-2xl text-text tabular-nums">
                <span data-countup>{projects.length}</span>
              </dd>
              <dd className="mt-1 text-[11px] leading-tight text-faint">Featured products & platforms</dd>
            </div>
            <div>
              <dt className="sr-only">Upwork client rating</dt>
              <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-2xl text-text">
                <span data-countup className="tabular-nums">5.0</span> <Stars rating={5} label="Client rating: 5 out of 5" size="sm" />
              </dd>
              <dd className="mt-1 text-[11px] leading-tight text-faint">From 2 completed Upwork reviews</dd>
            </div>
          </dl>
        </div>

        {/* Floating capability panel */}
        {profile.photo && <HeroPortrait src={profile.photo} />}

        {/* wrapper fades on scroll; the link inside fades in with the intro (separate opacity owners) */}
        <div data-hero-scrollcue className="absolute bottom-8 left-4 sm:left-6 lg:left-10 [@media(max-height:820px)]:hidden">
          <a href="#about" data-hero-fade className="flex items-center gap-3 text-[12px] text-muted">
            <span className="relative flex h-9 w-5 justify-center rounded-full border border-white/25 pt-1.5">
              <span className="animate-scroll-dot h-1.5 w-1 rounded-full bg-gold-bright" />
            </span>
            Scroll to explore
          </a>
        </div>
      </div>
    </section>
  );
}
