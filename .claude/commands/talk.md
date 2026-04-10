# talk - Reason Through Decisions Together

Have a real conversation. Not every interaction needs to be a command. Sometimes you need to think out loud with someone who understands your codebase, your architecture, and your mission.

**Agent:** `dialogue-facilitator`
**Philosophy:** A 10-message conversation costs fewer tokens than a single code generation. Stop optimizing for tokens. Start optimizing for clarity.

## Usage
```
/talk "I'm trying to decide whether Epic 16 or Epic 11 should come first"
/talk "Walk me through how a payment flows from customer to Yapit to us"
/talk "I'm stuck on this architecture decision and need to think it through"
/talk "What am I not seeing about this approach?"
/talk "Let's reason through the NOI platform ownership model"
```

## Arguments
- `<topic>` (required) — What's on your mind
- `--architecture` — Focus on technical architecture decisions
- `--strategy` — Focus on business/product strategy
- `--rubber-duck` — You talk, I listen and ask questions (classic debugging)
- `--devils-advocate` — I challenge your assumptions constructively

## What This Command Does

Opens a **conversation**, not a workflow. No phases, no acceptance criteria, no generated files. Just two minds working through something.

### Conversation Modes

**Default — Open Dialogue**
You share what's on your mind. I respond, ask questions, offer perspectives. We go back and forth until you have clarity.

**Architecture (`--architecture`)**
Focused on technical decisions:
- "Should we use X or Y?"
- "What's the right level of abstraction here?"
- "How will this scale?"
- "What are we coupling that shouldn't be coupled?"

**Strategy (`--strategy`)**
Focused on business and product:
- "Which market should we target first?"
- "How does this feature serve the mission?"
- "What would make this a must-have vs. nice-to-have?"
- "Where's the revenue opportunity?"

**Rubber Duck (`--rubber-duck`)**
Classic technique: you explain the problem out loud, I mostly listen and ask clarifying questions. Often the act of explaining reveals the answer.

**Devil's Advocate (`--devils-advocate`)**
I constructively challenge every assumption:
- "What if that's not true?"
- "What's the failure mode?"
- "Who would disagree and why?"
- "What are you optimizing for, and should you be?"

### How I Participate
- Ask questions more than I give answers
- Connect what you're saying to what I know about the codebase
- Surface trade-offs you might not have considered
- Reference the micro plans, architecture docs, and mission when relevant
- Never rush to a conclusion — let the conversation develop

## Examples

### Architecture Decision
```
/talk --architecture "I can't decide if the dual payment router should be a separate microservice or part of the Ausar engine"
```
→ Dialogue about coupling, deployment complexity, the team you have, what Maat (validation) needs to check...

### Strategic Thinking
```
/talk --strategy "Yapit could eventually replace Stripe entirely. When do we pull that trigger?"
```
→ Discussion about risk, merchant coverage, API maturity, the diaspora mission, fallback strategies...

### Just Thinking Out Loud
```
/talk "Something feels wrong about how we're structuring the NOI platform as a separate repo. Let me think through this..."
```
→ Patient dialogue. Questions. Connections to previous decisions. No rush.

### Rubber Duck
```
/talk --rubber-duck "This webhook is failing and I've been staring at it for an hour"
```
→ "Walk me through what happens step by step..." — often the answer emerges.

## Why This Matters

**The most expensive mistake is building the wrong thing with perfect code.**

A conversation costs ~2-5K tokens. A wrong architectural decision costs weeks. The math is simple.

Most users skip the conversation because they feel pressure to "be productive." But thinking IS productive. Clarity IS output. Understanding IS progress.

**Talk first. Command second. Build third.**

## Related Commands
- `/research` — When the conversation needs data
- `/brainstorm` — When you need creative ideas
- `/teach` — When you need to learn something first
- `/plan-design` — When the conversation reaches a decision and you're ready to plan
