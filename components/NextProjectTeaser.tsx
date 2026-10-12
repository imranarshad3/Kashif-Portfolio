"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Project } from "@/content/projects";
import { markMorph } from "@/lib/transition";
import { shotName } from "@/lib/shotName";
import { ProjectVisual } from "./ui/ProjectVisual";

/** Large "next project" invitation; its screenshot morphs into the next case study's hero. */
export function NextProjectTeaser({ next, prev }: { next: Project; prev: Project }) {
  return (
    <nav aria-label="More projects" className="mt-24 border-t border-white/10 pt-12">
      <Link
        href={`/projects/${next.slug}`}
        prefetch
        onClick={() => markMorph(next.slug)}
        data-next-teaser
        className="group glass grid items-center gap-6 overflow-hidden rounded-[28px] p-3 transition-[border-color,box-shadow] duration-500 hover:border-gold/40 hover:shadow-[0_0_60px_-20px_rgb(var(--a-glow)/0.45)] md:grid-cols-[1.25fr_1fr] md:p-4"
      >
        <ViewTransition name={shotName(next.slug)} share="morph" default="none">
          <div className={`relative overflow-hidden rounded-[20px] border border-white/10 bg-black ${next.image ? "aspect-[16/10]" : "aspect-[16/7]"}`}>
            <div className="h-full w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
              <ProjectVisual project={next} sizes="(min-width: 768px) 600px, 100vw" />
            </div>
          </div>
        </ViewTransition>
        <div className="px-3 pb-4 md:px-4 md:pb-0">
          <p className="eyebrow">Next project</p>
          <p data-next-title className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] text-text">
            <span className="text-gold-gradient">{next.name}</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">{next.tagline}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-gold-bright">
            View case study <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </Link>
      <Link href={`/projects/${prev.slug}`} className="mt-6 inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-gold-bright">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous: {prev.name}
      </Link>
    </nav>
  );
}
