# brainstorm - Creative Ideation Sessions

Develop ideas collaboratively before committing to code. Brainstorming with AI is nearly free — and it's where the best features are born.

**Agent:** `dialogue-facilitator`
**Philosophy:** Every great feature started as a conversation, not a command.

## Usage
```
/brainstorm "How should we handle international payments for the diaspora?"
/brainstorm "What would a killer onboarding experience look like for Clara?"
/brainstorm "Name ideas for the NOI education module"
/brainstorm "How can Site962 capture all revenue streams in one app?"
/brainstorm "What features would make FOI paper sales tracking amazing?"
```

## Arguments
- `<idea>` (required) — The seed idea or question to explore
- `--names` — Focus on naming (products, features, services)
- `--features` — Focus on feature ideation
- `--strategy` — Focus on business/technical strategy
- `--wild` — Remove constraints, think big, no bad ideas

## What This Command Does

Starts a **creative dialogue** — NOT a planning session. The goal is to generate possibilities, not narrow to one solution. That comes later.

### The Process

1. **Seed** — You share the idea
2. **Expand** — AI generates 3-5 directions it could go, asks which excite you
3. **Riff** — Go back and forth developing the strongest ideas
4. **Combine** — Look for unexpected connections between ideas
5. **Crystallize** — Distill into 2-3 concrete concepts worth pursuing
6. **Next Step** — When ready, transition to `/plan-design` or `/research`

### Rules of Brainstorming
- No idea is too wild in the brainstorm phase
- Build on ideas ("yes, and...") before critiquing
- Quantity over quality initially — narrow later
- Connect to the mission — how does this serve the community?
- Think about the story — what would Clara Villarosa say?

### Output Style
Conversational, not formal. Bullet points and short paragraphs, not TypeScript interfaces. This is a dialogue, not documentation.

## Examples

### Feature Ideation
```
/brainstorm "What would make our payment dashboard stand out from every other Stripe dashboard?"
```
→ Ideas flowing: Kemetic visual themes, dual-provider comparison view, diaspora heat map showing where money flows, "economic connection score"...

### Naming Session
```
/brainstorm --names "We need a name for the NOI's unified platform — it houses all 9 ministries"
```
→ Name exploration: cultural references, historical significance, what would the Honorable Minister Farrakhan want it to feel like?

### Strategy
```
/brainstorm --strategy "How do we make Clara different from ChatGPT and actually useful for our community?"
```
→ Strategic thinking: Clara knows your business, speaks your language, connects you to the diaspora economy, tells the story behind every interaction

### Wild Ideas
```
/brainstorm --wild "What if every Quik Nation app had AI that could..."
```
→ Unconstrained: cross-app intelligence, Clara remembering you across all Herus, predictive business insights, automatic Yapit routing based on customer location...

## Why This Matters

Users who brainstorm first build better products:
- Features align with the MISSION, not just the spec
- Naming carries MEANING (every name is a thesis statement)
- Strategy emerges from dialogue, not assumptions
- The AI brings perspectives you haven't considered

**10 minutes of brainstorming saves 10 hours of rebuilding.**

## Related Commands
- `/research` — Investigate before you ideate
- `/talk` — Reason through decisions
- `/teach` — Learn something that informs your brainstorm
- `/plan-design` — After brainstorming, formalize into a plan
- `/brainstorm-domains` — Specifically for domain name ideation
