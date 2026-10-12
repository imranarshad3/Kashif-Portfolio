"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getLenis, isProgrammaticScroll, SCROLL_SETTLED, scrollToTarget } from "@/lib/scroll";
import { Logo } from "./ui/Logo";
import { ThemeSwitcher } from "./ThemeSwitcher";

const links = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/**
 * On the home page a section link is a plain anchor (SmoothScroll glides to it); elsewhere it is
 * a client-side <Link> to "/#id", so leaving a case study never reloads the page.
 */
function SectionLink({ onHome, ...props }: React.ComponentPropsWithRef<"a"> & { onHome: boolean; href: string }) {
  return onHome ? <a {...props} /> : <Link {...props} />;
}

/** `onHome` = links are in-page anchors; otherwise they point back to "/#id". */
export function Nav({ onHome = true }: { onHome?: boolean }) {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const progress = useRef<HTMLSpanElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Header background + reading-progress line (page height cached; no layout reads per frame)
  useEffect(() => {
    let frame = 0;
    let max = 1;
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      if (progress.current) progress.current.style.transform = `scaleX(${Math.min(1, y / max)})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Active section = the last one whose top has crossed the upper-middle of the viewport.
  // Derived from position (not intersection events), so it is also right after a jump,
  // a history restore or back/forward — not only after the visitor scrolls. Sections merely
  // passed during a programmatic glide are skipped; it re-syncs when the glide lands.
  useEffect(() => {
    if (!onHome) return;
    const ids = [...links.map((l) => l.id), "companies"];
    // document order ("companies" sits between experience and contact)
    const sections = (ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]).sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      if (isProgrammaticScroll()) return;
      const line = window.innerHeight * 0.45;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let current = sections[0]?.id ?? "home";
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
      if (atBottom) current = sections[sections.length - 1]?.id ?? current;
      setActive(current === "companies" ? "experience" : current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener(SCROLL_SETTLED, schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener(SCROLL_SETTLED, schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [onHome]);

  // Single underline that glides between links: it previews the hovered link, then
  // settles back on the active section.
  const shown = hovered ?? (onHome ? active : null);
  const measure = useCallback(() => {
    const el = shown ? linkRefs.current[shown] : null;
    if (!el) return setIndicator(null);
    setIndicator({ left: el.offsetLeft + 16, width: el.offsetWidth - 32 });
  }, [shown]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // Mobile menu: pause page scroll while open, Escape closes and returns focus
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    if (!lenis) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onHome) {
      // cross-page: <Link> navigates client-side to "/#id"; SmoothScroll lands on the section
      setOpen(false);
      return;
    }
    setActive(id);
    if (!open) return; // desktop: SmoothScroll handles the anchor
    // Mobile: close the sheet first, then glide once scrolling is unpaused.
    e.preventDefault();
    setOpen(false);
    if (window.location.hash !== `#${id}`) history.pushState(history.state, "", `#${id}`);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget(id, { focus: true })));
  };

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "border-b border-white/5 bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {onHome ? (
          <a href="#home" onClick={go("home")} aria-label="Kashif Saeed — back to top" className="rounded-md">
            <Logo />
          </a>
        ) : (
          <Link href="/" aria-label="Kashif Saeed — home" className="rounded-md">
            <Logo />
          </Link>
        )}

        <ul className="relative hidden items-center gap-1 lg:flex" onMouseLeave={() => setHovered(null)}>
          {links.map((l) => (
            <li key={l.id}>
              <SectionLink
                onHome={onHome}
                ref={(el) => {
                  linkRefs.current[l.id] = el;
                }}
                href={href(l.id)}
                onClick={go(l.id)}
                onMouseEnter={() => setHovered(l.id)}
                onFocus={() => setHovered(l.id)}
                onBlur={() => setHovered(null)}
                aria-current={onHome && active === l.id ? "true" : undefined}
                className={`relative block px-4 py-2 text-[13px] transition-colors duration-300 ${
                  onHome && active === l.id ? "text-gold-bright" : "text-muted hover:text-text"
                }`}
              >
                {l.label}
              </SectionLink>
            </li>
          ))}
          {indicator && (
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-gold via-gold-bright to-gold/0 transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              // a hover preview is a lighter stroke than the active section's underline
              style={{ width: indicator.width, transform: `translateX(${indicator.left}px)`, opacity: shown === active && onHome ? 1 : 0.5 }}
            />
          )}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <SectionLink onHome={onHome} href={href("contact")} onClick={go("contact")} className="btn-gold px-5! py-2.5! max-sm:hidden">
            Hire Me <ArrowRight className="h-4 w-4" aria-hidden />
          </SectionLink>
          <button
            ref={menuButton}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-text transition-colors hover:border-gold/40 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative h-5 w-5">
              <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${open ? "rotate-90 opacity-0" : "opacity-100"}`} />
              <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${open ? "opacity-100" : "-rotate-90 opacity-0"}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* reading progress */}
      <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
        <span ref={progress} style={{ transform: "scaleX(0)" }} className="block h-full origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-bright shadow-[0_0_8px_rgb(var(--a-glow)/0.6)]" />
      </span>

      <div
        id="mobile-menu"
        inert={!open}
        className={`absolute inset-x-0 top-[72px] h-[calc(100dvh-72px)] overflow-y-auto border-t border-white/5 bg-[radial-gradient(ellipse_at_80%_0%,rgb(var(--a-300)/0.10),transparent_55%),linear-gradient(180deg,#0b0a0c,#060608)] px-6 py-8 transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1">
          {links.map((l, i) => (
            <li
              key={l.id}
              className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
            >
              <SectionLink
                onHome={onHome}
                href={href(l.id)}
                onClick={go(l.id)}
                aria-current={onHome && active === l.id ? "true" : undefined}
                className={`flex items-baseline gap-4 border-b border-white/5 py-4 font-display text-2xl transition-colors ${
                  onHome && active === l.id ? "text-gold-bright" : "text-text"
                }`}
              >
                <span className="text-xs text-faint">0{i + 1}</span>
                {l.label}
              </SectionLink>
            </li>
          ))}
        </ul>
        <SectionLink onHome={onHome} href={href("contact")} onClick={go("contact")} className="btn-gold mt-8">
          Hire Me <ArrowRight className="h-4 w-4" aria-hidden />
        </SectionLink>
      </div>
    </header>
  );
}
