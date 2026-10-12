/**
 * Public profile content. Every value here is taken from Kashif's own profile
 * export in the private source documentation (kept out of the repository)
 * or the later availability instruction (20–30 hrs/week, $25/hr).
 *
 * Optional contact channels are `null` until Kashif supplies them. The UI only
 * renders a channel when its value is set, so filling one in here is enough.
 */

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
};

export const profile = {
  name: "Kashif Saeed",
  shortName: "Kashif",
  title: "Full-Stack Engineer",
  positioning: "FinTech, SaaS & AI Products",
  location: "Lahore, Pakistan",
  currentRole: { title: "Senior Software Engineer", company: "Codefinity Solutions", since: "Jan 2025" },
  availability: "20–30 hrs/week",
  rate: "$25/hr",
  upworkUrl: "https://www.upwork.com/freelancers/~01044da7d47724c875",

  /** Not supplied yet. Set a path under /public (e.g. "/kashif.jpg") to show a portrait in About. */
  photo: "/kashif-portrait.jpg" as string | null,
  /** Same photo, resized to 168×210 for the small hero badge on phones/tablets. */
  photoBadge: "/kashif-portrait-badge.jpg" as string | null,
  /** Not supplied yet. Set a path under /public (e.g. "/kashif-saeed-resume.pdf") to show the Resume button. */
  resumeUrl: null as string | null,

  /** Not supplied in the documentation. Fill in to render the matching contact card. */
  email: null as string | null,
  linkedin: null as string | null,
  github: null as string | null,
  twitter: null as string | null,

  intro:
    "I build full-stack products for FinTech, SaaS and AI — from the data model and API design through to a production deployment your users can actually log into.",

  bio: [
    "I'm Kashif, a full-stack engineer working across FinTech, SaaS and AI products. My focus is the part of a product that has to be right: payments, account data, dashboards and the integrations that keep them in sync.",
    "I start with what the product needs to do and who's using it, then design the data model and API around that before touching the UI. You get typed, maintainable code, clear written updates and architecture decisions you can actually follow.",
  ],

  howIWork: [
    { title: "Requirements first", text: "Start from the product's users and workflow, then agree a practical scope and first milestone." },
    { title: "Data & API design", text: "Design the schema and API contracts before the UI, so other services can integrate with confidence." },
    { title: "Build end to end", text: "Frontend, backend, integrations and deployment — authentication, payments and dashboards included." },
    { title: "Reliable by design", text: "Idempotent webhooks, retries and background jobs that recover cleanly instead of failing silently." },
  ],

  education: { school: "Virtual University of Pakistan", degree: "Bachelor of Computer Science", years: "2015 – 2019" },

  certifications: [
    { name: "AWS Certified DevOps Engineer", issuer: "Amazon Web Services", issued: "Jan 2024" },
    { name: "Full-Stack Developer path", issuer: "Pluralsight", issued: "Mar 2023" },
  ],

  /** Exact review text from the two completed Upwork contracts. Client names were not supplied. */
  reviews: [
    {
      id: "c02",
      rating: 5,
      engagement: "Full Stack Developer — TCG Marketplace Platform (React Native / Web App)",
      quote:
        "Kashif performed each task well and finished tickets quickly. He did an excellent job communicating with me and made sure that my app is working well and looks professional. I would hire him again.",
      author: "Upwork client",
    },
    {
      id: "c01",
      rating: 5,
      engagement: "Senior Full Stack AI Engineer (Python, RAG, LangGraph) — TCG Platform",
      quote:
        "Kashif was great to work with and I would definitely hire him again. He was easy to work with and completed each task efficiently.",
      author: "Upwork client",
    },
  ],
} as const;

export function contactChannels(): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (profile.email) channels.push({ label: "Email", value: profile.email, href: `mailto:${profile.email}` });
  if (profile.linkedin) channels.push({ label: "LinkedIn", value: profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: profile.linkedin });
  if (profile.github) channels.push({ label: "GitHub", value: profile.github.replace(/^https?:\/\/(www\.)?/, ""), href: profile.github });
  if (profile.twitter) channels.push({ label: "X / Twitter", value: profile.twitter.replace(/^https?:\/\/(www\.)?/, ""), href: profile.twitter });
  channels.push({ label: "Upwork", value: "Kashif S. · Message on Upwork", href: profile.upworkUrl });
  return channels;
}
