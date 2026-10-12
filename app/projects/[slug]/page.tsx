import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Quote } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProjectVisual } from "@/components/ui/ProjectVisual";
import { Stars } from "@/components/ui/Stars";
import { CaseStudyMotion } from "@/components/CaseStudyMotion";
import { NextProjectTeaser } from "@/components/NextProjectTeaser";
import { Suspense, ViewTransition } from "react";
import { shotName } from "@/lib/shotName";
import { categoryLabels, getProject, projects } from "@/content/projects";
import { profile } from "@/content/profile";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: `${project.name} — Case study`, description: project.summary };
}

export default function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  // Nav and footer belong to the static shell; params are read inside the Suspense boundary
  // (required with partial prefetching, so unlisted slugs can stream instead of blocking).
  return (
    <>
      <Nav onHome={false} />
      <Suspense fallback={<main className="min-h-svh" />}>
        <CaseStudy params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function CaseStudy({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const review = project.reviewId ? profile.reviews.find((r) => r.id === project.reviewId) : undefined;

  return (
    <CaseStudyMotion slug={project.slug}>
      <main className="relative overflow-hidden pt-28 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full blur-[150px]" style={{ background: `${project.accent}22` }} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <Link href="/#projects" data-cs className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-gold-bright">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All projects
          </Link>

          <header className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p data-cs data-cs-scramble className="eyebrow">
                {project.domain}
              </p>
              <h1 data-cs-split className="mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                {project.name}
              </h1>
              <p data-cs className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
                {project.tagline}
              </p>
            </div>
            <dl data-cs className="glass grid grid-cols-2 gap-4 rounded-2xl p-5 text-[13px]">
              <div className="col-span-2">
                <dt className="text-faint">My role</dt>
                <dd className="mt-1 text-text">{project.role}</dd>
              </div>
              <div>
                <dt className="text-faint">Categories</dt>
                <dd className="mt-1 text-text">{project.categories.map((c) => categoryLabels[c]).join(", ")}</dd>
              </div>
              {review ? (
                <div>
                  <dt className="text-faint">Client rating</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-gold-bright">
                    5.0 <Stars rating={5} label="Client rating: 5 out of 5" size="sm" />
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-faint">Experience</dt>
                  <dd className="mt-1 text-text">{project.experienceLabel}</dd>
                </div>
              )}
              {project.url && (
                <div className="col-span-2">
                  <a href={project.url.href} target="_blank" rel="noopener noreferrer" className="btn-gold w-full justify-center">
                    Visit {project.url.label} <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              )}
            </dl>
          </header>

          <figure data-cs-visual className="mt-12 [perspective:1600px]">
            <div className="glass overflow-hidden rounded-[24px] p-2.5">
              <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-1">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} className="h-2.5 w-2.5 rounded-full opacity-70" style={{ background: c }} />
                ))}
                {project.url && <span className="ml-3 truncate text-[11px] text-faint">{project.url.label}</span>}
              </div>
              <ViewTransition name={shotName(project.slug)} share="morph" default="none">
                <div className={`relative overflow-hidden rounded-[16px] border border-white/10 bg-black ${project.image ? "aspect-[16/10]" : "aspect-[16/7]"}`}>
                  <div data-cs-parallax className="absolute inset-0">
                    <ProjectVisual project={project} sizes="(min-width: 1152px) 1100px, 100vw" preload />
                  </div>
                </div>
              </ViewTransition>
            </div>
            {project.image && <figcaption className="mt-3 text-[12px] text-faint">{project.image.caption}</figcaption>}
          </figure>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-12">
              <section data-cs-block aria-labelledby="overview">
                <h2 id="overview" className="font-display text-2xl text-text">Overview</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{project.summary}</p>
              </section>
              <section data-cs-block aria-labelledby="problem">
                <h2 id="problem" className="font-display text-2xl text-text">The problem</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{project.problem}</p>
              </section>
              <section data-cs-block aria-labelledby="contribution">
                <h2 id="contribution" className="font-display text-2xl text-text">What I built</h2>
                <ul className="mt-5 space-y-3">
                  {project.contribution.map((c) => (
                    <li key={c} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
              <section data-cs-block aria-labelledby="outcome">
                <h2 id="outcome" className="font-display text-2xl text-text">Outcome</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{project.outcome}</p>
                {project.productContext && <p className="mt-3 text-[13px] leading-relaxed text-faint">{project.productContext}</p>}
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div data-cs-block className="glass rounded-2xl p-6">
                <h2 className="text-[12px] uppercase tracking-[0.2em] text-faint">Technology</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <li key={t} className="chip px-3! py-1! text-[12px]! text-text!">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              {review && (
                <figure data-cs-block className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-[13px] text-gold-bright">
                    5.0 <Stars rating={5} label="Client rating: 5 out of 5" size="sm" />
                  </div>
                  <blockquote className="mt-3 text-[14px] italic leading-relaxed text-text/85">
                    <Quote className="mr-1 inline h-3 w-3 -translate-y-1 text-gold" aria-hidden />
                    {review.quote}
                  </blockquote>
                  <figcaption className="mt-3 text-[11px] text-faint">
                    {review.author} · {review.engagement}
                  </figcaption>
                </figure>
              )}
              <div data-cs-block className="glass rounded-2xl p-6">
                <p className="text-sm text-text">Building something similar?</p>
                <a href={profile.upworkUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4">
                  Message on Upwork <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </aside>
          </div>

          <NextProjectTeaser next={next} prev={prev} />
        </div>
      </main>
    </CaseStudyMotion>
  );
}
