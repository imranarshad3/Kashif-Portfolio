"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, GraduationCap, Handshake, Quote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { experience, kindLabels, type Experience as Item } from "@/content/experience";
import { profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";
import { useGsap, useIsDesktop } from "@/lib/hooks";
import { SectionHeading } from "../ui/SectionHeading";
import { AchievementPanel } from "../ui/AchievementPanel";
import { GoldCar } from "../ui/GoldCar";
import { RoadsideStop } from "../ui/RoadsideStop";
import { Stars } from "../ui/Stars";
import { revealGroups } from "../ui/reveal";

const icons = { employment: Briefcase, contract: Handshake, education: GraduationCap };

function TimelineCard({ item }: { item: Item }) {
  const Icon = icons[item.kind];
  const review = item.reviewId ? profile.reviews.find((r) => r.id === item.reviewId) : undefined;
  return (
    <div className="glass glass-hover rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/5">
          <Icon className="h-5 w-5 text-gold-bright" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[12px] text-faint">
            <span>{item.period}</span>
            <span className="chip py-0.5!">{kindLabels[item.kind]}</span>
            {item.current && <span className="chip border-gold/40! text-gold-bright!">Current</span>}
          </p>
          <h3 className="mt-2 font-display text-lg leading-snug text-text">{item.role}</h3>
          <p className="text-[13px] text-gold">{item.organization}</p>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted">{item.summary}</p>
      {item.highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {item.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-[13px] text-muted">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
              {h}
            </li>
          ))}
        </ul>
      )}
      {item.stack.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {item.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      )}
      {review && (
        <figure className="mt-5 rounded-xl border border-gold/15 bg-gold/[0.04] p-4">
          <div className="flex items-center gap-2 text-[13px] text-gold-bright">
            5.0 <Stars rating={review.rating} label="Client rating: 5 out of 5" size="sm" />
          </div>
          <blockquote className="mt-2 text-[13px] italic leading-relaxed text-text/85">
            <Quote className="mr-1 inline h-3 w-3 -translate-y-1 text-gold" aria-hidden />
            {review.quote}
          </blockquote>
          <figcaption className="mt-2 text-[11px] text-faint">— {review.author}</figcaption>
        </figure>
      )}
      {item.projectSlug && (
        <Link href={`/projects/${item.projectSlug}`} className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-gold-bright hover:underline">
          Related case study <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

type Pt = { x: number; y: number };

/** How far ahead of a milestone (px along the road's height) its roadside building starts to rise. */
const APPROACH = 260;

/** Curve through each milestone node with vertical tangents, in pixel units (viewBox = width × height). */
function buildPath(points: Pt[], width: number, height: number, desktop: boolean) {
  if (!desktop || points.length === 0) return `M ${width * 0.06} 0 L ${width * 0.06} ${height}`;
  const mid = width / 2;
  let d = `M ${mid} 0`;
  let prev: Pt = { x: mid, y: 0 };
  for (const pt of [...points, { x: mid, y: height }]) {
    const dy = (pt.y - prev.y) / 2;
    d += ` C ${prev.x} ${prev.y + dy}, ${pt.x} ${pt.y - dy}, ${pt.x} ${pt.y}`;
    prev = pt;
  }
  return d;
}

export function Experience() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const path = useRef<SVGPathElement>(null);
  const glowPath = useRef<SVGPathElement>(null);
  const car = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [layout, setLayout] = useState<{ width: number; height: number; points: Pt[] }>({ width: 1000, height: 1000, points: [] });
  const height = layout.height;
  const [openId, setOpenId] = useState<string | null>(null);
  const openItem = experience.find((e) => e.id === openId) ?? null;
  const onPanelClosed = useCallback(() => setOpenId(null), []);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => {
      const items = [...el.querySelectorAll<HTMLElement>("[data-tl-item]")];
      const width = Math.round(el.offsetWidth);
      const points = items.map((li, i) => ({ x: width * (i % 2 === 0 ? 0.36 : 0.64), y: Math.round(li.offsetTop + li.offsetHeight / 2) }));
      const next = { width, height: Math.max(400, Math.round(el.offsetHeight)), points };
      setLayout((prev) => (prev.width === next.width && prev.height === next.height && prev.points.every((p, i) => p.y === points[i]?.y) && prev.points.length === points.length ? prev : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const d = buildPath(layout.points, layout.width, height, isDesktop);

  useGsap(
    root,
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        revealGroups(root.current!);
        const p = path.current;
        const g = glowPath.current;
        if (!p || !g) return;
        const len = p.getTotalLength();
        gsap.set([p, g], { strokeDasharray: len, strokeDashoffset: len });
        // The car rides the head of the drawn light trail, heading along the curve's tangent.
        let heading: number | null = null;
        // Milestones light up as the car reaches them (and dim again when reversing)
        const items = gsap.utils.toArray<HTMLElement>("[data-tl-item]");
        const nodeYs = items.map((li) => li.offsetTop + li.offsetHeight / 2);
        const lit = items.map(() => false);
        // Roadside buildings rise out of the ground as the car approaches and sink again in reverse.
        const risen = items.map(() => false);
        const rises = items.map((item) => {
          const stops = item.querySelectorAll<HTMLElement>("[data-stop]");
          const bodies = item.querySelectorAll<HTMLElement>("[data-stop-rise]");
          gsap.set(stops, { pointerEvents: "none" });
          return gsap
            .timeline({ paused: true })
            .fromTo(
              bodies,
              { rotationX: 76, y: 28, scale: 0.8, opacity: 0, transformPerspective: 700 },
              { rotationX: 0, y: 0, scale: 1, opacity: 1, duration: 1, ease: "back.out(1.3)" },
            )
            .fromTo(item.querySelectorAll(".stop-cta"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, 0.55)
            .set(stops, { pointerEvents: "auto" }, 0.3);
        });
        const light = (i: number, on: boolean) => {
          lit[i] = on;
          const item = items[i];
          const node = item.querySelector<HTMLElement>("[data-tl-node]");
          item.classList.toggle("is-lit", on);
          if (on && node) gsap.fromTo(node, { scale: 1.8 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" });
        };
        const carAt = (progress: number) => {
          const el = car.current;
          if (!el) return;
          const at = len * progress;
          const pt = p.getPointAtLength(at);
          const behind = p.getPointAtLength(Math.max(0, at - 6));
          const ahead = p.getPointAtLength(Math.min(len, at + 6));
          let target = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
          if (heading === null) heading = target;
          // unwrap so the car never spins the long way round, then ease towards the tangent
          while (target - heading > 180) target -= 360;
          while (target - heading < -180) target += 360;
          heading += (target - heading) * 0.65;
          el.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%) rotate(${heading.toFixed(2)}deg)`;
          el.style.opacity = progress > 0.002 && progress < 0.998 ? "1" : "0";
          for (let i = 0; i < nodeYs.length; i++) {
            const reached = progress > 0.002 && pt.y >= nodeYs[i] - 2;
            if (reached !== lit[i]) light(i, reached);
            const near = progress > 0.002 && pt.y >= nodeYs[i] - APPROACH;
            if (near !== risen[i]) {
              risen[i] = near;
              if (near) rises[i].timeScale(1).play();
              else rises[i].timeScale(1.4).reverse();
            }
          }
        };
        // ScrollTrigger can fire onUpdate synchronously while the tween is being created,
        // so read progress from the tween itself (`this`) rather than a not-yet-assigned binding.
        gsap.to([p, g], {
          strokeDashoffset: 0,
          ease: "none",
          onUpdate(this: gsap.core.Tween) {
            carAt(this.progress());
          },
          scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        });
        gsap.utils.toArray<HTMLElement>("[data-tl-item]").forEach((item, i) => {
          gsap.from(item.querySelector("[data-tl-card]"), {
            opacity: 0,
            x: isDesktop ? (i % 2 === 0 ? -70 : 70) : 40,
            rotateY: isDesktop ? (i % 2 === 0 ? 18 : -18) : 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 80%", toggleActions: "play none none reverse" },
          });
          gsap.from(item.querySelector("[data-tl-node]"), {
            scale: 0,
            duration: 0.6,
            ease: "back.out(2)",
            scrollTrigger: { trigger: item, start: "top 70%", toggleActions: "play none none reverse" },
          });
        });
      });
    },
    [isDesktop, d],
  );

  return (
    <section id="experience" ref={root} aria-labelledby="experience-title" className="relative overflow-hidden py-28 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <SectionHeading
            id="experience-title"
            index="05"
            label="EXPERIENCE"
            eyebrow="My journey"
            title={
              <>
                A Journey <span className="text-gold-gradient">of Growth</span>
              </>
            }
            description="From React interfaces to full-stack platforms with payments, data pipelines and AI — employment and client engagements, most recent first."
          />
          <div data-reveal-group className="flex flex-wrap gap-3 lg:justify-end">
            {(["employment", "contract", "education"] as const).map((k) => {
              const Icon = icons[k];
              return (
                <span data-reveal key={k} className="chip gap-2 px-3! py-1.5!">
                  <Icon className="h-3.5 w-3.5 text-gold" aria-hidden /> {kindLabels[k]}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative mt-16">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${layout.width} ${height}`}
          >
            <defs>
              <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
                <stop offset="1" style={{ stopColor: "rgb(var(--a-400))" }} />
              </linearGradient>
              <filter id="road-glow" filterUnits="userSpaceOnUse" x={0} y={0} width={layout.width} height={height}>
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            {/* road surface: kerb, asphalt, faint centre line */}
            <path d={d} fill="none" stroke="rgb(var(--a-100)/0.09)" strokeWidth={isDesktop ? 30 : 16} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#0e0c0b" strokeWidth={isDesktop ? 27 : 13} strokeLinecap="round" />
            <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeDasharray="10 12" />
            {/* light trail drawn as you scroll */}
            <path ref={glowPath} d={d} fill="none" style={{ stroke: "rgb(var(--a-300))" }} strokeOpacity="0.32" strokeWidth={isDesktop ? 20 : 11} strokeLinecap="round" filter="url(#road-glow)" />
            <path ref={path} d={d} fill="none" stroke="url(#road)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div
            ref={car}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-20 opacity-0 transition-opacity duration-300 will-change-transform"
          >
            <div className="max-lg:scale-75">
              <GoldCar />
            </div>
          </div>

          <ol ref={list} className="relative">
            {experience.map((item, i) => {
              const left = i % 2 === 0;
              return (
                <li key={item.id} data-tl-item className="relative grid min-h-[260px] items-center py-6 pl-12 lg:grid-cols-2 lg:pl-0 [perspective:1200px]">
                  {/* node on the road */}
                  <span
                    data-tl-node
                    aria-hidden
                    className={`tl-lantern absolute top-1/2 z-10 h-4 w-3 -translate-y-1/2 rounded-[3px] max-lg:left-[6%] max-lg:-translate-x-1/2 ${
                      left ? "lg:left-[36%]" : "lg:left-[64%]"
                    } lg:-translate-x-1/2`}
                  >
                    {/* start year, revealed when the car reaches this milestone (desktop) */}
                    <span
                      data-tl-year
                      className={`tl-year absolute top-1/2 -mt-2.5 hidden whitespace-nowrap font-display text-[13px] tabular-nums lg:block ${
                        left ? "right-6" : "left-6"
                      }`}
                    >
                      {item.start.slice(0, 4)}
                    </span>
                  </span>
                  {/* roadside building on the open side of the road (desktop) */}
                  <div
                    className={`absolute top-1/2 z-10 hidden w-[clamp(150px,17%,200px)] -translate-y-1/2 lg:block ${left ? "left-[5%]" : "right-[5%]"}`}
                  >
                    <RoadsideStop item={item} onOpen={() => setOpenId(item.id)} />
                  </div>
                  {/* phones/tablets: a compact building above the card, beside the road */}
                  <div className="mb-3 lg:hidden">
                    <RoadsideStop item={item} compact onOpen={() => setOpenId(item.id)} />
                  </div>
                  <div data-tl-card className={left ? "lg:col-start-2 lg:pl-16" : "lg:col-start-1 lg:row-start-1 lg:pr-16"}>
                    <TimelineCard item={item} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <AchievementPanel item={openItem} onClosed={onPanelClosed} />
    </section>
  );
}
