"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, GraduationCap, Handshake, Quote, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { kindLabels, type Experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { getProject } from "@/content/projects";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";
import { Stars } from "./Stars";

const icons = { employment: Briefcase, contract: Handshake, education: GraduationCap };

/**
 * Glass achievement panel for one Experience milestone, opened from its roadside building.
 * A native modal <dialog> provides the focus trap, Escape handling and inert page; smooth scroll
 * is paused while it's open (the panel itself scrolls natively via data-lenis-prevent).
 * Only documented data is shown: role, dates, highlights, stack, linked case study and review.
 */
export function AchievementPanel({ item, onClosed }: { item: Experience | null; onClosed: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    const d = dialog.current;
    if (!item || !d) return;
    closing.current = false;
    if (!d.open) d.showModal();
    closeBtn.current?.focus({ preventScroll: true });
    getLenis()?.stop();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline();
    tl.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: still ? 0.15 : 0.45, ease: "power2.out" });
    if (still) tl.fromTo(panel.current, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
    else
      tl.fromTo(
        panel.current,
        { opacity: 0, y: 70, z: -220, rotationX: 22, scale: 0.92 },
        { opacity: 1, y: 0, z: 0, rotationX: 0, scale: 1, duration: 0.95, ease: "expo.out" },
        0.05,
      )
        .from(panel.current!.querySelectorAll("[data-panel-stagger]"), { y: 16, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.05 }, 0.25)
        .fromTo(panel.current!.querySelector("[data-panel-sheen]"), { "--sheen": "-40%" }, { "--sheen": "160%", duration: 1.3, ease: "power2.inOut" }, 0.3);
    return () => {
      tl.kill();
    };
  }, [item]);

  const close = useCallback(() => {
    const d = dialog.current;
    if (!d || closing.current) return;
    closing.current = true;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap
      .timeline({
        onComplete: () => {
          d.close();
          getLenis()?.start();
          onClosed();
        },
      })
      .to(panel.current, still ? { opacity: 0, duration: 0.15 } : { opacity: 0, y: 40, z: -160, rotationX: -10, scale: 0.95, duration: 0.45, ease: "power3.in" })
      .to(scrim.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  }, [onClosed]);

  // Lenis must never stay stopped if the panel unmounts while open.
  useEffect(() => () => getLenis()?.start(), []);

  const Icon = item ? icons[item.kind] : Briefcase;
  const review = item?.reviewId ? profile.reviews.find((r) => r.id === item.reviewId) : undefined;
  const project = item?.projectSlug ? getProject(item.projectSlug) : undefined;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="achievement-title"
      onCancel={(e) => {
        e.preventDefault(); // Escape: animate out instead of closing abruptly
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).hasAttribute("data-panel-dismiss")) close();
      }}
      className="achievement-dialog m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-text"
    >
      <div ref={scrim} className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,16,10,0.55),rgba(4,4,6,0.85))] backdrop-blur-[6px]" />
      <div data-panel-dismiss className="relative flex h-full overflow-y-auto overscroll-contain p-4 [perspective:1400px] sm:p-8" data-lenis-prevent>
        {item && (
          <div
            ref={panel}
            className="achievement-glass relative m-auto w-full max-w-[560px] overflow-hidden rounded-[28px] p-6 [transform-style:preserve-3d] sm:p-8"
          >
            <span aria-hidden data-panel-sheen className="portrait-sheen pointer-events-none absolute inset-0" />
            <button
              type="button"
              ref={closeBtn}
              onClick={close}
              aria-label="Close milestone details"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/30 text-muted transition-colors hover:border-gold/50 hover:text-gold-bright"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div data-panel-stagger className="flex items-center gap-3 pr-10">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 shadow-[0_0_24px_-6px_rgb(var(--a-glow)/0.6)]">
                <Icon className="h-5 w-5 text-gold-bright" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{kindLabels[item.kind]} milestone</p>
                <p className="mt-0.5 truncate text-[13px] text-muted">{item.organization}</p>
              </div>
            </div>

            <h2 id="achievement-title" data-panel-stagger className="mt-5 font-display text-2xl leading-snug text-text sm:text-[1.7rem]">
              {item.role}
            </h2>
            <p data-panel-stagger className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-faint">
              <span className="tabular-nums">{item.period}</span>
              {item.current && <span className="chip border-gold/40! text-gold-bright!">Current</span>}
            </p>
            <p data-panel-stagger className="mt-4 text-[14px] leading-relaxed text-muted">
              {item.summary}
            </p>

            {item.highlights.length > 0 && (
              <div data-panel-stagger className="mt-6">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-faint">Key accomplishments</h3>
                <ul className="mt-3 space-y-2">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-[13.5px] leading-snug text-text/90">
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-bright shadow-[0_0_8px_rgb(var(--a-glow)/0.8)]" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.stack.length > 0 && (
              <div data-panel-stagger className="mt-6">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-faint">Technologies</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.stack.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review && (
              <figure data-panel-stagger className="mt-6 rounded-2xl border border-gold/15 bg-gold/[0.04] p-4">
                <div className="flex items-center gap-2 text-[13px] text-gold-bright">
                  {review.rating.toFixed(1)} <Stars rating={review.rating} label={`Client rating: ${review.rating} out of 5`} size="sm" />
                </div>
                <blockquote className="mt-2 text-[13px] italic leading-relaxed text-text/85">
                  <Quote className="mr-1 inline h-3 w-3 -translate-y-1 text-gold" aria-hidden />
                  {review.quote}
                </blockquote>
                <figcaption className="mt-2 text-[11px] text-faint">— {review.author}, Upwork</figcaption>
              </figure>
            )}

            {project && (
              <div data-panel-stagger className="mt-6">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-faint">Related project</h3>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-gold/40"
                >
                  <span>
                    <span className="block text-[14px] text-text">{project.name}</span>
                    <span className="block text-[12px] text-faint">{project.tagline}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-bright transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
