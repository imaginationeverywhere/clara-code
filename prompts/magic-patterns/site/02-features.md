# Magic Patterns Prompt — claracode.ai Features Section

**File target:** `packages/web-ui/src/app/(marketing)/components/Features.tsx`
**Type:** Server Component

---

## CONTEXT FOR MAGIC PATTERNS — READ FIRST
**Clara Code is a DESKTOP/TERMINAL APPLICATION** — a voice-first AI coding assistant.
This is the features section of its marketing site. Aesthetic: premium developer tool,
like Vercel, Cursor, or Warp. Dense bento grid layout. No mobile-first stacks.
Developer-grade language. The mini file tree and code snippet inside cards should look
like actual terminal/IDE output — not decorative illustrations.

---

## Prompt

```
Create a features marketing section for claracode.ai — the landing page for Clara Code, a voice-first AI coding assistant.

**Section wrapper:** py-28 bg-[#080C12] (slightly darker than hero)

**Section intro (text-center mb-20):**
- Overline: "WHY CLARA CODE" — text-[11px] text-white/30 tracking-[0.2em] uppercase
- H2: "Built for how developers actually think." — text-[40px] font-bold text-white mt-3
- Sub: "Not how they type." — text-[40px] font-bold bg-gradient-to-r from-[#7C3AED] to-[#4F8EF7] bg-clip-text text-transparent inline

**Feature bento grid (max-w-5xl mx-auto, grid grid-cols-12 gap-4):**

Card 1 — LARGE (col-span-7, row-span-2) — Voice-First Input:
- bg-[#0D1117] rounded-2xl border border-white/8 p-8 overflow-hidden relative
- Top: icon container w-10 h-10 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center, mic SVG icon text-[#7C3AED]
- H3: "Speak. Don't type." text-white text-xl font-semibold mt-4
- P: "Hold the mic button, say what you want built. Clara Code transcribes, interprets, and implements — while you think of the next thing." text-white/55 text-sm mt-2 leading-relaxed
- Bottom mock UI (mt-6 rounded-xl bg-[#070A0F] border border-white/5 p-4):
  - Waveform bars: 16 vertical bars, heights varying (4px to 28px), all bg-[#7C3AED] rounded-full, spaced 4px apart, centered
  - Below bars: text-[#10B981] text-xs font-mono mt-3 "▶ 'Create a React component for the user profile card with avatar, name, and bio'"
- Decorative: soft purple radial glow at bottom-right of card (absolute, pointer-events-none)

Card 2 — MEDIUM (col-span-5) — Context-Aware:
- bg-[#0D1117] rounded-2xl border border-white/8 p-6
- Icon: sparkles, bg-[#10B981]/10, text-[#10B981]
- H3: "Knows your codebase." text-white text-lg font-semibold mt-3
- P: "Clara Code reads your project structure before answering. No copy-pasting files into a chat window." text-white/55 text-sm mt-2 leading-relaxed
- Mini file tree (mt-4 font-mono text-xs text-white/40 space-y-1):
  - "📁 src/" text-white/60
  - "  📄 components/UserCard.tsx" text-[#10B981]
  - "  📄 lib/auth.ts"
  - "  📄 app/page.tsx"

Card 3 — MEDIUM (col-span-5) — Open Source:
- bg-[#0D1117] rounded-2xl border border-white/8 p-6
- Icon: code brackets <>, bg-[#4F8EF7]/10, text-[#4F8EF7]
- H3: "MIT licensed." text-white text-lg font-semibold mt-3
- P: "Fork it. Self-host it. Build on top of it. The harness is open; the intelligence scales with your subscription." text-white/55 text-sm mt-2 leading-relaxed
- GitHub stars badge (mt-4): rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/50 flex items-center gap-1.5 — "⭐ 2.4k stars on GitHub" — inline-flex w-fit

Card 4 — WIDE (col-span-12) — Multimodal:
- bg-gradient-to-r from-[#0D1117] to-[#0A0E14] rounded-2xl border border-white/8 p-8 flex items-center justify-between gap-8
- Left (max-w-sm):
  - Icon: waveform/sound, bg-[#7C3AED]/10, text-[#7C3AED]
  - H3: "Voice is the default. Text is the escape hatch." text-white text-xl font-semibold mt-3
  - P: "Toggle between voice and text anytime. Power users use both — voice for intent, keyboard for precision edits." text-white/55 text-sm mt-2 leading-relaxed
- Right: two-button toggle mock (flex rounded-xl bg-[#070A0F] border border-white/8 p-1 gap-1):
  - Button 1 (active): rounded-lg bg-[#7C3AED] px-4 py-2 flex items-center gap-2 text-white text-sm font-medium — mic icon "Voice"
  - Button 2 (inactive): rounded-lg px-4 py-2 flex items-center gap-2 text-white/40 text-sm — keyboard icon "Text"

Server Component. Tailwind only. No JavaScript needed.
```
