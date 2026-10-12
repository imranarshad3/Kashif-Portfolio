"use client";

import { ArrowRight, ArrowUpRight, AtSign, BriefcaseBusiness, Clock, Code2, MapPin, Share2, Quote } from "lucide-react";
import { useRef } from "react";
import { contactChannels, profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";
import { useGsap } from "@/lib/hooks";
import { SectionHeading } from "../ui/SectionHeading";
import { Stars } from "../ui/Stars";
import { Skyline } from "../ui/Skyline";
import { revealGroups } from "../ui/reveal";

const channelIcon: Record<string, typeof AtSign> = {
  Email: AtSign,
  LinkedIn: Share2,
  GitHub: Code2,
  "X / Twitter": Share2,
  Upwork: BriefcaseBusiness,
};

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const channels = contactChannels();

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      revealGroups(root.current!);
      gsap.from("[data-contact-card]", {
        opacity: 0,
        y: 40,
        rotateX: -25,
        transformPerspective: 800,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-contact-cards]", start: "top 88%", toggleActions: "play none none reverse" },
      });
      // Golden signature: outlines trace in like a pen, then the ink fills; flourish draws last.
      const lines = gsap.utils.toArray<SVGTextElement>("[data-signature-line]");
      const sig = gsap.timeline({ scrollTrigger: { trigger: "[data-signature]", start: "top 85%", toggleActions: "play none none reverse" } });
      sig
        .fromTo(lines, { strokeDashoffset: 900 }, { strokeDashoffset: 0, duration: 2.2, ease: "power1.inOut", stagger: 0.45 })
        .fromTo(lines, { fillOpacity: 0 }, { fillOpacity: 1, duration: 1.2, ease: "power2.out", stagger: 0.45 }, 0.9)
        .fromTo("[data-signature-flourish]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut" }, "-=0.9");
      // Skyline rises behind the finale and its rim light traces across
      gsap.fromTo("[data-skyline]", { yPercent: 45, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 15%", scrub: 0.8 } });
      gsap.fromTo("[data-skyline-rim]", { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", ease: "none", scrollTrigger: { trigger: root.current, start: "top 60%", end: "top 5%", scrub: 0.8 } });
      gsap.to("[data-skyline-windows] rect", { opacity: () => 0.2 + Math.random() * 0.7, duration: () => 2 + Math.random() * 3, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: { each: 0.05, from: "random" } });
      gsap.to("[data-contact-glow]", {
        opacity: 0.9,
        scale: 1.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true },
      });
    });
  });

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title" className="relative overflow-hidden pb-52 pt-28 sm:pb-72 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div
        data-contact-glow
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(232,160,80,0.22),transparent_65%)] opacity-50"
      />
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] w-full opacity-90 sm:h-[240px]" />
      {/* warm dusk wash, echoing the hero window */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(ellipse_at_80%_70%,rgba(212,138,82,0.18),transparent_60%),radial-gradient(ellipse_at_60%_20%,rgba(59,37,54,0.35),transparent_55%)] lg:block"
      />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-10">
        <div>
          <SectionHeading
            id="contact-title"
            index="06"
            label="CONTACT"
            eyebrow="Let's connect"
            title={
              <>
                Have a Project <span className="text-gold-gradient">in Mind?</span>
              </>
            }
            description="Tell me what you're building and where it's stuck. I'll tell you honestly what it will take to get it live."
          />
          <div data-reveal-group className="mt-8 flex flex-wrap gap-3">
            <a data-reveal href={profile.upworkUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
              Get in Touch <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            {profile.email && (
              <a data-reveal href={`mailto:${profile.email}`} className="btn-ghost">
                <AtSign className="h-4 w-4" aria-hidden /> {profile.email}
              </a>
            )}
          </div>

          <ul data-contact-cards className="mt-12 grid gap-3 sm:grid-cols-2">
            {channels.map((c) => {
              const Icon = channelIcon[c.label] ?? AtSign;
              const external = !c.href.startsWith("mailto:");
              return (
                <li key={c.label} data-contact-card>
                  <a
                    href={c.href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="glass glass-hover group flex items-center gap-4 rounded-2xl p-4"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-black/40">
                      <Icon className="h-5 w-5 text-gold-bright" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-text">{c.label}</span>
                      <span className="block truncate text-[12px] text-faint">{c.value}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-faint transition-colors group-hover:text-gold-bright" aria-hidden />
                  </a>
                </li>
              );
            })}
            <li data-contact-card className="glass flex items-center gap-4 rounded-2xl p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-black/40">
                <Clock className="h-5 w-5 text-gold-bright" aria-hidden />
              </span>
              <span>
                <span className="block text-sm text-text">Availability</span>
                <span className="block text-[12px] text-faint">
                  {profile.availability} · {profile.rate}
                </span>
              </span>
            </li>
            <li data-contact-card className="glass flex items-center gap-4 rounded-2xl p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-black/40">
                <MapPin className="h-5 w-5 text-gold-bright" aria-hidden />
              </span>
              <span>
                <span className="block text-sm text-text">Based in</span>
                <span className="block text-[12px] text-faint">{profile.location}</span>
              </span>
            </li>
          </ul>
        </div>

        <div className="relative flex flex-col justify-center gap-6">
          <div className="glass relative w-fit rounded-[26px] px-10 py-8 [transform:rotate(-2deg)] lg:ml-auto">
            <p className="sr-only">Let&apos;s Build Something Amazing</p>
            <svg data-signature aria-hidden viewBox="0 0 420 230" className="w-[min(100%,420px)] overflow-visible">
              {["Let\u2019s Build", "Something", "Amazing"].map((line, i) => (
                <text
                  key={line}
                  data-signature-line
                  x={8 + i * 14}
                  y={62 + i * 72}
                  className="signature-text font-script"
                  style={{ fontSize: 66 }}
                >
                  {line}
                </text>
              ))}
              {/* flourish under the last word */}
              <path data-signature-flourish d="M40 214 C 140 236, 260 200, 404 208" fill="none" style={{ stroke: "rgb(var(--a-300))" }} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div data-reveal-group className="space-y-4">
            {profile.reviews.map((r) => (
              <figure data-reveal key={r.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 text-[13px] text-gold-bright">
                  5.0 <Stars rating={r.rating} label="Client rating: 5 out of 5" size="sm" />
                </div>
                <blockquote className="mt-2 text-[13px] italic leading-relaxed text-text/85">
                  <Quote className="mr-1 inline h-3 w-3 -translate-y-1 text-gold" aria-hidden />
                  {r.quote}
                </blockquote>
                <figcaption className="mt-2 text-[11px] text-faint">
                  {r.author} · {r.engagement}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
