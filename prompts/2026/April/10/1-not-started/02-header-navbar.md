## CURSOR AGENT — MCP NOTE
**Figma MCP**: Skip if unavailable. Do NOT wait for it or ask about it. This prompt does NOT require Figma MCP. Proceed immediately with the implementation below.
**Secrets**: All keys are in AWS SSM. Pull with: `aws ssm get-parameter --name '/quik-nation/shared/<KEY_NAME>' --with-decryption --query 'Parameter.Value' --output text`

---

# Prompt 02 — Header / Navbar Component
**Author:** Aaron Douglas (Frontend Engineer, Clara Code Team)
**Task:** Header component with GitHub CTA + sticky nav
**Machine:** Local (Cursor swarm)
**Priority:** P0 — Needed for every page
**Depends on:** Prompt 01 must be complete (components/marketing/ directory must exist)

---

## Context

The mockup header exists at `mockups/site/src/components/Header.tsx` but it uses plain `<a>` tags
with `href="#"`. We need to wire it properly for Next.js App Router with real links and a
GitHub CTA that drives stars.

---

## Files to Create / Modify

### 1. Create `packages/web-ui/src/components/marketing/Header.tsx`

```typescript
'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { useState, useEffect } from 'react'

const GITHUB_REPO = 'https://github.com/imaginationeverywhere/clara-code'

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? 'bg-[#0D1117]/95 backdrop-blur-md border-white/[0.07]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-sans font-bold text-white text-lg tracking-tight">Clara</span>
          <span className="font-mono font-bold text-[#4F8EF7] text-lg tracking-tight">Code</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/50">
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {/* Get Early Access */}
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] transition-colors rounded-full px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            Get Early Access
          </a>
        </nav>
      </div>
    </header>
  )
}
```

---

### 2. Add Header to `packages/web-ui/src/app/page.tsx`

Update the page to include the Header above the sections:

```typescript
import { Header } from '@/components/marketing/Header'
import { HeroSection } from '@/components/marketing/HeroSection'
import { FeaturesSection } from '@/components/marketing/FeaturesSection'
import { InstallSection } from '@/components/marketing/InstallSection'
import { PricingSection } from '@/components/marketing/PricingSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1117] text-white selection:bg-[#7C3AED]/30 selection:text-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <InstallSection />
      <PricingSection />
    </main>
  )
}
```

---

## Notes

- `'use client'` required because of `useState` / `useEffect` for scroll detection
- GitHub CTA ("Get Early Access") links to GitHub repo — this drives stars until app is live
- `/docs` and `/#pricing` are hash links — they work even as placeholder routes
- Do NOT add Clerk `<UserButton />` to this header — auth nav comes later (prompt 04+)
- The header becomes opaque on scroll via `scrolled` state — same pattern as the mockup

---

## Acceptance Criteria

- [ ] Header renders fixed at top with Clara + Code wordmark
- [ ] On scroll > 10px, backdrop-blur and border appear
- [ ] "Docs", "Pricing", "GitHub" nav links render on md+ screens
- [ ] "Get Early Access" button is visible on all screen sizes
- [ ] All GitHub links point to `https://github.com/imaginationeverywhere/clara-code`
- [ ] `npm run build` passes with no type errors