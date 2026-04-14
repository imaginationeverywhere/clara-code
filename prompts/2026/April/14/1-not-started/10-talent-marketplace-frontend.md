# Talent Marketplace Frontend — `talent.claracode.ai`

**Source:** `docs/internal/CLARA_TALENT_AGENCY_ARCHITECTURE.md` — read this document before writing any code.
**Depends on:** Prompt 07 must be merged (`GET /api/talents` endpoint must exist)
**Branch:** `prompt/2026-04-14/10-talent-marketplace-frontend`
**Scope:** `packages/talent-marketplace/` (new Next.js 15 package in this monorepo)

---

## Context

`talent.claracode.ai` is the public marketplace where subscribing developers browse and install Talents. It is a read-heavy, mostly public site — most pages render without auth. The "Install" button requires an API key (same credentials as the rest of Clara).

This is the surface that third-party Talent developers want their Talents to appear on. It should look polished and feel like Apple's App Store for voice AI.

**Tech stack:** Next.js 15 (App Router), Tailwind CSS, Cloudflare Pages deployment
**Design system:** Clara Code design system — `#09090F` bg, `#7C3AED` purple, `#7BCDD8` teal, Inter + JetBrains Mono

---

## Required Work

### 1. Scaffold the package

```bash
cd packages
npx create-next-app@latest talent-marketplace \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

### 2. Package.json name

In `packages/talent-marketplace/package.json`:
```json
{
  "name": "@claracode/talent-marketplace",
  "version": "0.1.0"
}
```

### 3. Tailwind design tokens

In `packages/talent-marketplace/tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#09090F",
        "bg-surface": "#111118",
        "bg-elevated": "#1A1A24",
        purple: "#7C3AED",
        "purple-light": "#9F67FF",
        teal: "#7BCDD8",
        "teal-light": "#A8E6EE",
        green: "#10B981",
        muted: "#6B7280",
        border: "#2A2A3A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

### 4. API client

Create `packages/talent-marketplace/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.claracode.ai";

export interface PublicTalent {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  category: string | null;
  pricingType: "free" | "paid";
  priceMonthly: number | null;
  voiceCommands: { pattern: string; description: string; examples: string[] }[] | null;
  installCount: number;
}

export async function listTalents(category?: string): Promise<PublicTalent[]> {
  const url = category
    ? `${API_BASE}/api/talents?category=${encodeURIComponent(category)}`
    : `${API_BASE}/api/talents`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch talents");
  const data = await res.json();
  return data.talents;
}

export async function getTalent(id: string): Promise<PublicTalent | null> {
  const res = await fetch(`${API_BASE}/api/talents/${id}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch talent");
  const data = await res.json();
  return data.talent;
}

export async function installTalent(talentId: string, apiKey: string): Promise<{ success: boolean; checkoutUrl?: string }> {
  const res = await fetch(`${API_BASE}/api/talents/${talentId}/install`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
  if (res.status === 402) {
    const data = await res.json();
    return { success: false, checkoutUrl: data.checkoutUrl };
  }
  if (!res.ok) throw new Error("Failed to install talent");
  return { success: true };
}

export async function uninstallTalent(talentId: string, apiKey: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/talents/${talentId}/install`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error("Failed to uninstall talent");
}
```

### 5. Pages

#### `app/page.tsx` — Homepage

```tsx
import { listTalents } from "@/lib/api";
import TalentCard from "@/components/TalentCard";
import CategoryNav from "@/components/CategoryNav";

export default async function Home() {
  const talents = await listTalents();
  const featured = talents.slice(0, 6);

  return (
    <main className="min-h-screen bg-bg text-white">
      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">
          The Clara Talent Agency
        </h1>
        <p className="text-xl text-muted mb-8">
          Voice-native capabilities for your Clara agents. Install once, speak naturally.
        </p>
        <a
          href="#browse"
          className="bg-purple hover:bg-purple-light px-8 py-3 rounded-lg font-medium transition"
        >
          Browse Talents
        </a>
      </section>

      {/* Category navigation */}
      <CategoryNav />

      {/* Featured talents grid */}
      <section id="browse" className="px-6 py-12 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8">Featured Talents</h2>
        {talents.length === 0 ? (
          <p className="text-muted">No Talents available yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
```

#### `app/talent/[id]/page.tsx` — Talent detail

```tsx
import { getTalent } from "@/lib/api";
import { notFound } from "next/navigation";
import InstallButton from "@/components/InstallButton";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const talent = await getTalent(params.id);
  if (!talent) return { title: "Not Found" };
  return { title: `${talent.displayName} — Clara Talent Agency` };
}

export default async function TalentDetail({ params }: Props) {
  const talent = await getTalent(params.id);
  if (!talent) notFound();

  return (
    <main className="min-h-screen bg-bg text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{talent.displayName}</h1>
            <p className="text-muted capitalize">{talent.category ?? "Other"}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-1">
              {talent.pricingType === "free" ? "Free" : `$${talent.priceMonthly}/mo`}
            </div>
            <InstallButton talentId={talent.id} pricingType={talent.pricingType} />
          </div>
        </div>

        <p className="text-lg text-gray-300 mb-10">{talent.description}</p>

        {talent.voiceCommands && talent.voiceCommands.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Voice Commands</h2>
            <div className="space-y-4">
              {talent.voiceCommands.map((cmd, i) => (
                <div key={i} className="bg-bg-elevated border border-border rounded-lg p-4">
                  <code className="text-teal font-mono text-sm">"{cmd.pattern}"</code>
                  <p className="text-muted text-sm mt-1">{cmd.description}</p>
                  {cmd.examples.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cmd.examples.map((ex, j) => (
                        <span key={j} className="text-xs bg-bg border border-border px-2 py-1 rounded font-mono">
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 text-sm text-muted">
          {talent.installCount.toLocaleString()} installs
        </div>
      </div>
    </main>
  );
}
```

#### `app/categories/[category]/page.tsx`

```tsx
import { listTalents } from "@/lib/api";
import TalentCard from "@/components/TalentCard";

const VALID_CATEGORIES = ["productivity", "data", "communication", "developer-tools", "other"];

interface Props {
  params: { category: string };
}

export default async function CategoryPage({ params }: Props) {
  if (!VALID_CATEGORIES.includes(params.category)) {
    return <main className="min-h-screen bg-bg text-white px-6 py-16 text-center">
      <p className="text-muted">Category not found.</p>
    </main>;
  }

  const talents = await listTalents(params.category);
  const title = params.category.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="min-h-screen bg-bg text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        {talents.length === 0 ? (
          <p className="text-muted">No Talents in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

### 6. Components

#### `components/TalentCard.tsx`

```tsx
import Link from "next/link";
import type { PublicTalent } from "@/lib/api";

export default function TalentCard({ talent }: { talent: PublicTalent }) {
  return (
    <Link href={`/talent/${talent.id}`}>
      <div className="bg-bg-elevated border border-border rounded-xl p-6 hover:border-purple transition cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">{talent.displayName}</h3>
          <span className={`text-sm font-medium px-2 py-0.5 rounded ${
            talent.pricingType === "free" ? "text-green bg-green/10" : "text-teal bg-teal/10"
          }`}>
            {talent.pricingType === "free" ? "Free" : `$${talent.priceMonthly}/mo`}
          </span>
        </div>
        <p className="text-muted text-sm flex-1 line-clamp-3">{talent.description}</p>
        <div className="mt-4 text-xs text-muted">
          {talent.installCount.toLocaleString()} installs · {talent.category ?? "other"}
        </div>
      </div>
    </Link>
  );
}
```

#### `components/CategoryNav.tsx`

```tsx
import Link from "next/link";

const CATEGORIES = [
  { slug: "productivity", label: "Productivity" },
  { slug: "developer-tools", label: "Developer Tools" },
  { slug: "data", label: "Data" },
  { slug: "communication", label: "Communication" },
  { slug: "other", label: "Other" },
];

export default function CategoryNav() {
  return (
    <nav className="px-6 py-4 border-b border-border">
      <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="text-sm text-muted hover:text-white whitespace-nowrap transition px-3 py-1 rounded-full hover:bg-bg-elevated"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

#### `components/InstallButton.tsx`

```tsx
"use client";

import { useState } from "react";
import { installTalent } from "@/lib/api";

interface Props {
  talentId: string;
  pricingType: "free" | "paid";
}

export default function InstallButton({ talentId, pricingType }: Props) {
  const [loading, setLoading] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = async () => {
    const apiKey = localStorage.getItem("clara_api_key");
    if (!apiKey) {
      setError("Sign in to install Talents.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await installTalent(talentId, apiKey);
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setInstalled(true);
    } catch {
      setError("Install failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (installed) {
    return (
      <span className="bg-green/10 text-green px-6 py-2 rounded-lg font-medium">
        Installed
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleInstall}
        disabled={loading}
        className="bg-purple hover:bg-purple-light disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition"
      >
        {loading ? "Installing..." : pricingType === "free" ? "Install Free" : "Subscribe & Install"}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
```

### 7. Environment variables

Create `packages/talent-marketplace/.env.example`:
```
NEXT_PUBLIC_BACKEND_URL=https://api.claracode.ai
```

### 8. Cloudflare Pages deployment config

Create `packages/talent-marketplace/wrangler.toml`:
```toml
name = "clara-talent-marketplace"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[env.preview]
vars = { NEXT_PUBLIC_BACKEND_URL = "https://api-dev.claracode.ai" }

[env.production]
vars = { NEXT_PUBLIC_BACKEND_URL = "https://api.claracode.ai" }
```

---

## Acceptance Criteria

- [ ] `pnpm -C packages/talent-marketplace run build` succeeds — no errors
- [ ] `pnpm -C packages/talent-marketplace run type-check` — zero TypeScript errors
- [ ] Homepage (`/`) renders with hero text "The Clara Talent Agency" and category nav
- [ ] `TalentCard` component links to `/talent/[id]`
- [ ] Talent detail page shows voice commands with `font-mono` code styling
- [ ] `InstallButton` reads API key from `localStorage.clara_api_key`
- [ ] Free talent install calls `POST /api/talents/:id/install` with Bearer token
- [ ] Paid talent install redirects to Stripe checkout URL
- [ ] Design uses `#09090F` bg, `#7C3AED` purple, `#7BCDD8` teal — not default Tailwind blue
- [ ] `wrangler.toml` targets `claracode.ai` domain (not a subdomain of another product)

## Do NOT

- Do not add authentication pages to this site — auth lives at `claracode.ai`
- Do not show `subgraphUrl` or `developerUserId` anywhere in the UI
- Do not use default Tailwind color names (`blue-600`, etc.) — use design tokens from `tailwind.config.ts`
- Do not add a backend or API routes to this Next.js app — all data comes from `api.claracode.ai`
