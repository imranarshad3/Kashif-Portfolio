/**
 * Professional experience, taken from the Employment History and Work History
 * sections of Kashif's own profile export (captured 3 Oct 2026).
 *
 * Companies from the private reference material whose relationship is unconfirmed are NOT
 * employers on record and are kept unpublished in `content/unpublished.ts`.
 */

export type ExperienceKind = "employment" | "contract" | "education";

export type Experience = {
  id: string;
  kind: ExperienceKind;
  organization: string;
  role: string;
  period: string;
  /** Sort key, YYYY-MM of start. */
  start: string;
  /** YYYY-MM of the last month, transcribed from `period`; omitted when current. */
  end?: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
  /** Related published project slug, only where the profile states the link. */
  projectSlug?: string;
  reviewId?: "c01" | "c02";
};

export const experience: Experience[] = [
  {
    id: "upwork-c03",
    kind: "contract",
    organization: "Upwork · Long-term partnership",
    role: "Senior React/TypeScript & Full-Stack Developer",
    period: "Aug 2026 — Present",
    start: "2026-08",
    current: true,
    summary: "Ongoing long-term full-stack engagement across the React/TypeScript frontend and Node.js services.",
    highlights: ["React and TypeScript frontend work", "Next.js and Node.js full-stack development"],
    stack: ["React", "TypeScript", "Next.js", "Node.js"],
  },
  {
    id: "upwork-c01",
    kind: "contract",
    organization: "Upwork · TCG platform",
    role: "Senior Full Stack AI Engineer (Python, RAG, LangGraph)",
    period: "Apr 2026 — Jul 2026",
    start: "2026-04",
    summary: "Extended a live trading-card-game platform's existing codebase with Python, RAG and LangGraph work.",
    highlights: ["Python RAG and LangGraph inside an existing production codebase", "Completed with a 5.0 client rating"],
    stack: ["Python", "RAG", "LangGraph"],
    reviewId: "c01",
  },
  {
    id: "upwork-c02",
    kind: "contract",
    organization: "Upwork · Cardex",
    role: "Full Stack Developer — Marketplace (React Native / Web)",
    period: "Mar 2026 — Apr 2026",
    start: "2026-03",
    summary: "Built the mobile and web app for the Cardex trading-card marketplace.",
    highlights: ["React Native companion app and web app", "Ticket-based delivery, completed with a 5.0 client rating"],
    stack: ["React Native", "Next.js", "NestJS"],
    projectSlug: "cardex",
    reviewId: "c02",
  },
  {
    id: "codefinity",
    kind: "employment",
    organization: "Codefinity Solutions",
    role: "Senior Software Engineer",
    period: "Jan 2025 — Present",
    start: "2025-01",
    current: true,
    summary:
      "Leading the design, development and deployment of scalable web applications, with full-stack work in React, JavaScript, Node.js and Python.",
    highlights: [
      "System architecture, RESTful APIs and SQL/NoSQL databases",
      "Cloud infrastructure on AWS and Azure with CI/CD pipelines",
      "Technical decision-making, code quality and cross-functional delivery",
    ],
    stack: ["React", "Node.js", "Python", "AWS", "Azure", "CI/CD"],
  },
  {
    id: "mysha-tech",
    kind: "employment",
    organization: "Mysha Tech",
    role: "Software Engineer (React.js)",
    period: "Mar 2024 — Jan 2025",
    start: "2024-03",
    end: "2025-01",
    summary: "Built scalable, high-performance web applications with React.js and modern JavaScript (ES6+).",
    highlights: [
      "Responsive, SEO-friendly UIs and REST API integration",
      "Frontend performance optimisation and UI/UX improvements",
      "Agile delivery with clean, reusable code",
    ],
    stack: ["React", "JavaScript", "REST APIs", "Git"],
  },
  {
    id: "zsystems",
    kind: "employment",
    organization: "Zsystems",
    role: "React.js Developer",
    period: "Jan 2022 — Feb 2024",
    start: "2022-01",
    end: "2024-02",
    summary: "Built dynamic, component-driven web interfaces with React.js and modern JavaScript.",
    highlights: [
      "Translated designs into pixel-perfect, responsive frontends",
      "Seamless data flow through API integrations",
      "Improved usability, code quality and maintainability in Agile sprints",
    ],
    stack: ["React", "JavaScript", "REST APIs"],
  },
  {
    id: "vu",
    kind: "education",
    organization: "Virtual University of Pakistan",
    role: "Bachelor of Computer Science",
    period: "2015 — 2019",
    start: "2015-09",
    summary: "Undergraduate degree in computer science.",
    highlights: [],
    stack: [],
  },
];

export const kindLabels: Record<ExperienceKind, string> = {
  employment: "Employment",
  contract: "Contract",
  education: "Education",
};

/** Companies shown in the "Companies & Products" showcase. */
export type CompanyCard = {
  name: string;
  relationship: "Employer" | "Product contribution";
  role: string;
  period?: string;
  summary: string;
  projectSlug?: string;
  url?: string;
};

export const companies: CompanyCard[] = [
  {
    name: "Codefinity Solutions",
    relationship: "Employer",
    role: "Senior Software Engineer",
    period: "2025 — Present",
    summary: "Full-stack development, system architecture and AWS/Azure cloud infrastructure with CI/CD.",
  },
  {
    name: "Mysha Tech",
    relationship: "Employer",
    role: "Software Engineer",
    period: "2024 — 2025",
    summary: "React.js applications, responsive SEO-friendly UIs and REST API integration.",
  },
  {
    name: "Zsystems",
    relationship: "Employer",
    role: "React.js Developer",
    period: "2022 — 2024",
    summary: "Component-driven React interfaces and API-driven data flow.",
  },
  {
    name: "Pear Protocol",
    relationship: "Product contribution",
    role: "FinTech Full-Stack Developer",
    summary: "Trading frontend, WebSocket market data, Python financial data and MCP integration.",
    projectSlug: "pear-protocol",
    url: "https://www.pear.garden/",
  },
  {
    name: "My SMSF",
    relationship: "Product contribution",
    role: "Full-Stack Developer",
    summary: "Data model, REST APIs, onboarding, calculators, dashboards and Stripe billing.",
    projectSlug: "smsf-investment-platform",
    url: "https://mysmsfproperty.com.au/",
  },
  {
    name: "Cardex",
    relationship: "Product contribution",
    role: "Full Stack AI Engineer",
    summary: "Next.js/NestJS marketplace, React Native app and LangChain card recognition.",
    projectSlug: "cardex",
  },
  {
    name: "Waltz-AI",
    relationship: "Product contribution",
    role: "Full-Stack Developer",
    summary: "AI content engine, Stripe credit wallets, SendGrid campaigns and Matomo analytics.",
    projectSlug: "waltz-ai",
    url: "https://waltz-ai.com/",
  },
  {
    name: "SureCam",
    relationship: "Product contribution",
    role: "Senior Full Stack AI Engineer",
    summary: "Full-stack AI engineering on a real-time GPS and video fleet platform.",
    projectSlug: "surecam",
    url: "https://surecam.com/",
  },
];
