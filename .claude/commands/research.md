# research - Deep Research Before You Build

Understand something deeply before writing a single line of code. Research is the cheapest thing you can do with AI — a 20-message research conversation costs fewer tokens than one `/backend-dev` invocation.

**Agent:** `dialogue-facilitator`
**Philosophy:** Talk to the AI first, command it second. The conversation IS the product.

## Usage
```
/research "Yapit API capabilities vs Stripe Connect"
/research "Best approach for real-time notifications in our stack"
/research "How does Clerk handle multi-tenant RBAC?"
/research "What are the trade-offs of GraphQL federation vs monolithic schema?"
/research --codebase "How does the Ausar Engine resolve feature dependencies?"
/research --web "Latest Next.js 16 server component patterns"
```

## Arguments
- `<topic>` (required) — What you want to understand
- `--codebase` — Focus research on THIS codebase (read files, trace patterns)
- `--web` — Include web search for external information
- `--compare` — Structure as a comparison (X vs Y)
- `--deep` — Go deeper than surface level — read source code, trace execution paths

## What This Command Does

This is NOT a code generation command. It starts a **research conversation**.

### Step 1: Understand the Question
Read the topic and determine what kind of research this is:
- **Technology comparison** — "X vs Y" → structured pros/cons table
- **API exploration** — "How does X work?" → endpoints, capabilities, limits
- **Architecture question** — "Best approach for X" → patterns, trade-offs
- **Codebase investigation** — "How does our X work?" → file traces, flow diagrams
- **External research** — "What's the latest on X?" → web search, documentation

### Step 2: Research
- If `--codebase`: Read relevant files, trace patterns, understand current implementation
- If `--web`: Search for documentation, blog posts, official guides
- If `--compare`: Build structured comparison matrix
- Always: Gather facts before forming opinions

### Step 3: Present Findings
Structure findings clearly:
- **Summary** — One paragraph answer
- **Details** — Organized by subtopic
- **Comparison** (if applicable) — Pros/cons table
- **Recommendation** — What would YOU do and why?
- **Questions** — What should the user think about next?

### Step 4: Continue the Conversation
After presenting findings, ask:
> "What aspect would you like to dig deeper into? Or does this answer your question?"

This is a DIALOGUE, not a report dump. Keep going until the user understands.

## Examples

### Technology Research
```
/research "Should we use WebSockets or Server-Sent Events for real-time notifications?"
```
→ Comparison table, our stack's constraints, recommendation, follow-up questions

### API Exploration
```
/research "What can Yapit's Bulk Payout API do and how does it compare to Stripe payouts?"
```
→ Feature comparison, endpoint details, code examples, integration considerations

### Codebase Investigation
```
/research --codebase "How does the feature loader discover and activate features?"
```
→ File-by-file trace through feature-loader.ts, ausar-engine.ts, activation flow

### Architecture Decision
```
/research "Microservices vs monolith for the NOI platform — what makes sense?"
```
→ Trade-offs specific to our context, team size, deployment model, recommendation

## Why This Matters

Most users jump straight to `/backend-dev` or `/vibe-build`. But 15 minutes of research conversation:
- Prevents hours of building the wrong thing
- Surfaces constraints you didn't know about
- Reveals existing code you can reuse
- Costs ~5K tokens vs ~100K+ for code generation

**The cheapest bug is the one you never write.**

## Related Commands
- `/brainstorm` — Creative ideation (research feeds brainstorming)
- `/talk` — Open-ended reasoning and strategy
- `/teach` — Learn a concept in depth
- `/explore` — Discover what's possible
- `/plan-design` — After research, plan the implementation
