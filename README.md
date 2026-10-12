# Kashif Saeed — Portfolio

Dark-luxury 3D portfolio built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4,
Three.js / React Three Fiber / Drei and GSAP ScrollTrigger.

## Run

Requires Node.js ≥ 20.9.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build && npm start
```

## Editing content

All public content lives in typed files under `content/`:

| File | What it controls |
|---|---|
| `content/profile.ts` | Name, bio, availability, rate, reviews, certifications, contact channels, photo, resume |
| `content/projects.ts` | Project cards, filters and `/projects/[slug]` case studies |
| `content/experience.ts` | Experience timeline and "Companies I've Worked With" |
| `content/skills.ts` | Skill groups, tiles and skill → project mappings |
| `content/unpublished.ts` | **Private.** Unconfirmed companies/projects. Not imported anywhere, never shipped |

Contact channels (`email`, `linkedin`, `github`, `twitter`), `photo` and `resumeUrl` are `null` until supplied;
each one appears on the site automatically once set.

Project screenshots are in `public/projects/` (public homepages captured 11 Oct 2026 at 1440×900).

## Structure

- `components/three/` — procedural office scene (hero) and crystal (skills), lazy-loaded, paused offscreen
- `components/sections/` — page sections; GSAP animations are scoped per section and reverted on unmount
- `lib/hooks.ts` — media-query, WebGL detection, viewport and GSAP-context hooks
- `components/SmoothScroll.tsx` + `lib/scroll.ts` — Lenis inertial scrolling synced to GSAP's ticker; use
  `scrollToTarget()` for any programmatic scroll so it eases the same way as the nav

`prefers-reduced-motion` disables scroll-scrubbed motion, pinning and camera movement. Without WebGL the 3D
scenes fall back to static CSS visuals.
