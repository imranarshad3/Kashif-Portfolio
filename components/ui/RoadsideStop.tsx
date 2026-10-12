"use client";

import { useId } from "react";
import type { Experience } from "@/content/experience";

type Variant = "kiosk" | "studio" | "hall";
const variants: Record<Experience["kind"], Variant> = { contract: "kiosk", employment: "studio", education: "hall" };

/** Sign board per building: on the kiosk roof, on posts above the studio, in the hall's pediment. */
const signs: Record<Variant, { x: number; y: number; w: number; h: number }> = {
  kiosk: { x: 62, y: 58, w: 80, h: 24 },
  studio: { x: 62, y: 24, w: 80, h: 24 },
  hall: { x: 72, y: 50, w: 60, h: 19 },
};

/** Short sign name: the platform/company part of the organization, e.g. "Upwork · Cardex" → "Upwork". */
function signName(item: Experience) {
  const name = item.organization.split(" · ")[0];
  return name.length > 12 ? name.split(" ")[0] : name;
}

/**
 * A small roadside building for one Experience milestone, drawn as a lightweight SVG elevation
 * (front, side and roof faces give it depth without WebGL): a studio kiosk for client contracts,
 * an office studio for employment, a columned hall for education. Window light, the lamp, the
 * light pool and the marker are driven by the milestone's `.is-lit` class (see globals.css);
 * Experience raises `[data-stop-rise]` as the car approaches.
 */
export function RoadsideStop({ item, onOpen, compact = false }: { item: Experience; onOpen: () => void; compact?: boolean }) {
  const id = useId().replace(/:/g, "");
  const variant = variants[item.kind];
  const name = signName(item).toUpperCase();
  const year = item.start.slice(0, 4);
  const sign = signs[variant];
  const signSize = Math.min(sign.h * 0.42, (sign.w - 8) / (name.length * 0.72));

  return (
    <button
      type="button"
      data-stop
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`Open milestone: ${item.role}, ${item.organization}, ${item.period}`}
      className={`stop-building group relative block touch-manipulation text-left ${compact ? "w-[132px]" : "w-full"}`}
    >
      <span data-stop-rise className="block origin-bottom [transform-style:preserve-3d]">
        <svg viewBox="0 0 220 196" className="stop-svg block h-auto w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2c261e" />
              <stop offset="1" stopColor="#14110e" />
            </linearGradient>
            <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#120f0c" />
              <stop offset="1" stopColor="#0a0908" />
            </linearGradient>
            <linearGradient id={`${id}-trim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
              <stop offset="1" style={{ stopColor: "rgb(var(--a-400))" }} />
            </linearGradient>
            <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" style={{ stopColor: "rgb(var(--a-glow))" }} stopOpacity="0.55" />
              <stop offset="1" style={{ stopColor: "rgb(var(--a-glow))" }} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff3d6" />
              <stop offset="0.5" style={{ stopColor: "rgb(var(--a-200))" }} />
              <stop offset="1" style={{ stopColor: "rgb(var(--a-300))" }} />
            </linearGradient>
          </defs>

          {/* ground: shadow, and the warm pool of light that spills out once lit */}
          <ellipse cx="110" cy="182" rx="104" ry="11" fill="#000" opacity="0.55" />
          <ellipse className="stop-pool" cx="104" cy="182" rx="96" ry="16" fill={`url(#${id}-pool)`} />

          {variant === "kiosk" && <Kiosk id={id} />}
          {variant === "studio" && <Studio id={id} />}
          {variant === "hall" && <Hall id={id} />}

          {/* sign */}
          <g>
            {variant === "studio" && <path d="M78 48 V56 M126 48 V56" stroke={`url(#${id}-trim)`} strokeWidth="1.2" />}
            <rect x={sign.x} y={sign.y} width={sign.w} height={sign.h} rx="3" fill="#0d0b09" stroke={`url(#${id}-trim)`} strokeWidth="1" />
            <text x={sign.x + sign.w / 2} y={sign.y + sign.h * 0.47} textAnchor="middle" className="stop-sign font-display" fontSize={signSize} letterSpacing="1.2">
              {name}
            </text>
            <text x={sign.x + sign.w / 2} y={sign.y + sign.h * 0.84} textAnchor="middle" className="stop-sign-sub font-display" fontSize="6" letterSpacing="2">
              {year}
            </text>
          </g>

          {/* lamp post */}
          <g>
            <rect x="199" y="108" width="2.4" height="74" rx="1" fill="#2a241c" />
            <path d="M193 108 h14 l-3 -8 h-8 z" fill="#2a241c" stroke={`url(#${id}-trim)`} strokeWidth="0.6" />
            <circle className="stop-lamp" cx="200" cy="111" r="3.4" />
          </g>

          {/* milestone marker */}
          <g transform={`translate(0 ${variant === "kiosk" ? 28 : -4})`}>
          <g className="stop-marker">
            <path d="M102 6 l7 9 -7 9 -7 -9 z" fill="#14110e" stroke={`url(#${id}-trim)`} strokeWidth="1" />
            <circle className="stop-marker-core" cx="102" cy="15" r="2.6" />
          </g>
          </g>
        </svg>
      </span>
      <span className="stop-cta pointer-events-none mt-1 block text-center text-[10.5px] uppercase tracking-[0.18em]">
        {compact ? "Tap for details" : "View milestone"}
      </span>
    </button>
  );
}

/** Contract stop: a compact studio kiosk with a striped awning and a wide shop window. */
function Kiosk({ id }: { id: string }) {
  return (
    <g>
      {/* side + roof faces */}
      <path d="M152 92 L176 80 L176 166 L152 178 Z" fill={`url(#${id}-side)`} />
      <path d="M52 92 L76 80 L176 80 L152 92 Z" fill="#221d17" stroke={`url(#${id}-trim)`} strokeWidth="0.6" strokeOpacity="0.6" />
      {/* front */}
      <rect x="52" y="92" width="100" height="86" fill={`url(#${id}-front)`} stroke={`url(#${id}-trim)`} strokeWidth="0.8" strokeOpacity="0.55" />
      {/* awning */}
      <path d="M48 92 H156 L160 108 H44 Z" fill="#1c1813" stroke={`url(#${id}-trim)`} strokeWidth="0.8" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${48 + i * 18} 92 h9 l1.5 16 h-9 z`} fill="rgb(var(--a-300))" opacity="0.5" />
      ))}
      <path d="M44 108 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0" fill="none" stroke={`url(#${id}-trim)`} strokeWidth="0.8" />
      {/* shop window + mullions */}
      <rect className="stop-window" x="60" y="118" width="58" height="38" rx="1.5" fill={`url(#${id}-glass)`} />
      <path d="M79 118 V156 M98 118 V156" stroke="#14110e" strokeWidth="1.4" />
      {/* desk silhouette in the window */}
      <path d="M66 150 h22 v-6 h-22 z M72 144 v-10 h10 v10" fill="#14110e" opacity="0.55" />
      {/* door */}
      <rect className="stop-window" x="126" y="124" width="18" height="54" rx="1" fill={`url(#${id}-glass)`} />
      <circle cx="140" cy="152" r="1" fill="#14110e" />
      {/* side window */}
      <path className="stop-window" d="M160 114 L170 109 L170 132 L160 137 Z" fill={`url(#${id}-glass)`} opacity="0.7" />
      <rect x="52" y="176" width="100" height="3" fill={`url(#${id}-trim)`} opacity="0.7" />
    </g>
  );
}

/** Employment stop: a two-storey office studio with a lit window grid and a glass penthouse. */
function Studio({ id }: { id: string }) {
  return (
    <g>
      {/* side + roof */}
      <path d="M160 62 L184 50 L184 166 L160 178 Z" fill={`url(#${id}-side)`} />
      <path d="M44 62 L68 50 L184 50 L160 62 Z" fill="#221d17" stroke={`url(#${id}-trim)`} strokeWidth="0.6" strokeOpacity="0.6" />
      {/* front */}
      <rect x="44" y="62" width="116" height="116" fill={`url(#${id}-front)`} stroke={`url(#${id}-trim)`} strokeWidth="0.8" strokeOpacity="0.55" />
      <rect x="44" y="62" width="116" height="4" fill={`url(#${id}-trim)`} opacity="0.65" />
      {/* window grid */}
      {[76, 104].map((y) =>
        [54, 82, 110, 138].map((x) => <rect key={`${x}-${y}`} className="stop-window" x={x} y={y} width="16" height="20" rx="1" fill={`url(#${id}-glass)`} />),
      )}
      {/* entrance */}
      <rect x="40" y="134" width="124" height="3" fill={`url(#${id}-trim)`} opacity="0.7" />
      <rect className="stop-window" x="58" y="144" width="30" height="34" rx="1" fill={`url(#${id}-glass)`} />
      <rect className="stop-window" x="92" y="140" width="22" height="38" rx="1" fill={`url(#${id}-glass)`} />
      <rect className="stop-window" x="118" y="144" width="30" height="34" rx="1" fill={`url(#${id}-glass)`} />
      <path d="M103 140 V178" stroke="#14110e" strokeWidth="1" />
      {/* side windows */}
      {[78, 106, 142].map((y) => (
        <path key={y} className="stop-window" d={`M166 ${y} L178 ${y - 6} L178 ${y + 12} L166 ${y + 18} Z`} fill={`url(#${id}-glass)`} opacity="0.65" />
      ))}
      <rect x="44" y="176" width="116" height="3" fill={`url(#${id}-trim)`} opacity="0.7" />
    </g>
  );
}

/** Education stop: a small columned hall with a pediment and steps. */
function Hall({ id }: { id: string }) {
  return (
    <g>
      {/* side + roof */}
      <path d="M160 70 L182 60 L182 166 L160 176 Z" fill={`url(#${id}-side)`} />
      {/* pediment */}
      <path d="M38 70 L102 30 L166 70 Z" fill="#1d1914" stroke={`url(#${id}-trim)`} strokeWidth="1" />
      <path d="M102 30 L124 20 L188 60 L166 70 Z" fill="#100e0b" stroke={`url(#${id}-trim)`} strokeWidth="0.5" strokeOpacity="0.5" />
      <rect x="40" y="70" width="124" height="6" fill={`url(#${id}-trim)`} opacity="0.75" />
      {/* inner wall with lit doorway and windows */}
      <rect x="48" y="76" width="108" height="92" fill={`url(#${id}-front)`} />
      <path className="stop-window" d="M92 168 V128 a10 10 0 0 1 20 0 V168 Z" fill={`url(#${id}-glass)`} />
      <rect className="stop-window" x="62" y="104" width="14" height="24" rx="7" fill={`url(#${id}-glass)`} />
      <rect className="stop-window" x="128" y="104" width="14" height="24" rx="7" fill={`url(#${id}-glass)`} />
      {/* columns */}
      {[46, 80, 116, 150].map((x) => (
        <g key={x}>
          <rect x={x} y="78" width="8" height="90" fill="#2e281f" />
          <rect x={x + 1.5} y="78" width="1.4" height="90" fill="rgb(var(--a-100))" opacity="0.18" />
          <rect x={x - 1.5} y="76" width="11" height="3" fill={`url(#${id}-trim)`} opacity="0.7" />
        </g>
      ))}
      {/* steps */}
      <rect x="40" y="168" width="124" height="5" fill="#1d1914" stroke={`url(#${id}-trim)`} strokeWidth="0.5" strokeOpacity="0.6" />
      <rect x="34" y="173" width="136" height="6" fill="#16130f" stroke={`url(#${id}-trim)`} strokeWidth="0.5" strokeOpacity="0.5" />
    </g>
  );
}
