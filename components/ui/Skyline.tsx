import { seededSkyline } from "@/lib/skyline";

/** Dusk city silhouette with a thin gold rim — echoes the hero window at the end of the page. */
export function Skyline({ className = "" }: { className?: string }) {
  const { outline, windows } = seededSkyline(11);
  return (
    <svg data-skyline aria-hidden viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" className={className}>
      <defs>
        <linearGradient id="sky-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15100f" />
          <stop offset="1" stopColor="#060608" />
        </linearGradient>
        <linearGradient id="sky-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "rgb(var(--a-200))" }} stopOpacity="0" />
          <stop offset="0.25" style={{ stopColor: "rgb(var(--a-200))" }} stopOpacity="0.7" />
          <stop offset="0.75" style={{ stopColor: "rgb(var(--a-300))" }} stopOpacity="0.7" />
          <stop offset="1" style={{ stopColor: "rgb(var(--a-200))" }} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${outline} L1440 260 L0 260 Z`} fill="url(#sky-fill)" />
      <path data-skyline-rim d={outline} fill="none" stroke="url(#sky-rim)" strokeWidth="1.2" />
      <g data-skyline-windows fill="#ffc98a">
        {windows.map(([x, y, o], i) => (
          <rect key={i} x={x} y={y} width="3" height="4" opacity={o} />
        ))}
      </g>
    </svg>
  );
}
