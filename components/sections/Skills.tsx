"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CrystalControl } from "../three/CrystalScene";
import { engagementLabels, skillGroups, skills, type Skill, type SkillGroupId } from "@/content/skills";
import { getProject } from "@/content/projects";
import { gsap } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { useGsap, useInViewport, useIsDesktop, useNearViewport, useReducedMotion, useWebGL } from "@/lib/hooks";
import { SectionHeading } from "../ui/SectionHeading";
import { TechIcon } from "../ui/TechIcon";
import { revealGroups } from "../ui/reveal";

const loadCrystalScene = () => import("../three/CrystalScene");
const CrystalScene = dynamic(loadCrystalScene, { ssr: false });

const featured = skills.filter((s) => s.featured);

const usageCount = (skill: Skill) => skill.projects.length + (skill.engagements?.length ?? 0);

function SkillDetail({ skill }: { skill: Skill }) {
  const group = skillGroups.find((g) => g.id === skill.group)!;
  const linked = skill.projects.map(getProject).filter((p) => p !== undefined);
  const engagements = skill.engagements ?? [];
  return (
    <div id="skill-detail" aria-live="polite" className="glass flex h-full flex-col rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/25 bg-black/40">
          <TechIcon skill={skill} className="h-8 w-8" />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-faint">{group.label}</p>
          <p className="font-display text-2xl text-text">{skill.name}</p>
        </div>
      </div>
      <div className="mt-6 flex-1">
        {linked.length > 0 || engagements.length > 0 ? (
          <>
            <p className="text-[12px] uppercase tracking-[0.18em] text-faint">Where I&apos;ve used it</p>
            <ul className="scroll-gold mt-3 max-h-72 space-y-2 lg:max-h-[320px] overflow-y-auto pr-1">
              {linked.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-gold/30"
                  >
                    <span>
                      <span className="block text-sm text-text">{p.name}</span>
                      <span className="block text-[12px] text-faint">{p.experienceLabel}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-faint transition-colors group-hover:text-gold-bright" aria-hidden />
                  </Link>
                </li>
              ))}
              {engagements.map((e) => (
                <li key={e} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="block text-sm text-text">{engagementLabels[e]}</span>
                  <span className="block text-[12px] text-faint">Upwork engagement</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            Part of my day-to-day toolkit across full-stack and SaaS work.
          </p>
        )}
      </div>
    </div>
  );
}

export function Skills() {
  const root = useRef<HTMLElement>(null);
  const crystalWrap = useRef<HTMLDivElement>(null);
  const control = useRef<CrystalControl>({ progress: 0, pointer: { x: 0, y: 0 }, pulse: 0 });
  const [selected, setSelected] = useState("Python");
  const [group, setGroup] = useState<SkillGroupId | "featured">("featured");
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const webgl = useWebGL();
  // mount (and warm up) well before the stage arrives, never in the frames it scrolls into view
  const near = useNearViewport(crystalWrap, "150% 0px");
  const inView = useInViewport(crystalWrap);

  const tiles = useMemo(() => (group === "featured" ? featured : skills.filter((s) => s.group === group)), [group]);
  const selectedSkill = skills.find((s) => s.name === selected) ?? skills[0];

  const select = (name: string) => {
    setSelected(name);
    control.current.pulse += 1;
  };

  // Fetch the scene's code while the page is idle, so mounting it later never waits on the network.
  useEffect(() => {
    if (!webgl) return;
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => void loadCrystalScene(), { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => void loadCrystalScene(), 2500);
    return () => clearTimeout(id);
  }, [webgl]);

  useEffect(() => {
    if (reduced) return;
    const el = crystalWrap.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      control.current.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      control.current.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      control.current.pointer.x = 0;
      control.current.pointer.y = 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      revealGroups(root.current!);
      gsap.to(control.current, {
        progress: 1,
        ease: "none",
        scrollTrigger: { trigger: "[data-skill-stage]", start: "top 95%", end: "center 55%", scrub: 0.8 },
      });
      // the backlit frame drifts slower than the page for a little depth
      gsap.fromTo(
        "[data-stage-backdrop]",
        { yPercent: 8 },
        { yPercent: -6, ease: "none", scrollTrigger: { trigger: "[data-skill-stage]", start: "top bottom", end: "bottom top", scrub: true } },
      );
      // The tile wall tilts back and flattens as it scrolls into place
      gsap.fromTo(
        "[data-tile-wall]",
        { rotateX: 28, y: 60, opacity: 0.2 },
        { rotateX: 0, y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: "[data-tile-wall]", start: "top bottom", end: "top 45%", scrub: true } },
      );
    });
  });

  // Animate tiles whenever the visible set changes
  useGsap(
    root,
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-tile]",
        { opacity: 0, rotateY: -35, z: -80 },
        { opacity: 1, rotateY: 0, z: 0, duration: 0.7, ease: "power3.out", stagger: 0.035 },
      );
    },
    [group],
  );

  return (
    <section id="skills" ref={root} aria-labelledby="skills-title" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-6">
          <div className="relative z-10">
            <SectionHeading
              id="skills-title"
              index="03"
              label="SKILLS"
              eyebrow="Technologies I work with"
              title={
                <>
                  Modern Tools for <span className="text-gold-gradient">Modern Solutions</span>
                </>
              }
              description="Python-first on the backend, React and Next.js on the frontend, with the data, cloud, payments and AI layers that turn an app into a product. Pick a technology to see where I've used it."
            />
            <div data-reveal-group className="mt-8 flex flex-wrap items-center gap-4">
              <button data-reveal type="button" className="btn-gold" onClick={() => scrollToTarget("skill-explorer", { offset: -104 })}>
                View All Skills <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <p data-reveal className="text-[12px] leading-snug text-faint">
                <span data-countup>{skills.length}</span> technologies
                <br />
                Hover or tap a card to explore
              </p>
            </div>
          </div>

          <div ref={crystalWrap} data-skill-stage className="relative h-[430px] sm:h-[520px] lg:h-[640px]">
            {/* backlit stage: warm bloom + thin gold frame, like the reference */}
            <div aria-hidden data-stage-backdrop className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[46%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--a-glow)/0.22),rgb(var(--a-glow)/0.06)_45%,transparent_70%)] blur-2xl" />
              <div className="absolute inset-x-[16%] bottom-[14%] top-[6%] rounded-t-[999px] border border-b-0 border-gold/20 shadow-[inset_0_1px_0_rgb(var(--a-200)/0.25),0_0_60px_-20px_rgb(var(--a-glow)/0.45)] [mask-image:linear-gradient(180deg,black_55%,transparent)]" />
            </div>
            <div aria-hidden className="absolute inset-0">
              {webgl && near ? (
                <CrystalScene
                  control={control}
                  reduced={reduced}
                  lowPower={!isDesktop}
                  active={inView}
                  skills={tiles}
                  selected={selectedSkill.name}
                  onSelect={select}
                />
              ) : (
                <div className="absolute left-1/2 top-1/2 h-40 w-28 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/30 to-transparent" />
              )}
            </div>
            {/* current selection */}
            <div className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center px-4 lg:bottom-0">
              <div className="glass pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-2 pr-4 text-left" aria-live="polite">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-black/50">
                  <TechIcon skill={selectedSkill} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-text">{selectedSkill.name}</span>
                  <span className="block truncate text-[11px] text-faint">
                    {skillGroups.find((g) => g.id === selectedSkill.group)?.label}
                    {usageCount(selectedSkill) > 0 && ` · used in ${usageCount(selectedSkill)} ${usageCount(selectedSkill) === 1 ? "project" : "projects"}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => scrollToTarget("skill-detail", { offset: -120 })}
                  className="ml-1 rounded-full border border-gold/30 px-3 py-1 text-[11px] text-gold-bright transition-colors hover:bg-gold/10"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Explorer */}
        <div id="skill-explorer" className="mt-16 scroll-mt-28">
          <div role="group" aria-label="Skill groups" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {[{ id: "featured" as const, label: "Core stack" }, ...skillGroups].map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={group === g.id}
                onClick={() => setGroup(g.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12px] transition-colors ${
                  group === g.id ? "border-gold/50 bg-gold/15 text-gold-bright" : "border-white/10 text-muted hover:text-text"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="relative pb-6 [perspective:1400px]">
              {/* backlit frame behind the wall */}
              <div aria-hidden className="pointer-events-none absolute -inset-x-2 -top-3 bottom-8 rounded-[28px] border border-gold/15 shadow-[inset_0_1px_0_rgb(var(--a-200)/0.25),0_0_80px_-30px_rgb(var(--a-glow)/0.45)]" />
              <ul data-tile-wall aria-label="Technologies" className="grid grid-cols-3 gap-3 [transform-origin:50%_100%] [transform-style:preserve-3d] sm:grid-cols-4 sm:gap-4">
                {tiles.map((s) => {
                  const active = s.name === selectedSkill.name;
                  return (
                    <li key={s.name} data-tile className="[transform-style:preserve-3d]">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => select(s.name)}
                        className={`glass-frost group relative flex aspect-[1/0.92] w-full flex-col items-center justify-center gap-3 rounded-2xl p-3 text-center transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-gold/45 ${
                          active ? "border-gold/70! shadow-[inset_0_1px_0_rgb(var(--a-100)/0.4),0_0_32px_-10px_rgb(var(--a-glow)/0.6)]" : ""
                        }`}
                      >
                        <span aria-hidden className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <TechIcon skill={s} className="h-8 w-8 sm:h-9 sm:w-9" />
                        <span className="text-[12px] font-medium leading-tight text-text sm:text-[13px]">{s.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* stone ledge the tiles stand on */}
              <div aria-hidden className="stone-ledge absolute -inset-x-3 bottom-0 h-5 rounded-b-xl rounded-t-sm" />
            </div>
            <SkillDetail skill={selectedSkill} />
          </div>
        </div>
      </div>
    </section>
  );
}
