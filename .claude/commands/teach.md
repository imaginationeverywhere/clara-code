# teach - Learn Something In Depth

Ask the AI to teach you something. Not a quick answer — a real explanation tailored to your level, your codebase, and your goals.

**Agent:** `dialogue-facilitator`
**Philosophy:** Understanding WHY something works makes you 10x faster at building with it. Invest 10 minutes learning, save hours debugging.

## Usage
```
/teach "How does GraphQL federation work and should we use it?"
/teach "Explain Stripe Connect account types like I'm setting it up for the first time"
/teach "What is the Ausar Engine actually doing under the hood?"
/teach "How do WebSockets work and how would we add them to our Express backend?"
/teach --our-code "Walk me through how a feature gets activated in our system"
```

## Arguments
- `<topic>` (required) — What you want to learn
- `--our-code` — Teach using examples from THIS codebase, not generic examples
- `--beginner` — Start from the very basics, assume no prior knowledge
- `--advanced` — Skip the basics, go deep on internals and edge cases
- `--visual` — Use diagrams, flow charts, and ASCII art to illustrate
- `--practical` — Focus on "how do I use this" over "how does this work"

## What This Command Does

Starts a **teaching conversation**. The AI explains, checks understanding, adjusts to your level, and uses YOUR codebase as the textbook.

### Teaching Approach

1. **Assess** — What do you already know? (Quick question or infer from context)
2. **Foundation** — Core concept in 2-3 sentences
3. **Concrete Example** — Show it in code (preferably from YOUR project)
4. **Build Up** — Layer on complexity one piece at a time
5. **Check Understanding** — "Does this make sense so far?"
6. **Apply** — "Here's how this connects to what you're building"

### What Makes This Different From Google

- Uses YOUR codebase for examples, not generic tutorials
- Knows YOUR architecture (Ausar Engine, Kemetic naming, dual payments)
- Adjusts to YOUR level in real-time
- Answers follow-up questions in context
- Connects learning to YOUR actual work

## Examples

### Technology Concept
```
/teach "How does Clerk's multi-tenant system work?"
```
→ Explanation using our actual Clerk setup, how tenant_id flows through our system, how RBAC maps to PLATFORM_OWNER vs SITE_OWNER...

### Codebase Deep-Dive
```
/teach --our-code "How does a request flow from the frontend through Apollo to our backend resolvers?"
```
→ Step-by-step trace through actual files: frontend Apollo Client → backend Express → Apollo Server → resolvers → context.auth → database

### Practical Learning
```
/teach --practical "How do I add a new GraphQL mutation to our backend?"
```
→ Step-by-step using our patterns: schema.graphql, resolvers.ts, service class, Maat validation, auth context

### Beginner-Friendly
```
/teach --beginner "What is Docker and why do we use it?"
```
→ Starts from zero, builds up to how Docker works in our development and deployment

### Advanced Deep-Dive
```
/teach --advanced "How does Apollo Client's cache normalization work and when does it break?"
```
→ Internals, edge cases, cache policies, when to use fetchPolicy vs refetch, gotchas

## Why This Matters

Developers who understand their tools build faster and debug easier:
- **10 minutes learning GraphQL federation** prevents 2 hours debugging a schema merge issue
- **Understanding Stripe Connect account types** prevents building the wrong payment flow
- **Knowing how the Ausar Engine works** means you can extend it confidently

The tokens spent teaching are the best ROI in your entire workflow.

## Related Commands
- `/research` — When you need facts and comparisons, not explanations
- `/talk` — When you want to reason through a decision
- `/brainstorm` — When you want to generate ideas
- `/explore` — When you want to discover what's in the codebase
