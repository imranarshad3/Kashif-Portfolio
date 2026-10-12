/**
 * Skills from Kashif's profile. `projects` lists only documented project mappings
 * (03_PROJECT_URLS_AND_CONTENT_MAP.md §D and the profile's portfolio items);
 * profile-level skills without a named project keep an empty list rather than a guessed one.
 */

export type SkillGroupId = "backend" | "ai" | "frontend" | "data" | "cloud" | "payments";

export type Skill = {
  name: string;
  /** simple-icons export name, when a brand mark exists. */
  icon?: string;
  /** Short glyph used when there is no brand mark. */
  glyph?: string;
  group: SkillGroupId;
  projects: string[];
  /** Upwork contract ids where the skill is in the contract title/skills. */
  engagements?: string[];
  featured?: boolean;
};

export const skillGroups: { id: SkillGroupId; label: string }[] = [
  { id: "backend", label: "Python, Backend & APIs" },
  { id: "ai", label: "AI, Agents & RAG" },
  { id: "frontend", label: "Frontend & Mobile" },
  { id: "data", label: "Data" },
  { id: "cloud", label: "Cloud & DevOps" },
  { id: "payments", label: "Payments & Integrations" },
];

export const skills: Skill[] = [
  // Python, Backend & APIs — Python first by design.
  { name: "Python", icon: "siPython", group: "backend", projects: ["pear-protocol", "legal-data-platform", "waltz-ai"], engagements: ["upwork-c01"], featured: true },
  { name: "FastAPI", icon: "siFastapi", group: "backend", projects: ["waltz-ai"] },
  { name: "Node.js", icon: "siNodedotjs", group: "backend", projects: ["pear-protocol"], engagements: ["upwork-c03"], featured: true },
  { name: "NestJS", icon: "siNestjs", group: "backend", projects: ["cardex", "waltz-ai"], featured: true },
  { name: "Express", icon: "siExpress", group: "backend", projects: [] },
  { name: "REST APIs", glyph: "{ }", group: "backend", projects: ["smsf-investment-platform", "surecam"] },
  { name: "WebSockets", icon: "siSocketdotio", group: "backend", projects: ["pear-protocol"] },

  // AI
  { name: "Claude / Anthropic", icon: "siAnthropic", group: "ai", projects: ["legal-data-platform"], featured: true },
  { name: "OpenAI API", glyph: "AI", group: "ai", projects: [] },
  { name: "LangChain", icon: "siLangchain", group: "ai", projects: ["cardex"], featured: true },
  { name: "LangGraph", icon: "siLanggraph", group: "ai", projects: [], engagements: ["upwork-c01"] },
  { name: "RAG", glyph: "RAG", group: "ai", projects: [], engagements: ["upwork-c01"] },
  { name: "MCP", icon: "siModelcontextprotocol", group: "ai", projects: ["pear-protocol"] },
  { name: "Vector search", glyph: "⌁", group: "ai", projects: [] },
  { name: "n8n automation", icon: "siN8n", group: "ai", projects: [] },

  // Frontend & Mobile
  { name: "React", icon: "siReact", group: "frontend", projects: ["smsf-investment-platform", "red-panda"], engagements: ["upwork-c03"], featured: true },
  { name: "Next.js", icon: "siNextdotjs", group: "frontend", projects: ["pear-protocol", "smsf-investment-platform", "cardex", "waltz-ai", "surecam", "red-panda"], engagements: ["upwork-c03"], featured: true },
  { name: "TypeScript", icon: "siTypescript", group: "frontend", projects: [], engagements: ["upwork-c03"], featured: true },
  { name: "JavaScript", icon: "siJavascript", group: "frontend", projects: [] },
  { name: "React Native", icon: "siReact", group: "frontend", projects: ["cardex"], engagements: ["upwork-c02"] },
  { name: "Three.js", icon: "siThreedotjs", group: "frontend", projects: ["red-panda"] },

  // Data
  { name: "PostgreSQL", icon: "siPostgresql", group: "data", projects: ["smsf-investment-platform", "legal-data-platform", "waltz-ai"], featured: true },
  { name: "Supabase", icon: "siSupabase", group: "data", projects: ["waltz-ai"] },
  { name: "Redis", icon: "siRedis", group: "data", projects: [] },
  { name: "MongoDB", icon: "siMongodb", group: "data", projects: [] },
  { name: "dbt", glyph: "dbt", group: "data", projects: ["legal-data-platform"] },

  // Cloud & DevOps
  { name: "AWS", glyph: "AWS", group: "cloud", projects: ["legal-data-platform"], featured: true },
  { name: "Lambda & EventBridge", glyph: "λ", group: "cloud", projects: ["legal-data-platform"] },
  { name: "Amazon Bedrock", glyph: "BR", group: "cloud", projects: ["legal-data-platform"] },
  { name: "Terraform", icon: "siTerraform", group: "cloud", projects: ["legal-data-platform"] },
  { name: "Docker", icon: "siDocker", group: "cloud", projects: [], featured: true },
  { name: "CI/CD", glyph: "CI", group: "cloud", projects: [] },

  // Payments & Integrations
  { name: "Stripe", icon: "siStripe", group: "payments", projects: ["smsf-investment-platform", "waltz-ai"], featured: true },
  { name: "Webhooks", glyph: "↻", group: "payments", projects: ["smsf-investment-platform"] },
  { name: "SendGrid", glyph: "SG", group: "payments", projects: ["waltz-ai"] },
  { name: "Matomo", icon: "siMatomo", group: "payments", projects: ["waltz-ai"] },
];

export const engagementLabels: Record<string, string> = {
  "upwork-c01": "TCG platform AI engagement (Python, RAG, LangGraph)",
  "upwork-c02": "Cardex marketplace — React Native / Web",
  "upwork-c03": "Long-term React/TypeScript partnership",
};
