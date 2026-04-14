---
description: Generate a filled .claude/design-system.md from brand tokens and project name
---

# /init-design-system — Generate project design-system.md

## Purpose

Produce a **filled-in** `.claude/design-system.md` for a Heru by merging the boilerplate template (`.claude/design-system.md`) with concrete brand colors, fonts, and project name. Optionally start from a **pre-filled** profile:

- **Dark platform (Clara / claraagents):** `.claude/design-system-templates/dark-platform-clara.md`
- **Light consumer (WCR / FMO / QuikCarRental-style):** `.claude/design-system-templates/light-consumer-default.md`

## Usage

```text
/init-design-system --primary="#7C3AED" --background="#09090F" --font="Inter" --project="Clara Code"
```

### Supported flags

| Flag | Required | Description |
|------|----------|-------------|
| `--primary` | Recommended | Primary brand hex (CTAs, focus rings) |
| `--secondary` | Optional | Secondary accent hex |
| `--background` | Recommended | Page background hex |
| `--surface` | Optional | Card/modal surface hex |
| `--text` | Optional | Primary text hex |
| `--text-muted` | Optional | Muted text hex |
| `--font` | Recommended | Primary UI font family name |
| `--font-mono` | Optional | Monospace font (default: JetBrains Mono or system mono) |
| `--project` | Required | Display name for the `# Design System — …` title |
| `--preset` | Optional | `dark-clara` \| `light-consumer` — copy from pre-filled template then override with flags |

If hex values are omitted, infer sensible defaults from `--preset` or ask one short follow-up question.

## Agent instructions

1. Parse all flags from the user message (quoted values allowed).
2. If `--preset=dark-clara`, start from `.claude/design-system-templates/dark-platform-clara.md` and override any supplied hex/font/project name.
3. If `--preset=light-consumer`, start from `.claude/design-system-templates/light-consumer-default.md` and replace `[BRAND PRIMARY]` with `--primary`.
4. Otherwise start from `.claude/design-system.md` (template with placeholders) and replace every `[hex]`, `[font name]`, and `[PROJECT NAME]`.
5. Write the result to **`.claude/design-system.md`** in the repo root (overwrite). Do not strip the **AI agents** sections.
6. If the repo also uses `docs/design-system.md` for human readers, optionally sync a short pointer or duplicate—only if the project already follows that pattern.
7. Summarize what was written and list the resolved tokens (table).

## Acceptance

- `.claude/design-system.md` exists and is fully filled (no `[hex]` placeholders left unless explicitly deferred).
- Typography, spacing, radius, shadows, and “Don’t” sections remain intact.
- User can run again to tweak a single token by re-supplying flags.

## After completion

Commit with message: `feat(design): init design-system.md for <project>`
