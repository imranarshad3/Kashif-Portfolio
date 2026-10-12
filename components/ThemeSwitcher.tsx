"use client";

import { Check, Palette } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ACCENTS, setAccent, useAccent } from "@/lib/accent";

/** Small navbar control for choosing the site's accent palette. */
export function ThemeSwitcher() {
  const accent = useAccent();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // focus the current choice so arrow keys work straight away
    root.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onArrow = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const items = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = items[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length];
    next?.focus();
  };

  const current = ACCENTS.find((a) => a.id === accent)!;

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-label={`Colour theme: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="group relative grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted transition-colors hover:border-gold/40 hover:text-gold-bright"
      >
        <Palette className="h-[18px] w-[18px]" aria-hidden />
        {/* tiny live swatch of the active accent */}
        <span aria-hidden className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full border border-ink bg-gold" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Colour theme"
          onKeyDown={onArrow}
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(28,24,20,0.98),rgba(10,9,9,0.98))] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.95)]"
        >
          <p className="px-3 pb-2 pt-1.5 text-[10px] uppercase tracking-[0.2em] text-faint">Colour theme</p>
          {ACCENTS.map((a) => {
            const on = a.id === accent;
            return (
              <button
                key={a.id}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                onClick={() => {
                  setAccent(a.id);
                  setOpen(false);
                  button.current?.focus();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                  on ? "bg-white/[0.06] text-text" : "text-muted hover:bg-white/[0.04] hover:text-text"
                }`}
              >
                <span
                  aria-hidden
                  className="h-5 w-5 shrink-0 rounded-full border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                  style={{ background: `linear-gradient(135deg, ${a.swatch[0]}, ${a.swatch[1]} 55%, ${a.swatch[2]})` }}
                />
                <span className="flex-1">{a.label}</span>
                {on && <Check className="h-4 w-4 text-gold-bright" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
