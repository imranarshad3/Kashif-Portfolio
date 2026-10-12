export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <defs>
          <linearGradient id="k-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "rgb(var(--a-100))" }} />
            <stop offset="0.6" style={{ stopColor: "rgb(var(--a-300))" }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--a-400))" }} />
          </linearGradient>
        </defs>
        <path d="M7 3h4.2v11.4L22 3h5.2L16.4 14.2 28 29h-5.3l-9.1-11.8-2.4 2.5V29H7z" fill="url(#k-gold)" />
      </svg>
      <span className="font-display text-[15px] font-medium tracking-[0.28em] text-text">KASHIF</span>
    </span>
  );
}
