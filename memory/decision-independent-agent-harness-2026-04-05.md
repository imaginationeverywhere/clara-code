---
type: decision
date: 2026-04-05
topic: Independent Agent Harness Architecture
status: approved-for-implementation
---

# Decision: Independent Agent Harness with Paperclip Orchestration

## Context
All 115 Quik Nation agents are currently impersonations — a single Claude Code session reads an agent's .md file and roleplays. Agents have no independent brain, memory, or ability to act without the host session. Mo wants to decouple agents into truly independent entities with their own harnesses.

## Decision
Use Paperclip (forked at imaginationeverywhere/paperclip) as the orchestration layer, combined with per-agent brain directories in the vault, a 3-tier runtime system, and the existing voice/communication infrastructure.

## Key Architecture Choices

1. **Paperclip = Layer 4 (Company)** — Org chart, tickets, budgets, heartbeats, governance. It sits on top of our existing infrastructure, not replacing it.

2. **Agent Brain = Layer 3 (Memory)** — `~/auset-brain/agents/<name>/` with identity, memory, decisions, conversations, context. Brain loader script injects this as system prompt on every session start.

3. **3-Tier Runtime = Layer 2 (Execution)**:
   - Tier 1 (Opus): Granville, Mary, Gary, Fannie Lou — Claude Code sessions in tmux, always-on
   - Tier 2 (Sonnet): Katherine, Mark, Nikki, Maya, Lewis, Abbott, Daniel — Claude Code or Cursor Agent, scheduled heartbeats
   - Tier 3 (Haiku): 100+ workers — API-only calls, on-demand

4. **Communication = Layer 1 (Already Built)** — Swarm Telegraph + tmux send-keys + Voice-to-Swarm + MiniMax cloned voices

## Cost Estimate
~$1,430/mo steady state (vs $10,547/mo minimum revenue from 53 Herus)

## Implementation
6-phase roadmap over 10 weeks. Full plan at `.claude/plans/2026-04-05-independent-agent-harness-architecture.md`

## Research Sources
- Paperclip repo and docs (paperclip.ing)
- Greg Isenberg x Dotta interview (YouTube C3-4llQYT8o)
- Leon van Zyl setup tutorial (YouTube XCamx18L7XE)
- Instagram reels on AI agent missing layer (DWm7iM9CZqx, DWWObjiCWYg)
