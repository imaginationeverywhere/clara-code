# Developer Portal Frontend — `developers.claracode.ai`

**Source:** `docs/auto-claude/CLARA_TALENT_AGENCY_ARCHITECTURE.md` — read this document before writing any code.
**Depends on:** Prompt 08 must be merged (Developer Program billing endpoints must exist); Prompt 07 must be merged (Talent management endpoints must exist)
**Branch:** `prompt/2026-04-14/11-developer-portal-frontend`
**Scope:** `packages/developer-portal/` (new Next.js 15 package in this monorepo)

---

## Context

`developers.claracode.ai` is the dashboard for Talent creators. A developer with an active Developer Program membership uses this portal to:
- Submit new Talents for review
- Track installs and revenue on their approved Talents
- Manage their Developer Program subscription
- Access documentation links

This site requires authentication. Every page is auth-gated — unauthenticated users are redirected to `claracode.ai` to sign in. Auth is handled by storing the Clara API key in `localStorage` (same as the marketplace frontend) — not a separate OAuth flow.

**Tech stack:** Next.js 15 (App Router), Tailwind CSS, Cloudflare Pages deployment
**Design system:** Same Clara Code design system as `talent.claracode.ai`

---

## Required Work

### 1. Scaffold the package

```bash
cd packages
npx create-next-app@latest developer-portal \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

Update `packages/developer-portal/package.json`:
```json
{
  "name": "@claracode/developer-portal",
  "version": "0.1.0"
}
```

### 2. Tailwind config

Same design tokens as `talent-marketplace` — copy `tailwind.config.ts` exactly.

### 3. API client

Create `packages/developer-portal/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.claracode.ai";

export interface Talent {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  category: string | null;
  pricingType: "free" | "paid";
  priceMonthly: number | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  installCount: number;
}

export interface DeveloperProgramStatus {
  enrolled: boolean;
  status: string | null;
  expiresAt: string | null;
}

async function withAuth(path: string, options: RequestInit = {}) {
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("clara_api_key") : null;
  if (!apiKey) throw new Error("Not authenticated");
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

export async function getDeveloperTalents(): Promise<Talent[]> {
  // Developer talents come through the regular list endpoint filtered by auth
  const res = await withAuth("/api/talents");
  if (!res.ok) throw new Error("Failed to fetch talents");
  // Note: GET /api/talents returns ALL approved talents; for dev dashboard we need
  // a developer-specific view. The backend should filter by developer_user_id when
  // the request is authenticated. Confirm with backend team — adjust if needed.
  const data = await res.json();
  return data.talents;
}

export async function submitTalent(data: {
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  pricingType: "free" | "paid";
  priceCents?: number;
  subgraphUrl: string;
  voiceCommands?: { pattern: string; description: string; examples: string[] }[];
}): Promise<{ id: string; status: string }> {
  const res = await withAuth("/api/talents", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Submission failed");
  }
  const result = await res.json();
  return result.talent;
}

export async function getTalentAnalytics(talentId: string) {
  const res = await withAuth(`/api/talents/${talentId}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return (await res.json()).analytics;
}

export async function getDeveloperProgramStatus(): Promise<DeveloperProgramStatus> {
  const res = await withAuth("/api/developer-program/status");
  if (!res.ok) throw new Error("Failed to fetch program status");
  return res.json();
}

export async function enrollInDeveloperProgram(): Promise<{ checkoutUrl: string }> {
  const res = await withAuth("/api/developer-program/enroll", { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Enrollment failed");
  }
  return res.json();
}
```

### 4. Auth guard hook

Create `packages/developer-portal/hooks/useAuth.ts`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const key = localStorage.getItem("clara_api_key");
    if (!key) {
      router.replace("https://claracode.ai/sign-in?redirect=" + encodeURIComponent(window.location.href));
      return;
    }
    setApiKey(key);
    setLoading(false);
  }, [router]);

  return { apiKey, loading };
}
```

### 5. Layout

Create `packages/developer-portal/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clara Developer Portal",
  description: "Build Talents for the Clara Talent Agency",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg text-white flex min-h-screen`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
```

Create `packages/developer-portal/components/Sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/talents/new", label: "Submit Talent" },
  { href: "/program", label: "Developer Program" },
  { href: "/docs", label: "Documentation" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-bg-surface border-r border-border flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-border">
        <span className="text-lg font-bold">Developer Portal</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg text-sm transition ${
              pathname === item.href
                ? "bg-purple text-white"
                : "text-muted hover:text-white hover:bg-bg-elevated"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-border text-xs text-muted">
        <a href="https://claracode.ai" className="hover:text-white transition">← Clara Code</a>
      </div>
    </aside>
  );
}
```

### 6. Pages

#### `app/page.tsx` — Dashboard

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDeveloperTalents, getDeveloperProgramStatus } from "@/lib/api";
import type { Talent, DeveloperProgramStatus } from "@/lib/api";
import TalentRow from "@/components/TalentRow";

export default function Dashboard() {
  const { loading } = useAuth();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [programStatus, setProgramStatus] = useState<DeveloperProgramStatus | null>(null);

  useEffect(() => {
    if (loading) return;
    getDeveloperTalents().then(setTalents).catch(console.error);
    getDeveloperProgramStatus().then(setProgramStatus).catch(console.error);
  }, [loading]);

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Program status banner */}
      {programStatus && !programStatus.enrolled && (
        <div className="bg-purple/10 border border-purple rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold">Become a Clara Developer</p>
            <p className="text-muted text-sm mt-1">
              Enroll in the Developer Program ($99/year) to submit Talents and track your revenue.
            </p>
          </div>
          <a href="/program" className="bg-purple px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-light transition">
            Enroll Now
          </a>
        </div>
      )}

      {/* Talents list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Talents</h2>
          <a
            href="/talents/new"
            className="bg-purple hover:bg-purple-light px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Submit New Talent
          </a>
        </div>

        {talents.length === 0 ? (
          <div className="bg-bg-elevated border border-border rounded-xl p-8 text-center">
            <p className="text-muted">No Talents submitted yet.</p>
            <a href="/talents/new" className="text-purple text-sm mt-2 inline-block hover:text-purple-light">
              Submit your first Talent →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {talents.map((talent) => (
              <TalentRow key={talent.id} talent={talent} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

#### `app/talents/new/page.tsx` — Submit a Talent

```tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { submitTalent } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewTalent() {
  const { loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    description: "",
    category: "productivity",
    pricingType: "free" as "free" | "paid",
    priceMonthly: "",
    subgraphUrl: "",
    voiceCommandPattern: "",
    voiceCommandDescription: "",
    voiceCommandExamples: "",
  });

  if (loading) return <div className="p-8 text-muted">Loading...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const voiceCommands = form.voiceCommandPattern
        ? [{
            pattern: form.voiceCommandPattern,
            description: form.voiceCommandDescription,
            examples: form.voiceCommandExamples.split(",").map((s) => s.trim()).filter(Boolean),
          }]
        : [];

      await submitTalent({
        name: form.name,
        displayName: form.displayName,
        description: form.description,
        category: form.category,
        pricingType: form.pricingType,
        priceCents: form.pricingType === "paid" ? Math.round(parseFloat(form.priceMonthly) * 100) : undefined,
        subgraphUrl: form.subgraphUrl,
        voiceCommands,
      });
      router.push("/?submitted=true");
    } catch (err: any) {
      setError(err.message ?? "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const input = "w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple";
  const label = "block text-sm font-medium text-muted mb-1";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Submit a Talent</h1>
      <p className="text-muted mb-8">Your Talent will be reviewed before appearing in the marketplace.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={label}>Talent Name (slug)</label>
          <input className={input} placeholder="github-prs" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
            required />
          <p className="text-xs text-muted mt-1">Lowercase, hyphens only. e.g. "github-prs"</p>
        </div>

        <div>
          <label className={label}>Display Name</label>
          <input className={input} placeholder="GitHub Pull Requests" value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} required />
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea className={`${input} h-24 resize-none`} placeholder="What does this Talent do? (160 chars max)"
            value={form.description} maxLength={160}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>

        <div>
          <label className={label}>Category</label>
          <select className={input} value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value="productivity">Productivity</option>
            <option value="developer-tools">Developer Tools</option>
            <option value="data">Data</option>
            <option value="communication">Communication</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={label}>Pricing</label>
          <div className="flex gap-4">
            {["free", "paid"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pricing" value={type} checked={form.pricingType === type}
                  onChange={() => setForm((f) => ({ ...f, pricingType: type as "free" | "paid" }))} />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
          {form.pricingType === "paid" && (
            <input className={`${input} mt-2 w-32`} type="number" min="1" step="0.01"
              placeholder="$/month" value={form.priceMonthly}
              onChange={(e) => setForm((f) => ({ ...f, priceMonthly: e.target.value }))} required />
          )}
        </div>

        <div>
          <label className={label}>GraphQL Subgraph URL</label>
          <input className={input} type="url" placeholder="https://your-server.com/graphql"
            value={form.subgraphUrl}
            onChange={(e) => setForm((f) => ({ ...f, subgraphUrl: e.target.value }))} required />
          <p className="text-xs text-muted mt-1">Your server endpoint. This URL is never shown publicly.</p>
        </div>

        <div className="border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Primary Voice Command</h3>
          <div className="space-y-3">
            <div>
              <label className={label}>Pattern</label>
              <input className={input} placeholder='show my {resource}' value={form.voiceCommandPattern}
                onChange={(e) => setForm((f) => ({ ...f, voiceCommandPattern: e.target.value }))} />
            </div>
            <div>
              <label className={label}>Description</label>
              <input className={input} placeholder="Display a list of resources" value={form.voiceCommandDescription}
                onChange={(e) => setForm((f) => ({ ...f, voiceCommandDescription: e.target.value }))} />
            </div>
            <div>
              <label className={label}>Example phrases (comma-separated)</label>
              <input className={input} placeholder="show my PRs, show my open issues"
                value={form.voiceCommandExamples}
                onChange={(e) => setForm((f) => ({ ...f, voiceCommandExamples: e.target.value }))} />
            </div>
          </div>
          <p className="text-xs text-muted mt-3">You can add more voice commands after approval.</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full bg-purple hover:bg-purple-light disabled:opacity-50 py-3 rounded-lg font-medium transition">
          {submitting ? "Submitting for review..." : "Submit Talent for Review"}
        </button>
      </form>
    </div>
  );
}
```

#### `app/program/page.tsx` — Developer Program billing

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getDeveloperProgramStatus, enrollInDeveloperProgram } from "@/lib/api";
import type { DeveloperProgramStatus } from "@/lib/api";

export default function ProgramPage() {
  const { loading } = useAuth();
  const [status, setStatus] = useState<DeveloperProgramStatus | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      getDeveloperProgramStatus().then(setStatus).catch(console.error);
    }
  }, [loading]);

  if (loading || !status) return <div className="p-8 text-muted">Loading...</div>;

  const handleEnroll = async () => {
    setEnrolling(true);
    setError(null);
    try {
      const { checkoutUrl } = await enrollInDeveloperProgram();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message ?? "Enrollment failed.");
      setEnrolling(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Developer Program</h1>
      <p className="text-muted mb-8">Submit Talents to the Clara Talent Agency and earn revenue.</p>

      <div className="bg-bg-elevated border border-border rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-4xl font-bold">$99 <span className="text-xl font-normal text-muted">/year</span></div>
            <p className="text-muted text-sm mt-1">Billed annually</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.enrolled ? "bg-green/10 text-green" : "bg-muted/10 text-muted"
          }`}>
            {status.enrolled ? "Active" : "Not enrolled"}
          </div>
        </div>

        <ul className="space-y-3 text-sm mb-8">
          {[
            "Submit Talents for marketplace listing",
            "Access to @claracode/marketplace-sdk",
            "Install analytics and revenue dashboard",
            "Developer support",
            "Clara Developer badge",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-green">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {status.enrolled ? (
          <div>
            <p className="text-sm text-muted">
              Renews: {status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : "—"}
            </p>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full bg-purple hover:bg-purple-light disabled:opacity-50 py-3 rounded-lg font-medium transition"
          >
            {enrolling ? "Redirecting to payment..." : "Enroll — $99/year"}
          </button>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      <p className="text-xs text-muted">
        Clara takes 15% on paid Talent revenue. You keep 85%. Free Talents are always free for everyone.
      </p>
    </div>
  );
}
```

#### `app/docs/page.tsx` — Documentation link hub

```tsx
export default function DocsPage() {
  const links = [
    { title: "Getting Started", desc: "Set up your development environment and register your first subgraph.", href: "https://docs.claracode.ai/talents/getting-started" },
    { title: "Voice Command Patterns", desc: "Learn how to write effective voice command manifests.", href: "https://docs.claracode.ai/talents/voice-commands" },
    { title: "GraphQL Subgraph Guide", desc: "Build a standards-compliant Apollo Federation subgraph.", href: "https://docs.claracode.ai/talents/subgraph" },
    { title: "@claracode/marketplace-sdk", desc: "SDK reference for token verification and manifest types.", href: "https://docs.claracode.ai/sdk/marketplace" },
    { title: "Submission Guidelines", desc: "What Clara reviews before approving your Talent.", href: "https://docs.claracode.ai/talents/guidelines" },
    { title: "Revenue & Billing", desc: "How payouts work, when you get paid, and how to set pricing.", href: "https://docs.claracode.ai/talents/billing" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-muted mb-8">Everything you need to build and publish Talents.</p>
      <div className="grid gap-4">
        {links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
            className="bg-bg-elevated border border-border rounded-xl p-5 hover:border-purple transition block">
            <div className="font-semibold mb-1">{link.title}</div>
            <div className="text-muted text-sm">{link.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

### 7. `components/TalentRow.tsx`

```tsx
import Link from "next/link";
import type { Talent } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  approved: "text-green bg-green/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  rejected: "text-red-400 bg-red-400/10",
  suspended: "text-muted bg-muted/10",
};

export default function TalentRow({ talent }: { talent: Talent }) {
  return (
    <div className="bg-bg-elevated border border-border rounded-xl p-5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="font-semibold">{talent.displayName}</span>
          <span className={`text-xs px-2 py-0.5 rounded capitalize ${STATUS_STYLES[talent.status] ?? "text-muted"}`}>
            {talent.status}
          </span>
        </div>
        <p className="text-sm text-muted">{talent.installCount.toLocaleString()} installs</p>
      </div>
      <Link href={`/talents/${talent.id}`} className="text-sm text-purple hover:text-purple-light transition">
        View →
      </Link>
    </div>
  );
}
```

### 8. Environment + deployment config

`packages/developer-portal/.env.example`:
```
NEXT_PUBLIC_BACKEND_URL=https://api.claracode.ai
```

`packages/developer-portal/wrangler.toml`:
```toml
name = "clara-developer-portal"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[env.preview]
vars = { NEXT_PUBLIC_BACKEND_URL = "https://api-dev.claracode.ai" }

[env.production]
vars = { NEXT_PUBLIC_BACKEND_URL = "https://api.claracode.ai" }
```

---

## Acceptance Criteria

- [ ] `pnpm -C packages/developer-portal run build` succeeds
- [ ] `pnpm -C packages/developer-portal run type-check` — zero TypeScript errors
- [ ] Dashboard shows "Enroll Now" banner when Developer Program is not active
- [ ] Dashboard shows talent list with status badges when enrolled
- [ ] `/talents/new` form submits to `POST /api/talents` with correct shape
- [ ] `/program` page shows enrollment status + "Enroll — $99/year" button
- [ ] Sidebar navigation works across all pages
- [ ] Unauthenticated users redirect to `claracode.ai/sign-in`
- [ ] `/docs` page links to documentation (can be placeholder hrefs)
- [ ] Design matches Clara design system (no default Tailwind blue)

## Do NOT

- Do not add a backend or API routes to this Next.js app
- Do not implement actual Talent analytics dashboard in this prompt — stub with install count only
- Do not show `subgraphUrl` anywhere in the UI
- Do not handle auth in this app — delegate to `claracode.ai` via redirect
