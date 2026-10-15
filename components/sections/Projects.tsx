"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, ViewTransition } from "react";
import { markMorph } from "@/lib/transition";
import { shotName } from "@/lib/shotName";
import { categoryLabels, projectCategories, projects, type Project, type ProjectCategory } from "@/content/projects";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { useGsap, useIsDesktop, useReducedMotion } from "@/lib/hooks";
import { SectionHeading } from "../ui/SectionHeading";
import { ProjectVisual } from "../ui/ProjectVisual";
import { Stars } from "../ui/Stars";
import { revealGroups } from "../ui/reveal";
import { setAmbientAccent } from "../AmbientLight";

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      data-card
      className="group relative w-[82vw] max-w-[440px] shrink-0 snap-center [transform-style:preserve-3d] sm:w-[420px] lg:w-[400px] 2xl:w-[440px]"
      aria-labelledby={`p-${project.slug}`}
    >
      <div data-card-body className="glass-frost relative overflow-hidden rounded-[22px] p-2.5 transition-[translate,border-color,box-shadow] duration-500 group-hover:-translate-y-1.5 group-hover:border-gold/40 group-hover:shadow-[inset_0_1px_0_rgb(var(--a-100)/0.4),0_30px_60px_-24px_rgba(0,0,0,0.95),0_0_44px_-14px_rgb(var(--a-glow)/0.45)]">
        {/* warm light catching the bottom edge of the glass */}
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--a-200))] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        {/* screen frame */}
        <ViewTransition name={shotName(project.slug)} share="morph" default="none">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] border border-white/10 bg-black">
            <ProjectVisual project={project} sizes="(min-width: 640px) 440px, 82vw" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-gold-bright">
              {project.experienceLabel}
            </span>
          </div>
        </ViewTransition>
        <div className="px-3 pb-3 pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-faint">{project.domain}</p>
              <h3 id={`p-${project.slug}`} className="mt-1.5 font-display text-xl text-text">
                {project.name}
              </h3>
            </div>
            {project.reviewId && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/25 bg-gold/5 px-2.5 py-1 text-[12px] text-gold-bright">
                5.0 <Stars rating={5} label="Client rating: 5 out of 5" size="sm" />
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{project.tagline}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.stack.slice(0, 4).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
            {project.stack.length > 4 && <li className="chip">+{project.stack.length - 4}</li>}
          </ul>
          <Link
            href={`/projects/${project.slug}`}
            prefetch
            onClick={() => markMorph(project.slug)}
            className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-gold-bright after:absolute after:inset-0 after:content-['']"
          >
            View case study <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const pinArea = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const pinned = isDesktop && !reduced;

  const visible = useMemo(() => (filter === "all" ? projects : projects.filter((p) => p.categories.includes(filter))), [filter]);
  const [active, setActive] = useState(0);
  const bar = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(-1);

  /**
   * `pos` is the showcase position in card units (0 … n-1). The card at `pos` comes forward;
   * neighbours recede by distance. Also drives the counter, progress bar and ambient tint.
   */
  const focusAt = useCallback(
    (pos: number) => {
      const cards = track.current ? gsap.utils.toArray<HTMLElement>("[data-card-body]", track.current) : [];
      const n = cards.length;
      if (!n) return;
      if (!reduced) {
        cards.forEach((c, i) => {
          const t = Math.min(1, Math.abs(i - pos));
          gsap.set(c, { scale: 1 - 0.065 * t, opacity: 1 - 0.38 * t, transformOrigin: "50% 60%" });
        });
      }
      if (bar.current) bar.current.style.transform = `scaleX(${n > 1 ? pos / (n - 1) : 1})`;
      const idx = Math.max(0, Math.min(n - 1, Math.round(pos)));
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
        const accent = visible[idx]?.accent;
        if (accent) setAmbientAccent(accent);
      }
    },
    [reduced, visible],
  );

  // Swipe carousel (mobile / reduced motion): derive position from horizontal scroll
  useEffect(() => {
    const vp = viewport.current;
    if (!vp || pinned) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const card = vp.querySelector<HTMLElement>("[data-card]");
      const stepPx = (card?.offsetWidth ?? 1) + 24;
      const max = vp.scrollWidth - vp.clientWidth;
      const n = visible.length;
      const pos = max > 0 ? (vp.scrollLeft / max) * (n - 1) : vp.scrollLeft / stepPx;
      focusAt(pos);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    vp.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      vp.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pinned, visible, focusAt]);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => revealGroups(root.current!));
  });

  // Horizontal, scroll-scrubbed showcase (desktop, full motion only)
  useGsap(
    root,
    () => {
      trigger.current = null;
      activeRef.current = -1; // new deck: let the counter and tint re-sync
      const tr = track.current;
      const vp = viewport.current;
      if (!tr || !vp) return;
      const distance = () => Math.max(0, tr.scrollWidth - vp.clientWidth);
      if (pinned && distance() > 0) {
        // onUpdate can fire during creation (initial scrub render), before `tween` is assigned
        let created: gsap.core.Tween | null = null;
        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinArea.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            if (created) focusAt(created.progress() * (visible.length - 1));
          },
        });
        created = tween;
        focusAt(0);
        trigger.current = tween.scrollTrigger ?? null;
        gsap.utils.toArray<HTMLElement>("[data-card]", tr).forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: -22, z: -90, opacity: 0.55 },
            {
              rotateY: 0,
              z: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center 60%", scrub: true },
            },
          );
        });
      } else if (!reduced) {
        gsap.from("[data-card]", {
          y: 60,
          opacity: 0,
          rotateX: -12,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: vp, start: "top 85%", toggleActions: "play none none reverse" },
        });
      }
      ScrollTrigger.sort();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    [filter, pinned, reduced, focusAt],
  );

  const step = (dir: 1 | -1) => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const card = tr.querySelector<HTMLElement>("[data-card]");
    const cardWidth = (card?.offsetWidth ?? 400) + 24;
    const st = trigger.current;
    if (st) {
      const distance = st.end - st.start;
      const total = Math.max(1, tr.scrollWidth - vp.clientWidth);
      const target = Math.min(st.end, Math.max(st.start, window.scrollY + dir * (cardWidth / total) * distance));
      scrollToTarget(target, { duration: 0.7 });
    } else {
      vp.scrollBy({ left: dir * cardWidth, behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <section id="projects" ref={root} aria-labelledby="projects-title" className="relative">
      <div ref={pinArea} className="relative flex min-h-svh flex-col justify-center overflow-hidden pb-24 pt-28 lg:pb-6 lg:pt-24 short:pt-[88px]">
        <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 h-[460px] w-[460px] rounded-full bg-gold/10 blur-[140px]" />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="projects-title"
              index="04"
              label="PROJECTS"
              eyebrow="Featured work"
              title={
                <>
                  Building Products <span className="text-gold-gradient">That Matter</span>
                </>
              }
              description="A selection of products I've engineered across FinTech, SaaS and AI — each with the role I played and what I built."
            />
            <div className="flex flex-col gap-5 lg:max-w-[560px] lg:items-end">
            <div role="group" aria-label="Filter projects by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
              {(["all", ...projectCategories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[12px] transition-colors ${
                    filter === c ? "border-gold/60 bg-gradient-to-b from-[rgb(var(--a-100))] to-[rgb(var(--a-400))] font-semibold text-[#1a1206]" : "border-white/10 text-muted hover:text-text"
                  }`}
                >
                  {c === "all" ? "All" : categoryLabels[c]}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <div aria-hidden className="flex items-center gap-4">
                <p className="font-display text-[15px] tabular-nums text-text">
                  <span className="text-gold-bright">{String(active + 1).padStart(2, "0")}</span>
                  <span className="mx-1.5 text-faint">/</span>
                  <span className="text-faint">{String(visible.length).padStart(2, "0")}</span>
                </p>
                <span className="relative h-px w-24 overflow-hidden bg-white/10 sm:w-32">
                  <span ref={bar} className="absolute inset-0 origin-left bg-gradient-to-r from-gold-deep to-gold-bright" style={{ transform: "scaleX(0)" }} />
                </span>
                <p className="hidden max-w-40 truncate text-[12px] text-muted sm:block">{visible[active]?.name}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => step(-1)} aria-label="Previous project" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-text transition-colors hover:border-gold/50 hover:text-gold-bright">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next project" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-text transition-colors hover:border-gold/50 hover:text-gold-bright">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            Showing {visible.length} of {projects.length} projects
          </p>
        </div>

        <div className="relative mt-8 lg:mt-6">
          {/* polished floor reflecting the cards */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-6 h-28 bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--a-glow)/0.14),transparent_70%)] [mask-image:linear-gradient(180deg,black,transparent)]"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-[8%] bottom-1 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />
          <div
            ref={viewport}
            className={`no-scrollbar [perspective:1600px] ${pinned ? "overflow-visible" : "snap-x snap-mandatory overflow-x-auto"}`}
          >
            <div
              ref={track}
              key={filter}
              className="flex w-max gap-6 px-4 pb-4 sm:px-6 lg:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] [transform-style:preserve-3d]"
            >
              {visible.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
