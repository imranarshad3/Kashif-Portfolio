"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { consumeMorph } from "@/lib/transition";
import { goldSweep, revealHeadline, scrambleIn } from "./ui/reveal";

/** Entrance + scroll animations for case-study pages. */
export function CaseStudyMotion({ slug, children }: { slug: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGsap(
    root,
    () => {
      // Arriving from a project card: the screenshot already morphed into place.
      const morphed = consumeMorph(slug);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = root.current!;
        const title = scope.querySelector<HTMLElement>("[data-cs-split]");
        if (title) revealHeadline(title, scope);
        scope.querySelectorAll<HTMLElement>("[data-cs-scramble]").forEach((el) => scrambleIn(el, scope));
        gsap.from("[data-cs]:not([data-cs-scramble])", { y: 30, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.15 });

        if (!morphed) {
          gsap.fromTo(
            "[data-cs-visual] > div",
            { rotateX: 14, y: 60, opacity: 0, transformOrigin: "50% 0%" },
            { rotateX: 0, y: 0, opacity: 1, duration: 1.4, ease: "power3.out", delay: 0.3 },
          );
        }
        // the screenshot drifts slightly slower than the page
        gsap.fromTo(
          "[data-cs-parallax]",
          { yPercent: 0, scale: 1.06 },
          {
            yPercent: 5,
            scale: 1.06,
            ease: "none",
            scrollTrigger: { trigger: "[data-cs-visual]", start: "top 60%", end: "bottom top", scrub: true },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-cs-block]").forEach((el) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" } });
          tl.from(el, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out" });
          const items = el.querySelectorAll("li");
          if (items.length) tl.from(items, { x: -14, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 }, 0.25);
        });

        const teaser = scope.querySelector("[data-next-teaser]");
        if (teaser) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: teaser, start: "top 80%", toggleActions: "play none none reverse" } });
          tl.from(teaser, { y: 70, opacity: 0, duration: 1.1, ease: "power3.out" });
          const sweep = goldSweep(teaser.querySelector("[data-next-title]")!, 0);
          if (sweep) tl.add(sweep, 0.5);
        }
      });
    },
    [slug],
  );
  return <div ref={root}>{children}</div>;
}
