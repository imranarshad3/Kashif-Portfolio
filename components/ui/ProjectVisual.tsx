import Image from "next/image";
import type { Project } from "@/content/projects";

/** Real screenshot when one exists; otherwise a labelled architecture overview built from the documented scope. */
export function ProjectVisual({ project, sizes, preload = false }: { project: Project; sizes: string; preload?: boolean }) {
  if (project.image) {
    return (
      <Image
        src={project.image.src}
        alt={project.image.alt}
        width={project.image.width}
        height={project.image.height}
        sizes={sizes}
        preload={preload}
        className="h-full w-full object-cover object-top"
      />
    );
  }
  const arch = project.architecture;
  return (
    <div
      role="img"
      aria-label={`${arch?.title ?? "Overview"} of ${project.name}: ${arch?.nodes.join(", ")}`}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_30%_0%,rgb(var(--a-200)/0.12),transparent_60%),linear-gradient(160deg,#16130f,#0a0908)] p-5"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <p className="relative text-[10px] uppercase tracking-[0.22em]" style={{ color: project.accent }}>
        {arch?.title}
      </p>
      <ol className="relative flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {arch?.nodes.map((n, i) => (
          <li key={n} className="flex items-center gap-1.5">
            <span className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {n}
            </span>
            {i < (arch?.nodes.length ?? 0) - 1 && (
              <span aria-hidden className="text-[10px]" style={{ color: project.accent }}>
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="relative font-display text-lg text-text/90">{project.name}</p>
    </div>
  );
}
