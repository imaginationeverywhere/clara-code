# Prompt 01 — Landing Page: Assemble claracode.ai Homepage
**Author:** Aaron Douglas (Frontend Engineer, Clara Code Team)
**Task:** Assemble marketing landing page from mockup components
**Machine:** Local (Cursor swarm)
**Priority:** P0 — This IS the site. Must ship before anything else.

---

## Context

The marketing site lives at `packages/web-ui/`. The full design is already done — it lives in
`mockups/site/src/components/`. Your job is to copy those components into the Next.js app and
wire them into `packages/web-ui/src/app/page.tsx`.

This is a Next.js App Router project deploying to **Cloudflare Pages via `@cloudflare/next-on-pages`**.
The layout already has `export const runtime = 'edge'`. Do NOT remove it.

---

## Files to Create / Modify

### 1. Create `packages/web-ui/src/components/marketing/`

Copy and adapt these four components from `mockups/site/src/components/` into the production app:

| Mockup source | Production target |
|---|---|
| `mockups/site/src/components/HeroSection.tsx` | `packages/web-ui/src/components/marketing/HeroSection.tsx` |
| `mockups/site/src/components/FeaturesSection.tsx` | `packages/web-ui/src/components/marketing/FeaturesSection.tsx` |
| `packages/web-ui/src/components/marketing/InstallSection.tsx` | **NEW — see spec below** |
| `mockups/site/src/components/PricingSection.tsx` | `packages/web-ui/src/components/marketing/PricingSection.tsx` |

**When copying, update:**
- Remove `import React from 'react'` — not needed in Next.js 14+
- Keep all className, Tailwind, lucide-react imports as-is
- Logo in HeroSection: change `src="/clara-code-logo-3d.png"` → `src="/logo-hero.png"` (this file exists in public/)

---

### 2. `packages/web-ui/src/components/marketing/InstallSection.tsx` (REWRITE)

**CRITICAL:** @clara/cli is NOT on npm yet. The original mockup assumes it is published.
Replace the install commands with a "coming soon" treatment.

```typescript
'use client'

import { useState } from 'react'
import { Terminal, Monitor, Copy, CheckCircle, Github, ExternalLink, Download, Apple } from 'lucide-react'

export function InstallSection() {
  const [copied, setCopied] = useState(false)
  const betaCmd = 'npx github:imaginationeverywhere/clara-code'

  const handleCopy = () => {
    navigator.clipboard.writeText(betaCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-24 bg-[#080C12]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Section Intro */}
        <div className="mb-12">
          <div className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-mono">
            GET STARTED
          </div>
          <h2 className="text-[32px] md:text-[40px] font-bold text-white mt-3 tracking-tight">
            Two ways in.
          </h2>
          <p className="text-[17px] text-white/45 mt-3 font-mono">
            CLI for terminal purists. IDE for everyone else.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* LEFT — CLI (Coming Soon) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-[#7BCDD8]" />
              <span className="text-[13px] font-semibold text-white font-mono">Command Line</span>
              <span className="text-[13px] text-white/30 font-mono">· for terminal purists</span>
            </div>

            {/* Coming Soon block */}
            <div className="bg-[#070A0F] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
                <div className="font-mono text-sm text-white/40">
                  <span className="text-white/25"># </span>npm install -g @clara/cli
                </div>
              </div>

              {/* Beta install */}
              <div className="px-5 py-4">
                <div className="text-[11px] font-mono text-white/30 mb-2 uppercase tracking-wider">
                  Try the beta
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm">
                    <span className="text-white/25">$ </span>
                    <span className="text-[#10B981]">{betaCmd}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 transition-colors shrink-0 ml-3"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                        <span className="text-[12px] font-mono text-[#10B981]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white/35 hover:text-white/60" />
                        <span className="text-[12px] font-mono text-white/35 hover:text-white/60">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/25">Node.js 18+ required</span>
                <a
                  href="https://github.com/imaginationeverywhere/clara-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#7BCDD8] hover:underline flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  Star us on GitHub →
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — IDE Download (Coming Soon) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-[13px] font-semibold text-white font-mono">Desktop IDE</span>
              <span className="text-[13px] text-white/30 font-mono">· VS Code, voice-first</span>
            </div>

            <div className="bg-[#0A0E14] border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[15px] font-semibold text-white">Clara Code IDE</span>
                  <span className="text-[10px] font-mono bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>

                <a
                  href="https://github.com/imaginationeverywhere/clara-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-colors"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </a>
                <div className="text-[11px] font-mono text-white/30 text-center mt-2">
                  Star the repo to be notified at launch
                </div>
              </div>

              <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between">
                <span className="text-[11px] font-mono text-white/25">MIT Licensed · Open Source</span>
                <a
                  href="https://github.com/imaginationeverywhere/clara-code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#7BCDD8] hover:underline"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### 3. Update `packages/web-ui/src/app/page.tsx`

Replace the current placeholder with:

```typescript
import { HeroSection } from '@/components/marketing/HeroSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { InstallSection } from '@/components/marketing/InstallSection'
import { PricingSection } from '@/components/marketing/PricingSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1117] text-white selection:bg-[#7C3AED]/30 selection:text-white">
      <HeroSection />
      <FeaturesSection />
      <InstallSection />
      <PricingSection />
    </main>
  )
}
```

Note: No Header here — Header will be added in prompt 02.

---

## Dependencies

Check `packages/web-ui/package.json` for `lucide-react`. If not present:
```bash
cd packages/web-ui && npm install lucide-react
```

---

## Important Notes

- `HeroSection` and `FeaturesSection` and `PricingSection` are server components (no hooks) — no `'use client'` needed
- `InstallSection` uses `useState` for copy button — add `'use client'` at the top (already in spec above)
- The `@/` alias should already be configured in `tsconfig.json` → points to `src/`
- Do NOT change `export const runtime = 'edge'` in layout.tsx

---

## Acceptance Criteria

- [ ] `packages/web-ui/src/app/page.tsx` renders all 4 sections
- [ ] Hero shows logo (`/logo-hero.png`), "Your voice. Your code." headline, animated mic ring
- [ ] Features bento grid renders 4 cards
- [ ] Install section shows "Coming soon" badge on npm block + beta npx command with copy button
- [ ] GitHub links point to `https://github.com/imaginationeverywhere/clara-code`
- [ ] Pricing shows 3 tiers: Free ($0), Pro ($20/mo), Team ($99/mo)
- [ ] `npm run build` passes with no type errors (run from `packages/web-ui/`)
- [ ] No missing image errors (logo-hero.png exists at `packages/web-ui/public/logo-hero.png`)
