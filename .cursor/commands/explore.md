# explore - Discover What's Possible

Explore your codebase, a technology, or an idea space without a specific goal. Sometimes you need to look around before you know what to build.

**Agent:** `dialogue-facilitator`
**Philosophy:** Not every interaction needs a destination. Discovery is valuable on its own.

## Usage
```
/explore "What features does our Ausar Engine already have that I might not know about?"
/explore "What can Yapit's API do beyond basic payments?"
/explore "What patterns are other multi-tenant SaaS platforms using?"
/explore --codebase "What's in backend/src/features/ that's actually implemented vs. just scaffolded?"
/explore "What would it take to add real-time to our stack?"
```

## Arguments
- `<area>` (required) — What you want to explore
- `--codebase` — Explore THIS project's code, files, patterns
- `--web` — Explore external resources, documentation, examples
- `--possibilities` — "What could we do with X?" — open-ended exploration
- `--map` — Create a visual map of what you find

## What This Command Does

An **open-ended investigation**. No predetermined outcome. You're exploring to discover, not to confirm.

### Exploration Modes

**Codebase Discovery (`--codebase`)**
Walk through directories, read files, trace connections:
- "What's actually in this directory?"
- "Which features are real vs. placeholders?"
- "How are these modules connected?"
- "What tests exist and what do they cover?"

**Technology Exploration**
Investigate what a technology or API can do:
- "What endpoints does this API have?"
- "What are the limits and pricing?"
- "What's the developer experience like?"
- "What are people building with this?"

**Possibility Space (`--possibilities`)**
Open-ended "what if" exploration:
- "What could we build with the data we already have?"
- "What integrations would unlock new capabilities?"
- "What are competitors doing that we're not?"
- "What would the ideal version of this look like?"

**Mapping (`--map`)**
Create a visual representation of what's discovered:
- Directory trees with annotations
- Feature maps showing status
- Dependency graphs
- Integration maps

### How Exploration Works

1. **Start Broad** — Quick scan of the area
2. **Find Interesting Things** — Surface surprises, unknowns, opportunities
3. **Report Back** — "Here's what I found. What catches your eye?"
4. **Dive Deeper** — Explore what interests you
5. **Connect** — "This connects to X in your plans..."

No pressure to reach a conclusion. Exploration is the point.

## Examples

### Codebase Exploration
```
/explore --codebase "What's the actual state of backend/src/features/? What's real and what's scaffolding?"
```
→ Directory walk, file size analysis, which features have actual logic vs. empty templates, which have tests...

### API Exploration
```
/explore "What can we do with Cloudflare Workers AI beyond chat?"
```
→ Discover: image classification, text-to-speech, embeddings, RAG, function calling, structured outputs...

### Possibility Exploration
```
/explore --possibilities "What features would blow people's minds at a Site962 event?"
```
→ NFC check-in + automatic revenue attribution, real-time event dashboards, Clara concierge at the door, cross-app loyalty points...

### Mapping
```
/explore --map "Show me how all the Quik Nation products connect to each other"
```
→ Visual map: QuikEvents → Site962, QuikCarRental → QuikCarry, QuikBarber → QuikDollars, all through Auset Platform...

## Why This Matters

Exploration prevents tunnel vision:
- You might discover a feature already exists (no need to build)
- You might find an API capability that changes your approach
- You might connect two ideas that create something new
- You might realize the real problem is different from what you assumed

**Exploration is not wasted time. It's the time that prevents wasted work.**

## Related Commands
- `/research` — When you have a specific question to answer
- `/brainstorm` — When you want to generate ideas from what you discovered
- `/talk` — When exploration leads to a decision to reason through
- `/teach` — When you find something you want to understand deeply
- `/progress` — Quick check of what's built vs. planned
- `/gap-analysis` — Deep analysis of built vs. planned
