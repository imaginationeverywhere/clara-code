# Clara Code — Magic Patterns Prompts

Copy-pasteable prompts for generating Clara Code UI components via Magic Patterns.
Paste each prompt into [Magic Patterns](https://magicpatterns.com) → copy the generated component → drop into `packages/web-ui/src/`.

## Two Surfaces

### 1. claracode.ai Marketing Site
The public landing page at `claracode.ai`. Target: `packages/web-ui/src/app/(marketing)/`.

| File | Component | Description |
|------|-----------|-------------|
| `site/01-hero.md` | `Hero.tsx` | Full-screen hero with mic button demo |
| `site/02-features.md` | `Features.tsx` | Bento grid — voice-first, context-aware, open source |
| `site/03-pricing.md` | `Pricing.tsx` | Free / Pro $20 / Team $99 cards |

### 2. Clara Code App Interface
The actual voice-first coding tool. Target: `packages/web-ui/src/app/(app)/`.
**Voice is PRIMARY. Text is a TOGGLE.**

| File | Component | Description |
|------|-----------|-------------|
| `app/01-voice-interface-shell.md` | `AppShell.tsx` | Full IDE layout + voice/text mode toggle state |
| `app/02-file-tree.md` | `FileTree.tsx` | Collapsible file explorer sidebar |
| `app/03-code-panel.md` | `CodePanel.tsx` | Syntax-highlighted code display with active line |
| `app/04-ai-panel.md` | `AIPanel.tsx` | AI response panel with transcript + code blocks |

## Brand Tokens

```
Background:   #0D1117
Purple:       #7C3AED  (primary, voice/AI actions)
Blue:         #4F8EF7  (code accent, "Code" wordmark)
Green:        #10B981  (success, "Apply", transcripts)
Text:         white at various opacities (white/70, white/55, white/30)
Font (body):  Inter
Font (code):  JetBrains Mono
```

## Design Principle

**Voice is the home state.** The mic button is always the largest, most prominent element
in the app interface. Text input appears only when the user toggles to text mode (keyboard icon).
The toggle is small and secondary — not equal billing with voice.

This is different from most AI tools where text is default. Clara Code is inverted.
