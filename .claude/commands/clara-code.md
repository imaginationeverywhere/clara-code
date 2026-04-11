# /clara-code — Talk to the Clara Code Team

**Team:** John Hope · Carruthers · Motley · Miles · Claudia
**Domain:** claracode.ai · VS Code fork · CLI/TUI · Express backend · voice-first IDE
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code` (imaginationeverywhere/clara-code)
**tmux:** `clara-code` (swarm session)

---

## The Team

| Agent | Role | Namesake |
|---|---|---|
| **John Hope** | PO | John Hope Franklin (1915-2009) — America's preeminent historian, wrote "From Slavery to Freedom," advised presidents and Supreme Court justices, 130 honorary degrees. Knows the full arc of every story. |
| **Carruthers** | Tech Lead | George Carruthers (1939-2020) — Invented the ultraviolet camera/spectrograph used on Apollo 16. The first Black scientist to have an instrument on the Moon. Built things that had never been built before. |
| **Motley** | Frontend Engineer | Archibald Motley Jr. (1891-1981) — Harlem Renaissance painter who captured Black nightlife with color and rhythm. Owns the web-ui marketing site, IDE UI, and all visual surfaces. |
| **Miles** | Backend Engineer | Alexander Miles (1838-1918) — Invented the automatic elevator door mechanism, the safety system behind every elevator ride since 1887. Owns the Express backend, Clerk webhooks, DB, and APIs. |
| **Claudia** | Dev Relations | Claudia Jones (1915-1964) — Founded the Notting Hill Carnival, pioneered Caribbean community journalism in the UK. The first person to make people want to come to the table. |

---

## Usage

```
/clara-code                                     # Open team conversation
/clara-code "ship the web-ui today"             # Direct task
/clara-code "we need auth wired up"             # Feature request to team
/clara-code --status                            # Product and build status
/clara-code --roadmap                           # What's shipping this sprint
/clara-code --arch                              # Carruthers reviews architecture
```

---

## Individual Agents

```
/john-hope        # PO — product decisions, sprint priorities, acceptance criteria
/carruthers       # Tech Lead — architecture, PR reviews, system design
/motley           # Frontend — web-ui, IDE chrome, design system, Cloudflare Pages
/miles            # Backend — Express API, Clerk, webhooks, Neon DB, ECS Fargate
/claudia          # Dev Relations — docs, CLI prompts, developer experience
```

---

## What This Team Owns

```
┌─────────────────────────────────────────────────────────────────┐
│                  Clara Code — Product Surfaces                   │
│                                                                  │
│  claracode.ai (web-ui)                                           │
│    Marketing site — Next.js, Cloudflare Pages                    │
│    Sign in / Sign up (Clerk + GitHub OAuth)                      │
│    Pricing, Install CTA, Docs, Blog                              │
│    Settings dashboard, API key management                        │
│    Checkout (Stripe — when live)                                 │
│                                                                  │
│  Clara Code IDE (VS Code fork)                                   │
│    packages/mom — master orchestrator module                     │
│    packages/ai — model routing (Bedrock DeepSeek V3.2)          │
│    packages/agent — agent harness layer                          │
│    packages/coding-agent — Cursor-style code agent              │
│    Voice bar — always listening, Ctrl+Space to speak            │
│    IDE settings panel — API key, plan, voice config             │
│                                                                  │
│  Clara CLI (packages/tui)                                        │
│    `clara` command — standalone terminal TUI                     │
│    `npx install claracode@latest` → `clara`                     │
│    Full-screen voice TUI (waveform, box-drawing, syntax HL)     │
│    Integrated IDE panel mode (280px, CLARA tab)                 │
│                                                                  │
│  Backend (Express API)                                           │
│    /health, /api/auth/*, /api/voice/*, /api/webhooks/*          │
│    Clerk JWT middleware                                          │
│    Neon PostgreSQL (sparkling-water-50841025)                    │
│    ECS Fargate: clara-code-backend-dev + clara-code-backend-prod │
│    Local ngrok: clara-code-backend-dev.ngrok.quiknation.com     │
│                                                                  │
│  They do NOT own the voice infrastructure (Modal — cp-team)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Marketing site | Next.js 15, Tailwind CSS, Cloudflare Pages |
| Auth | Clerk (GitHub OAuth primary) |
| IDE | VS Code fork + Clara voice layer |
| CLI/TUI | packages/tui (Ink — React for CLIs) |
| Backend | Express.js, TypeScript, Node 20 |
| Database | Neon PostgreSQL (serverless) |
| Voice | Modal serverless GPU (Modal → cp-team owns) |
| Deploy | Cloudflare Pages (frontend) + ECS Fargate (backend) |
| CI/CD | GitHub Actions + OIDC |

---

## Environment

```bash
# Local dev backend (port 3031 → ngrok tunnel)
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
docker compose up -d backend   # Docker
# or: PORT=3031 npm run dev    # Direct

# Web-ui local dev
cd packages/web-ui && npm run dev  # localhost:3032

# Webhook URLs
# local: https://clara-code-backend-dev.ngrok.quiknation.com/api/webhooks/clerk
# dev:   https://api-dev.claracode.com/api/webhooks/clerk
# prod:  https://api.claracode.com/api/webhooks/clerk
```

---

## Design System

**All mockups:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code/mockups/`
**Magic Patterns prompts:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code/prompts/2026/April/10/1-not-started/`

Colors: `#09090F` bg · `#7C3AED` purple · `#7BCDD8` teal · `#10B981` green
Fonts: Inter (headings/body) + JetBrains Mono (all terminal/code content)

---

## Related Commands

- `/cp-team` — Clara Platform infrastructure (voice server, Hermes, Modal)
- `/clara-agents` — claraagents.com storefront team
- `/gran` — Architecture decisions affecting clara-code
- `/mary` — Product strategy and pricing
