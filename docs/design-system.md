# Clara Code — design system

**Magic Patterns:** Full typography, color names, icon pin list, brand rules, and component generation prompts for [magicpatterns.com](https://magicpatterns.com) are in [`magic-patterns-clara-code-setup.md`](./magic-patterns-clara-code-setup.md). Use that file when creating or refreshing the Magic Patterns design system; this document stays aligned with the same token hex values for code.

Source of truth for color tokens: `mockups/app/src/index.css` (`:root` variables). Tailwind mirrors these in `frontend/tailwind.config.ts` — use semantic classes in components, not raw hex in `className`.

## Brand & Clara

| Token | Hex | Tailwind |
| --- | --- | --- |
| Clara teal | `#7BCDD8` | `text-clara`, `bg-clara`, `text-clara-teal` |
| Clara glow | `#A8DDE5` | `text-clara-teal-glow`, `bg-clara-teal-glow` |
| Clara accent | `#4DDDFF` | `text-clara-teal-accent` |
| Brand purple | `#7C3AED` | `text-brand-purple`, `bg-brand-purple`, `border-brand-purple` |
| Purple hover | `#6D28D9` | `text-brand-purple-hover` |
| Brand blue | `#4F8EF7` | `text-brand-blue` |
| Brand green | `#10B981` | `text-brand-green` |

## Surfaces (backgrounds)

| Token | Hex | Tailwind |
| --- | --- | --- |
| Base | `#0D1117` | `bg-bg-base` |
| Raised | `#0F1318` | `bg-bg-raised` |
| Overlay | `#0A0E14` | `bg-bg-overlay` |
| Sunken | `#070A0F` | `bg-bg-sunken` |
| Terminal | `#09090F` | `bg-bg-terminal` |

## Sculpt (brown gradient accents)

| Step | Hex | Tailwind |
| --- | --- | --- |
| 900 | `#150E08` | `bg-sculpt-900` |
| 800 | `#1E1410` | `bg-sculpt-800` |
| 700 | `#2B1810` | `bg-sculpt-700` |
| 600 | `#3D2518` | `bg-sculpt-600` |
| 500 | `#52341F` | `bg-sculpt-500` |

## Text

| Token | Hex | Tailwind |
| --- | --- | --- |
| Primary | `#FFFFFF` | `text-text-primary` |
| Body | `#D9D9D9` | `text-text-body` |
| Secondary | `#B3B3B3` | `text-text-secondary` |
| Muted | `#8C8C8C` | `text-text-muted` |
| Caption | `#737373` | `text-text-caption` |
| Label | `#4D4D4D` | `text-text-label` |
| Ghost | `#333333` | `text-text-ghost` |

## Borders

| Token | Hex | Tailwind |
| --- | --- | --- |
| Default | `#141414` | `border-border` |
| Hover | `#1F1F1F` | `border-border-hover` |
| Focus | `#333333` | `border-border-focus` |
| Strong | `#4D4D4D` | `border-border-strong` |

## Syntax (CLI / code highlights)

| Role | Hex | Tailwind |
| --- | --- | --- |
| Keyword | `#7C3AED` | `text-syntax-keyword` |
| Type | `#4F8EF7` | `text-syntax-type` |
| String | `#10B981` | `text-syntax-string` |
| Function | `#A8DDE5` | `text-syntax-function` |
| JSX | `#7BCDD8` | `text-syntax-jsx` |
| Attribute | `#FBBF24` | `text-syntax-attribute` |
| Number | `#FB923C` | `text-syntax-number` |
| Comment | `#4D4D4D` | `text-syntax-comment` |
| Operator | `#8C8C8C` | `text-syntax-operator` |

## Motion

- Waveform bars: `animate-waveform` (keyframes `waveform` in Tailwind config).
- Short fade-in: `animate-fadeIn`.

## Rules

1. Do not use arbitrary hex like `bg-[#09090F]` in new UI — use `bg-bg-terminal` (or the matching token above).
2. Opacity modifiers work on token classes: e.g. `bg-bg-base/80`, `border-brand-purple/20`.
3. Mockups under `mockups/` are reference only; production styles live in `frontend/` and this doc.
