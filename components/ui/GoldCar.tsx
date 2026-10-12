/**
 * Minimal top-down gold car for the Experience road. Drawn facing +x (right),
 * so rotating it by the path's tangent angle points it along the curve.
 */
export function GoldCar() {
  return (
    <svg viewBox="-46 -16 92 32" className="h-auto w-[92px] overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
          <stop offset="0.35" style={{ stopColor: "rgb(var(--a-200))" }} />
          <stop offset="0.7" style={{ stopColor: "rgb(var(--a-400))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--a-400))" }} />
        </linearGradient>
        <linearGradient id="car-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1612" />
          <stop offset="0.6" stopColor="#2b241c" />
          <stop offset="1" stopColor="#4a3c2a" />
        </linearGradient>
        <linearGradient id="car-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: "rgb(var(--a-200))" }} stopOpacity="0" />
        </linearGradient>
        <filter id="car-glow" x="-50%" y="-80%" width="200%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* headlight beams lighting the road ahead */}
      <path d="M14 -6 L40 -14 L40 -1 Z M14 6 L40 14 L40 1 Z" fill="url(#car-beam)" />

      <g filter="url(#car-glow)">
        {/* wheels */}
        {[
          [-11, -8.6],
          [-11, 6.4],
          [7, -8.6],
          [7, 6.4],
        ].map(([x, y]) => (
          <rect key={`${x}${y}`} x={x} y={y} width="6.5" height="2.2" rx="1" fill="#14110d" />
        ))}
        {/* body */}
        <path
          d="M-15 -6.2 C-15 -7.6 -13.8 -8 -12 -8 L6 -8 C11 -8 15 -6.5 16 -3 L16 3 C15 6.5 11 8 6 8 L-12 8 C-13.8 8 -15 7.6 -15 6.2 Z"
          fill="url(#car-body)"
          style={{ stroke: "rgb(var(--a-100))" }}
          strokeOpacity="0.55"
          strokeWidth="0.5"
        />
        {/* cabin glass */}
        <path d="M-8.5 -5.6 L4.5 -5.6 C7 -5.6 8.6 -3.6 8.6 0 C8.6 3.6 7 5.6 4.5 5.6 L-8.5 5.6 C-9.6 5.6 -10 4.8 -10 0 C-10 -4.8 -9.6 -5.6 -8.5 -5.6 Z" fill="url(#car-glass)" />
        {/* windscreen highlight + roof line */}
        <path d="M5.4 -4.2 C6.9 -2.8 6.9 2.8 5.4 4.2" fill="none" style={{ stroke: "rgb(var(--a-100))" }} strokeOpacity="0.55" strokeWidth="0.6" />
        <line x1="-7" y1="0" x2="3" y2="0" style={{ stroke: "rgb(var(--a-100))" }} strokeOpacity="0.18" strokeWidth="0.5" />
        {/* headlights */}
        <rect x="14.6" y="-5.6" width="1.6" height="2.6" rx="0.8" fill="#fff8e6" />
        <rect x="14.6" y="3" width="1.6" height="2.6" rx="0.8" fill="#fff8e6" />
        {/* tail lights */}
        <rect x="-15.4" y="-6" width="1.2" height="2.4" rx="0.6" fill="#ff9b4a" />
        <rect x="-15.4" y="3.6" width="1.2" height="2.4" rx="0.6" fill="#ff9b4a" />
      </g>
    </svg>
  );
}
