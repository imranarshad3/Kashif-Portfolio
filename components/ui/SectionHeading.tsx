export function SectionHeading({
  index,
  label,
  eyebrow,
  title,
  description,
  id,
}: {
  index: string;
  label: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  id?: string;
}) {
  return (
    <div data-reveal-group>
      <div data-reveal className="flex items-baseline gap-5">
        <span className="section-index">{index}</span>
        <span className="text-[13px] font-semibold tracking-[0.26em] text-text">{label}</span>
      </div>
      <p data-reveal data-scramble className="eyebrow mt-5">
        {eyebrow}
      </p>
      <h2 id={id} data-split className="mt-4 font-display text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.015em]">
        {title}
      </h2>
      {description && (
        <p data-reveal className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
