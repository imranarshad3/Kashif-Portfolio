"use client";

import Link from "next/link";
import { ArrowUpRight, Boxes, Briefcase, CalendarDays, ExternalLink } from "lucide-react";
import { useRef, useState } from "react";
import { companies, experience, type CompanyCard, type Experience } from "@/content/experience";
import { getProject, type Project } from "@/content/projects";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { GlowCard } from "../ui/GlowCard";
import { ProjectVisual } from "../ui/ProjectVisual";
import { TiltCard } from "../ui/TiltCard";
import { revealGroups } from "../ui/reveal";

/* ---------------------------------------------------------------- helpers */

/** Employers, oldest first, straight from the verified experience records. */
const employers = experience.filter((e) => e.kind === "employment").sort((a, b) => a.start.localeCompare(b.start));

/** Product contributions joined with their case studies (for screenshots, stack and links). */
const products = companies
  .filter((c) => c.relationship === "Product contribution")
  .map((c) => ({ company: c, project: c.projectSlug ? getProject(c.projectSlug) : undefined }));

// Timeline axis: Jan 2022 → Jan 2027
const AXIS_START = 2022;
const AXIS_YEARS = 5;
const toYears = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y + (m - 1) / 12;
};
const pct = (years: number) => ((years - AXIS_START) / AXIS_YEARS) * 100;

/** Engraved monogram — official logos aren't used until their use is approved. */
function Monogram({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const box = size === "lg" ? "h-14 w-14 rounded-2xl text-base" : "h-11 w-11 rounded-xl text-sm";
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 place-items-center border border-gold/35 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--a-100)/0.22),rgb(var(--a-300)/0.06)_60%,transparent)] font-display font-semibold tracking-wider text-gold-bright shadow-[inset_0_1px_0_rgb(var(--a-100)/0.35),0_10px_30px_-12px_rgb(var(--a-glow)/0.5)] ${box}`}
    >
      {initials}
    </span>
  );
}

function MagneticLink({ href, children, external = false, className = "" }: { href: string; children: React.ReactNode; external?: boolean; className?: string }) {
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/* --------------------------------------------------------------- timeline */

function TenureTimeline({ active, setActive }: { active: string | null; setActive: (id: string | null) => void }) {
  const years = Array.from({ length: AXIS_YEARS + 1 }, (_, i) => AXIS_START + i);
  return (
    <div data-tenure className="relative mt-10 select-none px-3 sm:px-4">
      {/* track */}
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-white/5 via-white/15 to-white/5" />
        {employers.map((e) => {
          const left = pct(toYears(e.start));
          const right = e.end ? pct(toYears(e.end) + 1 / 12) : 100;
          const on = active === e.id;
          return (
            <button
              key={e.id}
              type="button"
              data-tenure-bar
              onPointerEnter={() => setActive(e.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(e.id)}
              onBlur={() => setActive(null)}
              onClick={() => document.getElementById(`employer-${e.id}`)?.focus()}
              aria-label={`${e.organization}, ${e.period}`}
              className="group absolute top-1/2 h-6 -translate-y-1/2 rounded-full focus-visible:outline-offset-4"
              style={{ left: `${left}%`, width: `${right - left}%` }}
            >
              <span
                className={`absolute inset-x-0 top-1/2 block h-[5px] origin-left -translate-y-1/2 rounded-full transition-[box-shadow,filter] duration-300 ${
                  e.current ? "bg-gradient-to-r from-[rgb(var(--a-400))] via-[rgb(var(--a-200))] to-[rgb(var(--a-200))]/10" : "bg-gradient-to-r from-[rgb(var(--a-400))] via-[rgb(var(--a-300))] to-[rgb(var(--a-400))]"
                } ${on ? "shadow-[0_0_18px_rgb(var(--a-glow)/0.85)] brightness-125" : "shadow-[0_0_10px_rgb(var(--a-glow)/0.35)]"}`}
                data-bar-fill
              />
              <span
                className={`absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(var(--a-100))] bg-gold transition-transform duration-300 ${on ? "scale-125" : ""}`}
              />
              <span
                className={`absolute -top-6 left-0 whitespace-nowrap text-[11px] font-medium transition-colors max-sm:hidden ${on ? "text-gold-bright" : "text-muted"}`}
              >
                {e.organization}
              </span>
              {e.current && (
                <span className="absolute -right-1 top-1/2 flex -translate-y-1/2 translate-x-full items-center gap-1.5 pl-2 text-[10px] uppercase tracking-[0.18em] text-gold-bright max-sm:hidden">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-gold-bright/70 motion-reduce:animate-none" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-gold-bright" />
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* year ticks */}
      <div className="relative h-6">
        {years.map((y) => (
          <span key={y} data-tenure-tick className="absolute top-0 -translate-x-1/2 text-[11px] tabular-nums text-faint" style={{ left: `${pct(y)}%` }}>
            <span className="mx-auto mb-1 block h-1.5 w-px bg-white/15" />
            {y === AXIS_START + AXIS_YEARS ? "" : y}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmployerCard({ e, index, active, setActive }: { e: Experience; index: number; active: boolean; setActive: (id: string | null) => void }) {
  return (
    <li data-employer className="[perspective:1200px]">
      <TiltCard max={5} className="h-full rounded-[26px]">
        <GlowCard
          className={`glass h-full rounded-[26px] p-6 transition-[border-color,box-shadow,transform] duration-500 sm:p-7 ${
            active ? "border-gold/45! shadow-[inset_0_1px_0_rgb(var(--a-100)/0.2),0_30px_70px_-30px_rgba(0,0,0,0.95),0_0_50px_-18px_rgb(var(--a-glow)/0.5)]" : ""
          }`}
        >
          <div
            id={`employer-${e.id}`}
            tabIndex={-1}
            onPointerEnter={() => setActive(e.id)}
            onPointerLeave={() => setActive(null)}
            className="flex h-full flex-col outline-none"
          >
            {/* faint index numeral */}
            <span aria-hidden className="pointer-events-none absolute -bottom-7 right-3 font-display text-[110px] font-semibold leading-none text-white/[0.035]">
              0{index + 1}
            </span>
            <div className="flex items-start justify-between gap-3">
              <Monogram name={e.organization} size="lg" />
              <div className="flex flex-wrap justify-end gap-1.5">
                <span className="chip gap-1.5">
                  <Briefcase className="h-3 w-3 text-gold" aria-hidden /> Employment
                </span>
                {e.current && <span className="chip border-gold/40! text-gold-bright!">Current</span>}
              </div>
            </div>
            <h4 className="mt-5 font-display text-2xl leading-tight text-text">{e.organization}</h4>
            <p className="mt-1 text-[14px] font-medium text-gold">{e.role}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-faint">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {e.period}
            </p>
            <div className="my-5 h-px bg-gradient-to-r from-gold/30 via-white/10 to-transparent" />
            <p className="text-[13.5px] leading-relaxed text-muted">{e.summary}</p>
            {e.highlights.length > 0 && (
              <ul className="mt-4 space-y-2">
                {e.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                    <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold shadow-[0_0_6px_rgb(var(--a-glow)/0.8)]" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="Technologies">
              {e.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </GlowCard>
      </TiltCard>
    </li>
  );
}

/* ------------------------------------------------------------ products */

function ProductCard({ company, project, large }: { company: CompanyCard; project?: Project; large: boolean }) {
  const media = useRef<HTMLDivElement>(null);
  const onMove = (ev: React.PointerEvent<HTMLDivElement>) => {
    if (ev.pointerType !== "mouse" || !media.current) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width - 0.5;
    const y = (ev.clientY - r.top) / r.height - 0.5;
    media.current.style.setProperty("--px", `${(-x * 8).toFixed(1)}px`);
    media.current.style.setProperty("--py", `${(-y * 6).toFixed(1)}px`);
  };
  const onLeave = () => {
    media.current?.style.setProperty("--px", "0px");
    media.current?.style.setProperty("--py", "0px");
  };

  return (
    <GlowCard as="article" className={`glass-frost flex h-full flex-col rounded-[26px] p-2.5 ${large ? "" : ""}`}>
      <div data-product-card className="flex h-full flex-col" onPointerMove={onMove} onPointerLeave={onLeave}>
        {/* browser-framed screenshot */}
        <div data-product-media className="overflow-hidden rounded-[18px] border border-white/10 bg-black">
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/[0.03] px-3 py-2">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} className="h-2 w-2 rounded-full opacity-70" style={{ background: c }} />
            ))}
            <span className="ml-2 min-w-0 flex-1 truncate text-[10px] text-faint">
              {project?.url?.label ?? (project?.image ? project.domain : "Architecture overview")}
            </span>
            <span className="shrink-0 rounded-full border border-gold/25 bg-gold/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-gold-bright">
              Product contribution
            </span>
          </div>
          <div className={`relative overflow-hidden ${large ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
            <div
              ref={media}
              data-product-parallax={project?.image ? "" : undefined}
              className={`absolute transition-transform duration-700 ease-out ${
                project?.image ? "-inset-[3%] [transform:translate3d(var(--px,0px),var(--py,0px),0)] group-hover/glow:scale-[1.02]" : "inset-0"
              }`}
            >
              {project ? (
                <ProjectVisual project={project} sizes={large ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 410px, 100vw"} />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gold/10 to-transparent" />
              )}
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3.5 pb-3 pt-5">
          <div className="flex items-start gap-3">
            <Monogram name={company.name} />
            <div className="min-w-0">
              {project && <p className="text-[11px] uppercase tracking-[0.18em] text-faint">{project.domain}</p>}
              <h4 className={`mt-0.5 font-display leading-tight text-text ${large ? "text-2xl" : "text-xl"}`}>{company.name}</h4>
            </div>
          </div>
          <p className="mt-3 text-[13px] font-medium text-gold">{company.role}</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{company.summary}</p>
          {project && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
              {project.stack.slice(0, large ? 6 : 4).map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            {company.projectSlug && (
              <MagneticLink href={`/projects/${company.projectSlug}`} className="btn-gold px-4! py-2! text-[12.5px]!">
                View case study <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </MagneticLink>
            )}
            {company.url && (
              <MagneticLink external href={company.url} className="btn-ghost px-4! py-2! text-[12.5px]!">
                Live site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">(opens {company.name} in a new tab)</span>
              </MagneticLink>
            )}
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

/* ---------------------------------------------------------------- section */

export function Companies() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      revealGroups(root.current!);

      // Tenure bars draw left → right as the timeline scrolls into view (reversible)
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "[data-tenure]", start: "top 85%", end: "top 45%", scrub: 0.8 },
      });
      tl.from("[data-tenure-tick]", { opacity: 0, y: 8, stagger: 0.05, duration: 0.3 }, 0).from(
        "[data-bar-fill]",
        { scaleX: 0, stagger: 0.18, duration: 0.6, ease: "power2.out" },
        0.1,
      );

      // Employer cards rise in with depth
      gsap.from("[data-employer]", {
        y: 70,
        rotateX: -16,
        opacity: 0,
        transformOrigin: "50% 100%",
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: "[data-employers]", start: "top 82%", toggleActions: "play none none reverse" },
      });

      // Product cards: screenshot wipes up, body follows; image drifts with scroll
      gsap.utils.toArray<HTMLElement>("[data-product]").forEach((card, i) => {
        const media = card.querySelector("[data-product-media]");
        const body = card.querySelector("[data-product-card]");
        const tlc = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 86%", toggleActions: "play none none reverse" } });
        tlc
          .from(body, { y: 60, opacity: 0, duration: 1, ease: "power3.out", delay: (i % 3) * 0.08 })
          .fromTo(media, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" }, "<0.1");
        const drift = card.querySelector("[data-product-parallax]");
        if (drift)
          gsap.fromTo(
            drift,
            { yPercent: -2 },
            { yPercent: 2, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } },
          );
      });
    });
  });

  return (
    <section id="companies" ref={root} aria-labelledby="companies-title" className="relative overflow-hidden pb-28 pt-8 sm:pb-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 h-[520px] w-[520px] rounded-full bg-gold/[0.07] blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-40 h-[520px] w-[520px] rounded-full bg-gold/[0.06] blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div data-reveal-group className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p data-reveal data-scramble className="eyebrow">
              Selected collaborations
            </p>
            <h2 id="companies-title" data-split className="mt-4 font-display text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.015em]">
              Companies I&apos;ve <span className="text-gold-gradient">Worked With</span>
            </h2>
          </div>
          <p data-reveal className="max-w-md text-[15px] leading-relaxed text-muted lg:justify-self-end">
            Employers on my record, and the products I&apos;ve contributed engineering to. Product names refer to the platforms
            themselves; they don&apos;t imply a direct employment relationship with each company.
          </p>
        </div>

        {/* ------------------------------ employment */}
        <div className="mt-16">
          <div data-reveal-group className="flex items-end justify-between gap-4">
            <h3 data-reveal className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-text">
              <Briefcase className="h-4 w-4 text-gold" aria-hidden /> Employment
            </h3>
            <p data-reveal className="text-[12px] text-faint">
              {employers.length} employers · 2022 — present
            </p>
          </div>
          <TenureTimeline active={active} setActive={setActive} />
          <ol data-employers className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {employers.map((e, i) => (
              <EmployerCard key={e.id} e={e} index={i} active={active === e.id} setActive={setActive} />
            ))}
          </ol>
        </div>

        {/* ------------------------------ products */}
        <div className="mt-24">
          <div data-reveal-group className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 data-reveal className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-text">
                <Boxes className="h-4 w-4 text-gold" aria-hidden /> Products I&apos;ve contributed to
              </h3>
              <p data-reveal className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
                Engineering contributions to these platforms — not employment relationships.
              </p>
            </div>
            <p data-reveal className="text-[12px] text-faint">
              {products.length} products
            </p>
          </div>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {products.map(({ company, project }, i) => (
              <li key={company.name} data-product className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                <ProductCard company={company} project={project} large={i < 2} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
