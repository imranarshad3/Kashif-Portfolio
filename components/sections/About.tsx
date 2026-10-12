"use client";

import { ArrowRight, Award, Code2, Cloud, CreditCard, GraduationCap, MapPin, Sparkles, Clock, Layers, ShieldCheck, Waypoints } from "lucide-react";
import { useEffect, useRef } from "react";
import { profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";
import { useGsap, useReducedMotion } from "@/lib/hooks";
import { PortraitPhoto } from "../ui/PortraitPhoto";
import { SectionHeading } from "../ui/SectionHeading";
import { revealGroups } from "../ui/reveal";

const orbitCards = [
  { icon: Code2, title: "Web Development", pos: "left-[0%] top-[12%]", depth: 60 },
  { icon: Sparkles, title: "AI & Automation", pos: "left-[4%] top-[50%]", depth: 90 },
  { icon: CreditCard, title: "Payments & FinTech", pos: "right-[0%] top-[22%]", depth: 70 },
  { icon: Cloud, title: "Cloud & Data", pos: "right-[2%] top-[62%]", depth: 100 },
];

const principles = [
  { icon: Layers, title: "Typed, maintainable code" },
  { icon: Waypoints, title: "Data model before UI" },
  { icon: ShieldCheck, title: "Reliable integrations" },
];

function Emblem() {
  if (profile.photo) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[24px] bg-black">
        <div data-emblem-photo className="absolute -inset-[2%]">
          <PortraitPhoto src={profile.photo} sizes="(min-width: 1024px) 300px, 55vw" position="50% 30%" />
        </div>
        {/* warm key light, a deeper base so the plaque reads, and a glass reflection */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_82%_6%,rgb(var(--a-200)/0.3),transparent_70%)] mix-blend-soft-light" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#0b0a09] via-[#0b0a09]/70 to-transparent" />
        <div aria-hidden data-emblem-sheen className="portrait-sheen pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(var(--a-100)/0.22),inset_0_0_40px_rgb(var(--a-glow)/0.12)]" />
        <p className="absolute inset-x-0 bottom-4 text-center">
          <span className="block font-display text-[13px] tracking-[0.28em] text-text">{profile.name.toUpperCase()}</span>
          <span className="mt-1 block text-[11px] tracking-[0.14em] text-gold-bright">{profile.title}</span>
        </p>
      </div>
    );
  }
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_35%,rgb(var(--a-200)/0.16),transparent_60%),linear-gradient(160deg,#17140f,#0b0a09)]">
      <svg viewBox="0 0 32 32" className="h-32 w-32 drop-shadow-[0_0_30px_rgb(var(--a-glow)/0.45)]" aria-hidden>
        <defs>
          <linearGradient id="emblem-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
            <stop offset="0.5" style={{ stopColor: "rgb(var(--a-300))" }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--a-400))" }} />
          </linearGradient>
        </defs>
        <path d="M7 3h4.2v11.4L22 3h5.2L16.4 14.2 28 29h-5.3l-9.1-11.8-2.4 2.5V29H7z" fill="url(#emblem-gold)" />
      </svg>
      <p className="absolute bottom-6 font-display text-sm tracking-[0.3em] text-muted">KASHIF SAEED</p>
    </div>
  );
}

export function About() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      revealGroups(root.current!);
      gsap.from("[data-orbit]", {
        opacity: 0,
        z: -260,
        rotateY: (i) => (i % 2 ? -40 : 40),
        rotateX: 18,
        duration: 1.3,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: stage.current, start: "top 75%", toggleActions: "play none none reverse" },
      });
      gsap.from("[data-emblem]", {
        opacity: 0,
        scale: 0.85,
        rotateY: -25,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: { trigger: stage.current, start: "top 80%", toggleActions: "play none none reverse" },
      });
      if (root.current!.querySelector("[data-emblem-photo]")) {
        gsap
          .timeline({ scrollTrigger: { trigger: stage.current, start: "top 75%", toggleActions: "play none none reverse" } })
          .fromTo("[data-emblem-photo]", { scale: 1.14, filter: "brightness(0.65)" }, { scale: 1, filter: "brightness(1)", duration: 1.8, ease: "power3.out" }, 0.2)
          .fromTo("[data-emblem-sheen]", { "--sheen": "-60%" }, { "--sheen": "160%", duration: 1.6, ease: "power2.inOut" }, 0.7);
      }
      // gentle scroll-linked rotation of the whole composition
      gsap.fromTo(
        "[data-stage-inner]",
        { rotateY: 10, rotateX: 4 },
        { rotateY: -10, rotateX: -2, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.to("[data-orbit-float]", {
        y: (i) => (i % 2 ? 10 : -10),
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.4,
      });
    });
  });

  // Mouse parallax on the floating cards
  useEffect(() => {
    if (reduced) return;
    const el = stage.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-orbit-parallax]");
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach((c) => {
        const d = Number(c.dataset.depth ?? 60) / 60;
        gsap.to(c, { x: x * 18 * d, y: y * 14 * d, duration: 0.8, ease: "power2.out" });
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <section id="about" ref={root} aria-labelledby="about-title" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-gold/10 blur-[140px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:px-10">
        <div>
          <SectionHeading
            id="about-title"
            index="02"
            label="ABOUT ME"
            eyebrow="Get to know me"
            title={
              <>
                Passionate <span className="text-gold-gradient">Problem Solver</span>
              </>
            }
          />
          <div data-reveal-group className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
            {profile.bio.map((p) => (
              <p data-reveal key={p}>
                {p}
              </p>
            ))}
            <div data-reveal className="pt-3">
              <a href="#experience" className="btn-gold">
                More About Me <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          <ul data-reveal-group className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {principles.map(({ icon: Icon, title }) => (
              <li data-reveal key={title} className="flex flex-col gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold/25 bg-gold/5">
                  <Icon className="h-5 w-5 text-gold-bright" aria-hidden />
                </span>
                <span className="text-[13px] leading-snug text-text">{title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3D composition */}
        <div ref={stage} className="relative mx-auto aspect-[1/1.02] w-full max-w-[560px] [perspective:1200px]">
          <div data-stage-inner className="absolute inset-0 [transform-style:preserve-3d]">
            {/* Marble pedestal with a gold rim */}
            <div aria-hidden className="absolute bottom-[3%] left-1/2 h-[15%] w-[62%] -translate-x-1/2">
              <div className="absolute inset-x-[4%] bottom-0 h-[62%] rounded-[50%] bg-[linear-gradient(180deg,#1c1916,#090807)] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.95)]" />
              <div className="absolute inset-x-0 top-0 h-[62%] rounded-[50%] border border-[rgb(var(--a-200))]/70 bg-[radial-gradient(ellipse_at_50%_35%,#2c2824,#121110_70%)] shadow-[0_0_30px_rgb(var(--a-glow)/0.25),inset_0_2px_10px_rgb(var(--a-100)/0.08)]" />
            </div>
            <div data-emblem className="absolute inset-x-[25%] bottom-[14%] top-[4%] [transform:translateZ(0)]">
              <div className="glass glass-blur h-full w-full rounded-t-[999px] rounded-b-[30px] p-2 shadow-[0_0_60px_-10px_rgb(var(--a-glow)/0.3),0_40px_80px_-30px_rgba(0,0,0,0.95)]">
                <Emblem />
              </div>
            </div>
            {/* Glowing orbit ring */}
            <svg aria-hidden viewBox="0 0 200 80" className="pointer-events-none absolute left-[-8%] top-[42%] w-[116%] overflow-visible [transform:rotate(-8deg)]">
              <defs>
                <linearGradient id="orbit" x1="0" x2="1">
                  <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} stopOpacity="0.9" />
                  <stop offset="0.5" style={{ stopColor: "rgb(var(--a-400))" }} stopOpacity="0.15" />
                  <stop offset="1" style={{ stopColor: "rgb(var(--a-100))" }} stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <ellipse cx="100" cy="40" rx="98" ry="22" fill="none" stroke="url(#orbit)" strokeWidth="0.6" style={{ filter: "drop-shadow(0 0 2px rgb(var(--a-glow)/0.8))" }} />
            </svg>
            {orbitCards.map(({ icon: Icon, title, pos, depth }) => (
              <div
                key={title}
                data-orbit
                className={`absolute ${pos}`}
                style={{ transform: `translateZ(${depth}px) rotateY(${pos.startsWith("left") ? 16 : -16}deg)` }}
              >
                <div data-orbit-parallax data-depth={depth}>
                  <div data-orbit-float className="glass-frost glass-hover flex w-32 items-center gap-2.5 rounded-2xl px-2.5 py-2.5 sm:w-44 sm:gap-3 sm:px-3 sm:py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-gold/25 bg-black/40 sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4 text-gold-bright sm:h-5 sm:w-5" aria-hidden />
                    </span>
                    <span className="text-[12px] leading-tight text-text sm:text-[13px]">{title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How I work + credentials */}
      <div className="mx-auto mt-24 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-10">
        <div data-reveal-group className="glass rounded-3xl p-6 sm:p-8">
          <h3 data-reveal className="font-display text-lg text-text">
            How I work
          </h3>
          <ol className="mt-6 grid gap-5 sm:grid-cols-2">
            {profile.howIWork.map((step, i) => (
              <li data-reveal key={step.title} className="flex gap-4">
                <span className="font-display text-sm text-gold">0{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-text">{step.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div data-reveal-group className="glass rounded-3xl p-6 sm:p-8">
          <h3 data-reveal className="font-display text-lg text-text">
            Credentials
          </h3>
          <ul className="mt-6 space-y-4 text-[13px]">
            <li data-reveal className="flex gap-3">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span className="text-muted">
                <span className="text-text">{profile.education.degree}</span> — {profile.education.school}, {profile.education.years}
              </span>
            </li>
            {profile.certifications.map((c) => (
              <li data-reveal key={c.name} className="flex gap-3">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span className="text-muted">
                  <span className="text-text">{c.name}</span> — {c.issuer}, {c.issued}
                </span>
              </li>
            ))}
            <li data-reveal className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span className="text-muted">{profile.location}</span>
            </li>
            <li data-reveal className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span className="text-muted">
                Available {profile.availability} · {profile.rate}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
