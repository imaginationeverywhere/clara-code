# /clara-research — Clara's Auto-Research Loop

**Powered by:** Clara (Clara Villarosa) — Quik Intelligence AI

Clara researches topics autonomously and writes findings to the Auset Brain vault. She runs on a cron (every 4 hours) or on-demand.

## Usage
```
/clara-research "What are competitors doing in car rental tech?"
/clara-research --topic "Yapit API capabilities"
/clara-research --heru qcr                     # Research context for a specific Heru
/clara-research --market "Black barbershop tech"
/clara-research --loop                          # Start continuous research loop
/clara-research --status                        # Show current research queue
```

## Arguments
- `<topic>` (optional) — Research topic in natural language
- `--topic <topic>` — Same as positional argument
- `--heru <name>` — Research context for a specific Heru project
- `--market <segment>` — Market research for a segment
- `--competitor <name>` — Competitive analysis
- `--tech <technology>` — Technology research (capabilities, pricing, alternatives)
- `--loop` — Start continuous research loop (runs every 4 hours via cron)
- `--status` — Show research queue and recent findings
- `--stop` — Stop the continuous research loop

## How Clara Researches

### On-Demand (single query)
1. Parse the research question
2. Search web for current information
3. Synthesize findings into a structured note
4. Write to `auset-brain/Research/<topic>.md` with frontmatter
5. Add wikilinks to related vault notes
6. Update `MOC.md`

### Continuous Loop (--loop)
Clara runs on a 4-hour cron and automatically researches:
1. **Competitor moves** — What are competitors doing in each Heru's market?
2. **Technology updates** — New versions, breaking changes, security advisories
3. **Market trends** — Industry news relevant to active Herus
4. **Pricing intelligence** — Competitor pricing, market rates
5. **API changes** — Stripe, Clerk, Twilio, AWS announcements

### Research Output Format
Each research note follows this structure:
```markdown
---
name: <topic>
date: <date>
tags: [research, <category>]
source: [<urls>]
confidence: high|medium|low
relevance: <which Herus this affects>
---

## Summary
<2-3 sentence executive summary>

## Key Findings
- Finding 1
- Finding 2

## Implications for Quik Nation
<How this affects our work>

## Sources
- [Source 1](url)
- [Source 2](url)

## Related
- [[related-vault-note-1]]
- [[related-vault-note-2]]
```

## Research Categories
| Category | Example Topics | Vault Path |
|----------|---------------|------------|
| Market | Industry trends, sizing | `Research/Market/` |
| Competitor | What others are building | `Research/Competitors/` |
| Technology | API updates, new tools | `Research/Technology/` |
| Pricing | Market rates, competitor prices | `Research/Pricing/` |
| Legal | Compliance, regulations | `Research/Legal/` |

## Cron Setup
```bash
# Add to QC1 or local cron (runs every 4 hours)
# Managed by haiku-dispatcher.js
clara-auto-research: "0 */4 * * *"
```

## Related Commands
- `/vault-sync` — Sync research findings to memory
- `/research` — Deep manual research (human-guided)
- `/carter` — Talk to Carter about documentation
