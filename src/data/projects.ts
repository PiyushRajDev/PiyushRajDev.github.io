export type PortfolioProject = {
  number: string;
  name: string;
  category: string;
  summary: string;
  engineering: string;
  stack: readonly string[];
  repository: string;
  live?: string;
};

export const projects: readonly PortfolioProject[] = [
  {
    number: "01",
    name: "Vāk",
    category: "MULTILINGUAL REAL-TIME VOICE",
    summary:
      "A shared voice room where each participant hears speech translated into their own language while retaining the original speaker's voice.",
    engineering:
      "The core challenge is the live audio pipeline: capture, speech recognition, translation, synthesis and delivery, coordinated around room state.",
    stack: ["React", "Node.js", "WebSocket", "Gnani", "Sarvam"],
    repository: "https://github.com/PiyushRajDev/vak",
    live: "https://vak-amber.vercel.app",
  },
  {
    number: "02",
    name: "OASIX",
    category: "MARKETING INTELLIGENCE",
    summary:
      "A marketing intelligence workspace that helps brands read public content signals and spot opportunities across social platforms.",
    engineering:
      "An agent-oriented approach to social listening, trend discovery and sentiment signals, aimed at turning scattered activity into useful campaign decisions.",
    stack: ["React", "Vite", "GSAP", "AI agents", "Social signals"],
    repository: "https://github.com/PiyushRajDev/Oasix",
    live: "https://oasix.in",
  },
  {
    number: "03",
    name: "SkillLighthouse",
    category: "ENGINEERING READINESS",
    summary:
      "An interview and code-readiness workspace combining company-specific practice with evidence from GitHub and coding profiles.",
    engineering:
      "Built around explainable readiness signals, with API and worker flows for analysing project and coding evidence.",
    stack: ["TypeScript", "React", "PostgreSQL", "Prisma", "Redis", "BullMQ"],
    repository: "https://github.com/PiyushRajDev/slh",
  },
  {
    number: "04",
    name: "MetaSpace",
    category: "REAL-TIME COLLABORATION",
    summary:
      "A 2D virtual collaboration space where proximity shapes live audio and video between people sharing a room.",
    engineering:
      "Combines a real-time media layer with spatial interaction, presence and persistent collaboration state.",
    stack: ["Next.js", "PixiJS", "LiveKit", "Express", "PostgreSQL", "WebSocket"],
    repository: "https://github.com/PiyushRajDev/metaspace",
  },
  {
    number: "05",
    name: "StyleSense",
    category: "PRODUCT DISCOVERY INFRASTRUCTURE",
    summary:
      "A product discovery backend built around searchable catalogs, faceted filtering and recommendation signals.",
    engineering:
      "Uses Elasticsearch for catalog search, Redis Streams for behavioural events and PostgreSQL for persistent product data.",
    stack: ["NestJS", "PostgreSQL", "Elasticsearch", "Redis Streams", "Docker"],
    repository: "https://github.com/PiyushRajDev/trendy",
  },
] as const;
