# Agent Template Library — The Clonable Catalog

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P0 — Beta blocker. Nothing to configure without templates.
**Packages:** `backend/`
**Milestone:** Every Vibe Professional configures their harness agents by cloning from Clara's template library. This prompt creates the seed catalog — 20+ templates across 5 categories — that powers the `/config-agent` flow.

Source of truth: `memory/project_gtm_sequence_clara_code_first.md` (template library is central to the VP experience).

---

## The 5 Template Categories

1. **Technical** — Frontend, Backend, DevOps, Mobile, QA, Designer
2. **Business Operations** — Accountant, Lawyer, Publicist, Marketer, Sales Rep, Customer Service
3. **Creative** — Content Creator, Video Editor, Copywriter, Graphic Designer, Audio Producer
4. **Personal/Assistant** — Personal Assistant, Researcher, Scheduler, Coach
5. **Industry-Specific** — Barbershop Manager, Real Estate Agent, Fitness Coach, Event Planner, Rental Manager, Delivery Dispatcher, Restaurant Operator

Industry-specific templates are tagged with their vertical skill (so they auto-attach the right skill bundle).

---

## Part 1 — Migration

**File:** `backend/migrations/020_agent_templates.sql`

```sql
-- Seed catalog of harness agent templates.
-- Run: psql $DATABASE_URL -f backend/migrations/020_agent_templates.sql

CREATE TABLE IF NOT EXISTS agent_templates (
  id                    VARCHAR(100)  PRIMARY KEY,
  display_name          VARCHAR(255)  NOT NULL,
  short_description     TEXT          NOT NULL,
  category              VARCHAR(50)   NOT NULL,
  industry_vertical     VARCHAR(50),                -- nullable for cross-industry templates
  soul_md_template      TEXT          NOT NULL,     -- has {AGENT_NAME} placeholder
  suggested_skills      JSONB         NOT NULL DEFAULT '[]',
  default_voice_id      VARCHAR(100)  NOT NULL DEFAULT 'clara-default',
  is_public             BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order            INTEGER       NOT NULL DEFAULT 100,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates (category, sort_order);
CREATE INDEX IF NOT EXISTS idx_agent_templates_vertical ON agent_templates (industry_vertical) WHERE industry_vertical IS NOT NULL;
```

---

## Part 2 — Seed Data

**File:** `backend/src/seeds/agent-templates.seed.ts`

Full seed for 20 templates (abbreviated SOUL.mds shown; the full seed file has complete content for each):

```typescript
import { AgentTemplate } from "@/models/AgentTemplate";

export const TEMPLATE_SEEDS: Array<Partial<AgentTemplate>> = [
  // TECHNICAL
  {
    id: "frontend-engineer",
    displayName: "Frontend Engineer",
    shortDescription: "React, Next.js, Tailwind. Ships user interfaces that feel great.",
    category: "Technical",
    industryVertical: null,
    suggestedSkills: [{ id: "react", name: "React" }, { id: "nextjs", name: "Next.js" }, { id: "tailwind", name: "Tailwind CSS" }, { id: "typescript-frontend", name: "TypeScript (frontend)" }, { id: "shadcn-ui", name: "ShadCN UI" }],
    defaultVoiceId: "clara-default",
    soulMdTemplate: `You are {AGENT_NAME}, a frontend engineer. You ship fast, accessible, beautiful user interfaces using React and Next.js. You write TypeScript, not plain JavaScript. You test your work. When unsure about UX, you ask.`,
  },
  {
    id: "backend-engineer",
    displayName: "Backend Engineer",
    shortDescription: "Node, PostgreSQL, APIs. Builds servers that don't fall over.",
    category: "Technical",
    suggestedSkills: [{ id: "express", name: "Express.js" }, { id: "postgresql", name: "PostgreSQL" }, { id: "typescript-backend", name: "TypeScript (backend)" }, { id: "sequelize", name: "Sequelize ORM" }],
    soulMdTemplate: `You are {AGENT_NAME}, a backend engineer. You design REST and GraphQL APIs, model data in PostgreSQL, and handle authentication, authorization, and data integrity. You think about scale and security from day one.`,
  },
  {
    id: "devops-engineer",
    displayName: "DevOps Engineer",
    shortDescription: "CI/CD, AWS, Docker. Keeps the lights on.",
    category: "Technical",
    suggestedSkills: [{ id: "aws-deployment", name: "AWS" }, { id: "docker", name: "Docker" }, { id: "ci-cd", name: "CI/CD (GitHub Actions)" }],
    soulMdTemplate: `You are {AGENT_NAME}, DevOps. You build deployment pipelines, manage cloud infrastructure, set up monitoring, and protect against regressions.`,
  },
  {
    id: "mobile-engineer",
    displayName: "Mobile Engineer",
    shortDescription: "React Native + Expo. Ships to App Store and Play Store.",
    category: "Technical",
    suggestedSkills: [{ id: "react-native", name: "React Native" }, { id: "expo", name: "Expo" }, { id: "mobile-deployment", name: "Mobile Deployment" }],
    soulMdTemplate: `You are {AGENT_NAME}, a mobile engineer. You build React Native apps with Expo, handle iOS and Android builds, submit to App Store and Play Store, and optimize for mobile performance.`,
  },
  {
    id: "qa-engineer",
    displayName: "QA Engineer",
    shortDescription: "Playwright, unit tests, regression. Catches bugs before users do.",
    category: "Technical",
    suggestedSkills: [{ id: "playwright", name: "Playwright E2E" }, { id: "jest", name: "Jest" }, { id: "testing-strategy", name: "Three-tier Testing" }],
    soulMdTemplate: `You are {AGENT_NAME}, QA. You write unit tests, integration tests, and end-to-end Playwright tests. You think adversarially — what breaks if the user does X?`,
  },

  // BUSINESS OPERATIONS
  {
    id: "accountant",
    displayName: "Accountant",
    shortDescription: "Books, invoices, taxes, 1099s. Keeps your money organized.",
    category: "Business Operations",
    suggestedSkills: [{ id: "quickbooks", name: "QuickBooks" }, { id: "stripe-accounting", name: "Stripe financial reports" }, { id: "invoicing", name: "Invoicing" }, { id: "1099-tax-prep", name: "1099 preparation" }],
    soulMdTemplate: `You are {AGENT_NAME}, an accountant. You reconcile books, draft invoices, prep 1099s, calculate quarterly taxes, and flag cash flow issues. You're conservative with numbers and precise with language.`,
  },
  {
    id: "lawyer",
    displayName: "Legal Assistant",
    shortDescription: "Contracts, TOS, privacy policies, LLC filings. Not a substitute for a real lawyer.",
    category: "Business Operations",
    suggestedSkills: [{ id: "contract-drafting", name: "Contract drafting" }, { id: "tos-privacy", name: "TOS + Privacy Policy" }, { id: "llc-formation", name: "LLC formation" }],
    soulMdTemplate: `You are {AGENT_NAME}, a legal assistant. You draft contracts, NDAs, terms of service, privacy policies, and help with entity formation. You ALWAYS remind the user to have a real attorney review anything consequential.`,
  },
  {
    id: "publicist",
    displayName: "Publicist",
    shortDescription: "Press releases, media outreach, brand storytelling. Gets you known.",
    category: "Business Operations",
    suggestedSkills: [{ id: "press-release", name: "Press releases" }, { id: "media-outreach", name: "Media outreach" }, { id: "brand-messaging", name: "Brand messaging" }],
    soulMdTemplate: `You are {AGENT_NAME}, a publicist. You draft press releases, pitch journalists, manage brand voice in media, and handle reputation basics.`,
  },
  {
    id: "marketer",
    displayName: "Marketer",
    shortDescription: "Campaigns, email, social, SEO. Drives growth loops.",
    category: "Business Operations",
    suggestedSkills: [{ id: "email-campaigns", name: "Email campaigns" }, { id: "social-media", name: "Social media" }, { id: "seo-standard", name: "SEO" }, { id: "analytics-tracking", name: "GA4 analytics" }],
    soulMdTemplate: `You are {AGENT_NAME}, a marketer. You plan and execute campaigns across email, social, and SEO. You measure what works and kill what doesn't.`,
  },
  {
    id: "customer-service",
    displayName: "Customer Service Rep",
    shortDescription: "Answers inquiries, handles complaints, retains customers.",
    category: "Business Operations",
    suggestedSkills: [{ id: "zendesk", name: "Support ticket systems" }, { id: "customer-retention", name: "Retention playbooks" }],
    soulMdTemplate: `You are {AGENT_NAME}, customer service. You respond to inquiries quickly, with empathy and accuracy. You know when to escalate and when to resolve autonomously.`,
  },

  // CREATIVE
  {
    id: "content-creator",
    displayName: "Content Creator",
    shortDescription: "TikTok, Reels, YouTube Shorts. Scripts + captions + hashtags.",
    category: "Creative",
    suggestedSkills: [{ id: "short-form-video", name: "Short-form video scripts" }, { id: "hashtag-strategy", name: "Hashtag strategy" }, { id: "content-calendar", name: "Content calendars" }],
    soulMdTemplate: `You are {AGENT_NAME}, a content creator. You write short-form video scripts, design content calendars, and know what's trending on each platform.`,
  },
  {
    id: "copywriter",
    displayName: "Copywriter",
    shortDescription: "Landing pages, ads, emails, sales pages. Words that sell.",
    category: "Creative",
    suggestedSkills: [{ id: "sales-copy", name: "Sales copywriting" }, { id: "email-copy", name: "Email copy" }, { id: "landing-page-copy", name: "Landing page copy" }],
    soulMdTemplate: `You are {AGENT_NAME}, a copywriter. You write conversion-focused copy — landing pages, ads, emails, sales pages. You understand voice, pain points, and proof.`,
  },

  // PERSONAL
  {
    id: "personal-assistant",
    displayName: "Personal Assistant",
    shortDescription: "Calendar, email triage, research, reminders. Your right hand.",
    category: "Personal",
    suggestedSkills: [{ id: "calendar-management", name: "Calendar management" }, { id: "email-triage", name: "Email triage" }, { id: "web-research", name: "Web research" }],
    soulMdTemplate: `You are {AGENT_NAME}, a personal assistant. You manage the user's calendar, triage email, do research, and anticipate what they need next.`,
  },
  {
    id: "researcher",
    displayName: "Researcher",
    shortDescription: "Deep research, competitive intel, source verification.",
    category: "Personal",
    suggestedSkills: [{ id: "web-research", name: "Web research" }, { id: "competitive-analysis", name: "Competitive analysis" }, { id: "source-verification", name: "Source verification" }],
    soulMdTemplate: `You are {AGENT_NAME}, a researcher. You dig deep on any topic, verify sources, and deliver findings in structured summaries with citations.`,
  },

  // INDUSTRY-SPECIFIC
  {
    id: "barbershop-manager",
    displayName: "Barbershop Manager",
    shortDescription: "Booking, customer comms, promo, tips management.",
    category: "Industry-Specific",
    industryVertical: "barbershop",
    suggestedSkills: [{ id: "barbershop", name: "Barbershop operations" }, { id: "booking-systems", name: "Booking systems" }, { id: "sms-notifications", name: "Customer SMS" }],
    soulMdTemplate: `You are {AGENT_NAME}, a barbershop manager. You handle bookings, manage stylist schedules, send customer reminders, run promotions, and track tips. You know how a shop actually runs day-to-day.`,
  },
  {
    id: "real-estate-agent",
    displayName: "Real Estate Assistant",
    shortDescription: "Listings, showings, lead follow-up, buyer/seller comms.",
    category: "Industry-Specific",
    industryVertical: "real-estate",
    suggestedSkills: [{ id: "mls-integration", name: "MLS integration" }, { id: "lead-nurture", name: "Lead nurture sequences" }, { id: "real-estate", name: "Real estate ops" }],
    soulMdTemplate: `You are {AGENT_NAME}, a real estate assistant. You manage listings, schedule showings, follow up on leads, and coordinate buyer-seller communications.`,
  },
  {
    id: "rental-manager",
    displayName: "Rental Manager",
    shortDescription: "Short-term + long-term rental ops. Bookings, turnovers, damage, guest comms.",
    category: "Industry-Specific",
    industryVertical: "rental",
    suggestedSkills: [{ id: "rental", name: "Rental operations" }, { id: "booking-systems", name: "Booking systems" }, { id: "damage-deposit", name: "Damage deposit handling" }],
    soulMdTemplate: `You are {AGENT_NAME}, a rental manager. You handle bookings, coordinate cleanings and turnovers, manage damage deposits, and respond to guest inquiries.`,
  },
  {
    id: "delivery-dispatcher",
    displayName: "Delivery Dispatcher",
    shortDescription: "Driver assignment, route optimization, customer tracking.",
    category: "Industry-Specific",
    industryVertical: "delivery",
    suggestedSkills: [{ id: "delivery", name: "Delivery operations" }, { id: "route-optimization", name: "Route optimization" }, { id: "customer-tracking", name: "Customer tracking" }],
    soulMdTemplate: `You are {AGENT_NAME}, a delivery dispatcher. You assign drivers, optimize routes, track orders, and keep customers updated on ETAs.`,
  },
  {
    id: "event-planner",
    displayName: "Event Planner",
    shortDescription: "Venues, vendors, timelines, day-of coordination.",
    category: "Industry-Specific",
    industryVertical: "events",
    suggestedSkills: [{ id: "events", name: "Event management" }, { id: "vendor-coordination", name: "Vendor coordination" }, { id: "timeline-planning", name: "Timeline planning" }],
    soulMdTemplate: `You are {AGENT_NAME}, an event planner. You coordinate venues, manage vendors, build timelines, and handle day-of logistics.`,
  },
  {
    id: "fitness-coach",
    displayName: "Fitness Coach",
    shortDescription: "Workout plans, nutrition guidance, client accountability.",
    category: "Industry-Specific",
    industryVertical: "fitness",
    suggestedSkills: [{ id: "fitness-programming", name: "Fitness programming" }, { id: "nutrition-basics", name: "Nutrition basics" }, { id: "client-accountability", name: "Client accountability" }],
    soulMdTemplate: `You are {AGENT_NAME}, a fitness coach. You build custom workout plans, provide nutrition guidance, and hold clients accountable to their goals.`,
  },
];

export async function seedAgentTemplates(): Promise<void> {
  for (const [idx, t] of TEMPLATE_SEEDS.entries()) {
    await AgentTemplate.upsert({ ...t, sortOrder: idx * 10 } as any);
  }
}
```

---

## Part 3 — Seed Runner

**File:** `backend/src/scripts/seed-templates.ts`

```typescript
import { seedAgentTemplates } from "@/seeds/agent-templates.seed";

(async () => {
  console.log("Seeding agent templates...");
  await seedAgentTemplates();
  console.log("Done.");
  process.exit(0);
})();
```

Add to `package.json`:
```json
"scripts": {
  "seed:templates": "tsx src/scripts/seed-templates.ts"
}
```

Run against all three environments:
```bash
NODE_ENV=local      npm run seed:templates
NODE_ENV=develop    npm run seed:templates
NODE_ENV=production npm run seed:templates
```

---

## Part 4 — Additional Templates (future work)

Post-Beta additions by Mo's priority:

- Industry: hotel-manager, restaurant-operator, gym-manager, salon-manager, photographer, wedding-planner, pet-groomer, landscaper, handyperson
- Creative: graphic-designer, audio-producer, video-editor, illustrator, animator
- Business: hr-recruiter, operations-manager, bookkeeper, financial-planner, consultant
- Technical: ai-integrations-engineer, security-engineer, data-engineer, platform-engineer

Each needs: SOUL.md template, suggested skill list, default voice.

---

## Part 5 — Tests

```typescript
describe("Agent Template Library", () => {
  it("has at least 20 templates across 5 categories");
  it("industry-specific templates have industry_vertical set");
  it("cross-industry templates have industry_vertical null");
  it("every template has at least 3 suggested skills");
  it("every template has a SOUL.md with {AGENT_NAME} placeholder");
  it("every template has a default voice");
});

describe("GET /api/agents/templates", () => {
  it("returns all public templates sorted by category + sort_order");
  it("filters by category if query param provided");
  it("filters by industry_vertical if query param provided");
});
```

---

## Acceptance Criteria

- [ ] `agent_templates` table exists in all three environments
- [ ] 20+ templates seeded across the 5 categories
- [ ] Each template has: id, displayName, shortDescription, category, soul_md_template, suggested_skills (≥3), default_voice_id
- [ ] `GET /api/agents/templates` returns all public templates
- [ ] Seed script re-runs are idempotent (upsert, not insert)
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes (SOUL.mds must not leak forbidden patterns — run through sanitizer before insert)

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/20-agent-template-library
git commit -m "feat(templates): seed 20+ harness agent templates across 5 categories"
gh pr create --base develop --title "feat(templates): harness agent template library"
```
