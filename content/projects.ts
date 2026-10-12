/**
 * Canonical project dataset. Only projects that Kashif's own profile attributes to
 * him are published here. Each contribution is scoped to what that profile states.
 * Product-scale figures (e.g. Pear's volume) are platform context, not personal results.
 *
 * Unconfirmed reference projects live in `content/unpublished.ts`, which is never
 * imported by the site.
 */

export type ProjectCategory = "fintech" | "saas" | "ai" | "marketplace" | "data" | "frontend";

export const categoryLabels: Record<ProjectCategory, string> = {
  fintech: "FinTech",
  saas: "SaaS",
  ai: "AI & Automation",
  marketplace: "Marketplace & Mobile",
  data: "Data & Cloud",
  frontend: "Frontend & Motion",
};

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  role: string;
  /** Short public label describing Kashif's experience on the project. */
  experienceLabel: string;
  domain: string;
  categories: ProjectCategory[];
  summary: string;
  problem: string;
  contribution: string[];
  stack: string[];
  outcome: string;
  /** Contextual product facts, explicitly not personal results. */
  productContext?: string;
  url?: { href: string; label: string };
  image?: ProjectImage;
  /** Shown when there is no public screenshot: an architecture overview derived from the documented scope. */
  architecture?: { title: string; nodes: string[] };
  /** Only for projects with a directly associated completed review. */
  reviewId?: "c01" | "c02";
  accent: string;
};

const capturedNote = "Public product homepage captured 11 Oct 2026, shown for product context.";

export const projects: Project[] = [
  {
    slug: "pear-protocol",
    name: "Pear Protocol",
    tagline: "Pair & basket trading platform with AI trading signals and MCP integration",
    role: "FinTech Full-Stack Developer",
    experienceLabel: "FinTech Engineering",
    domain: "FinTech · DeFi trading",
    categories: ["fintech", "ai"],
    summary:
      "Worked on the Next.js trading frontend, the Node.js backend and WebSocket market data, and the Python financial-data layer that feeds the AI trading-signals engine, plus MCP integration.",
    problem:
      "Traders need one interface to go long and short on multiple crypto assets in a single position, with live financial data and execution integrations behind it.",
    contribution: [
      "Next.js trading frontend: long/short order entry, leverage, position sizing, live charts and market data",
      "Node.js backend and WebSocket real-time market data",
      "Python financial-data layer feeding the AI trading-signals engine",
      "MCP (Model Context Protocol) integration",
    ],
    stack: ["Next.js", "Node.js", "WebSockets", "Python", "MCP"],
    outcome: "A unified trading workflow with live financial information and AI-signal integration.",
    productContext:
      "Pear executes through the Hyperliquid and Symmio trading engines and reports $1.8B+ in platform volume from nearly 5,000 traders — platform figures, not personal results.",
    url: { href: "https://www.pear.garden/", label: "pear.garden" },
    image: {
      src: "/projects/pear-protocol.jpg",
      width: 1800,
      height: 1125,
      alt: "Pear Protocol homepage: 'The Home of Long/Short Trading' over a candlestick chart",
      caption: capturedNote,
    },
    accent: "#9be15d",
  },
  {
    slug: "smsf-investment-platform",
    name: "SMSF Investment Platform",
    tagline: "Property, crypto & gold administration for self-managed super funds",
    role: "Full-Stack Developer — Architecture, APIs & Payments",
    experienceLabel: "Architecture, APIs & Payments",
    domain: "FinTech · Property finance",
    categories: ["fintech", "saas"],
    summary:
      "Built a full-stack SMSF investment platform: designed the data model and REST APIs, then built client onboarding, investment-scenario calculators, secure dashboards and Stripe subscription billing.",
    problem:
      "Investors needed a working account-management product for property, crypto and gold — not just a marketing site — covering onboarding, investment scenarios and ongoing administration.",
    contribution: [
      "Data model and REST APIs",
      "Online client onboarding",
      "Investment-scenario calculators",
      "Secure client dashboards for ongoing account administration",
      "Stripe subscription billing with webhook handling, retry logic and idempotent event processing",
    ],
    stack: ["React", "Next.js", "PostgreSQL", "Stripe", "REST APIs"],
    outcome:
      "A production platform investors log into to manage real accounts. Webhook retries and idempotent processing are designed so payment events aren't silently lost or applied twice.",
    url: { href: "https://mysmsfproperty.com.au/", label: "mysmsfproperty.com.au" },
    image: {
      src: "/projects/mysmsf.jpg",
      width: 1800,
      height: 1125,
      alt: "My SMSF homepage: 'Fixed Fee SMSF Setup, Cheap Online Administration'",
      caption: capturedNote,
    },
    accent: "#6fa8ff",
  },
  {
    slug: "cardex",
    name: "Cardex",
    tagline: "Trading-card bounty marketplace on web and React Native",
    role: "Full Stack AI Engineer",
    experienceLabel: "Full-Stack & Mobile Development",
    domain: "Marketplace · Collectibles",
    categories: ["marketplace", "ai", "saas"],
    summary:
      "Built a full-stack marketplace platform (Next.js, NestJS) for Cardex plus a companion React Native app, with a LangChain AI layer for card recognition and bounty matching.",
    problem:
      "Collectors need one place to post bounties for rare cards, verify live pricing and find nearby traders — on web and mobile.",
    contribution: [
      "Next.js and NestJS marketplace platform",
      "Companion React Native mobile app, delivered in a separate contract",
      "AI chatbot layer (LangChain) for card recognition and bounty matching",
      "Card scanning, live pricing and buyer–seller discovery across web and mobile",
    ],
    stack: ["Next.js", "NestJS", "React Native", "LangChain"],
    outcome: "Bounties, live pricing, card scanning and trader discovery in one cross-platform product.",
    architecture: {
      title: "Platform overview",
      nodes: ["Next.js web", "React Native app", "NestJS API", "LangChain AI layer", "Card recognition", "Bounty matching"],
    },
    reviewId: "c02",
    accent: "#f0b25a",
  },
  {
    slug: "waltz-ai",
    name: "Waltz-AI",
    tagline: "Multi-tenant SaaS for building, publishing and optimising landing pages with AI",
    role: "Full-Stack Developer — AI, API Integrations & Automation",
    experienceLabel: "Full-Stack SaaS & AI Integration",
    domain: "SaaS · MarTech",
    categories: ["saas", "ai"],
    summary:
      "Contributed across a Next.js frontend and three backend services (FastAPI, NestJS, Prophet-API) sharing a Supabase Postgres schema across US/EU regions.",
    problem:
      "Agencies used separate tools for page creation, email marketing, CRM, journey automation and behavioural analytics.",
    contribution: [
      "AI content engine",
      "Stripe billing with credit wallets",
      "SendGrid campaigns",
      "Matomo-based analytics with forecasting",
      "Work across Next.js and FastAPI / NestJS / Prophet-API services on shared Supabase Postgres",
    ],
    stack: ["Next.js", "FastAPI", "NestJS", "Supabase", "PostgreSQL", "Stripe", "SendGrid", "Matomo"],
    outcome: "Agencies run full campaigns from one platform instead of several.",
    url: { href: "https://waltz-ai.com/", label: "waltz-ai.com" },
    image: {
      src: "/projects/waltz-ai.jpg",
      width: 1800,
      height: 1125,
      alt: "Waltz AI homepage: 'The quality you want, without the learning curve' with the website editor",
      caption: "Public product homepage (waltz-ai.com redirects to mywaltz.com) captured 11 Oct 2026, shown for product context.",
    },
    accent: "#3ddc97",
  },
  {
    slug: "legal-data-platform",
    name: "Legal Data & AI Analytics Platform",
    tagline: "Event-driven data warehouse and AI settlement analysis for a law firm",
    role: "Backend / Cloud Engineer",
    experienceLabel: "Backend & Cloud Engineering",
    domain: "Legal tech · Data engineering",
    categories: ["data", "ai"],
    summary:
      "Built an event-driven data platform for a personal-injury law firm, unifying case, intake and marketing data from four tools into one PostgreSQL warehouse.",
    problem:
      "Case, intake and marketing data was scattered across four tools, which made unified analysis and lead-to-case matching impractical.",
    contribution: [
      "Python AWS Lambda microservices and EventBridge pipelines",
      "Central PostgreSQL warehouse modelled with dbt",
      "Claude on Amazon Bedrock analysing case data to predict settlement values",
      "Automated lead-to-case matching and a unified analytics dashboard",
      "Infrastructure managed with Terraform",
    ],
    stack: ["Python", "AWS Lambda", "EventBridge", "PostgreSQL", "dbt", "Amazon Bedrock", "Claude", "Terraform"],
    outcome: "Unified case, intake and marketing data with automated lead matching and AI-assisted analytics.",
    architecture: {
      title: "Architecture overview",
      nodes: ["4 source tools", "Lambda + EventBridge", "PostgreSQL + dbt", "Bedrock · Claude", "Lead-to-case matching", "Analytics dashboard"],
    },
    accent: "#c9a46a",
  },
  {
    slug: "construction-ai-estimator",
    name: "AI Construction Estimating Platform",
    tagline: "Architectural drawings to costed estimates, with automated planning checks",
    role: "Backend & AI Developer",
    experienceLabel: "Backend & AI Development",
    domain: "Construction tech · PropTech",
    categories: ["ai", "saas"],
    summary:
      "Built the backend and AI system for an Australian construction-estimating platform that turns architectural drawings into costed estimates and checks planning compliance automatically.",
    problem: "Turning architectural drawings into costed estimates by hand is slow, and planning compliance has to be checked as well.",
    contribution: [
      "Backend for the estimating platform",
      "AI system converting architectural drawings into costed estimates",
      "Automated planning-compliance checks",
    ],
    stack: ["Backend APIs", "AI / LLM integration", "Document processing"],
    outcome: "Drawings become costed estimates with automated planning checks.",
    architecture: {
      title: "System overview",
      nodes: ["Architectural drawings", "AI interpretation", "Quantities", "Costed estimate", "Planning checks"],
    },
    accent: "#e2a15b",
  },
  {
    slug: "surecam",
    name: "SureCam",
    tagline: "AI fleet-management platform with real-time GPS and live video",
    role: "Senior Full Stack AI Engineer",
    experienceLabel: "Full-Stack AI Engineering",
    domain: "Fleet · IoT",
    categories: ["ai", "saas"],
    summary:
      "Senior full-stack AI engineering on SureCam, a fleet platform combining real-time GPS tracking, live video streaming, AI driver coaching and safety scoring.",
    problem:
      "Construction, utility and field-service fleets need visibility into vehicles and driver safety through GPS, video and coaching.",
    contribution: [
      "Senior full-stack AI engineering role on the platform",
      "Skills applied: Next.js, API development, AI tooling, real-time stream processing and GPS",
    ],
    stack: ["Next.js", "API Development", "Real-time streams", "GPS", "AI"],
    outcome: "An operational product bringing live GPS, video and AI coaching workflows together.",
    productContext: "SureCam reports use by commercial fleets across the US and UK — product context, not Kashif's direct clients.",
    url: { href: "https://surecam.com/", label: "surecam.com" },
    image: {
      src: "/projects/surecam.jpg",
      width: 1800,
      height: 1125,
      alt: "SureCam homepage: 'Dash Cams Built for Commercial Fleets' beside dash-cam footage",
      caption: capturedNote,
    },
    accent: "#43b4f0",
  },
  {
    slug: "red-panda",
    name: "Red Panda",
    tagline: "Responsive, motion-rich landing page for a game product",
    role: "Frontend Engineer",
    experienceLabel: "Frontend & Motion",
    domain: "Gaming · Marketing site",
    categories: ["frontend"],
    summary:
      "Developed the responsive frontend for Red Panda, a game-focused web project showcasing the product, its features and platform availability.",
    problem: "Present a game product, its features and platform availability clearly and attractively across devices.",
    contribution: [
      "Responsive Next.js / React frontend",
      "Three.js and motion-design presentation",
      "Clear navigation and call-to-action sections",
    ],
    stack: ["React", "Next.js", "Three.js", "Animation", "Responsive design"],
    outcome: "A polished, responsive product website with clear navigation and strong calls to action.",
    architecture: {
      title: "Frontend overview",
      nodes: ["Next.js", "React components", "Three.js scenes", "Motion design", "Responsive layout"],
    },
    accent: "#ff7a59",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const projectCategories = (Object.keys(categoryLabels) as ProjectCategory[]).filter((c) =>
  projects.some((p) => p.categories.includes(c)),
);
