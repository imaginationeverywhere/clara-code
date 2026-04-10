# Memory Index

## Decisions
- [2026-04-05 — Swarm Communication Architecture](decision-swarm-comms-architecture-2026-04-05.md) — Event-driven inbox dispatcher, tmux-based wake, cron removal, push-herus resilience
- [2026-04-05 — Independent Agent Harness Architecture](decision-independent-agent-harness-2026-04-05.md) — Paperclip orchestration, per-agent brains, conversational voice agents (Bedrock Haiku $200/mo cap), Claude Max + Cursor Ultra for dev work
- [2026-04-05 — Mistral Voxtral Voice Engine](decision-mistral-voxtral-voice-engine-2026-04-05.md) — Replacing MiniMax + Deepgram with Mistral Voxtral (STT + TTS + voice cloning, one provider)
- [2026-04-05 — DeepSeek V3.2 Primary LLM](decision-deepseek-v3-primary-llm-2026-04-05.md) — Bedrock DeepSeek V3.2 as primary voice agent LLM. $1.79/user/mo at 50 turns/day. 93-95% margin at $29-39/mo. Qwen3 fallback. Opus/Sonnet/GPT-4 reserved for Enterprise + Mo's dev work only.
- [2026-04-05 — Paperclip Voice Full Plan](decision-paperclip-voice-full-plan-2026-04-05.md) — Three companies: Internal (Mo's subs), Clara Voice (consumers/SMBs), Client Dashboard. NO chat boxes anywhere. Voice-only UX. @auset packages for all Herus. Free trial: 50 turns, 1 day, Qwen3, $0.006/user.

- [2026-04-06 — Clara Voice Heru Sprint Plan](decision-clara-voice-heru-sprint-2026-04-06.md) — 20 Herus across 4 sprints (10 agent-days). Agent Voice First. QCR booking, WCR assessment, FMO membership, QuikAction estimates — all via voice. +$98,500/mo revenue lift at $65/mo voice cost. 151,500% ROI.
- [2026-04-06 — Hermes Agent + Syncthing Integration](decision-hermes-syncthing-integration-2026-04-06.md) — Hermes Agent (NousResearch, 19K stars, MIT) IS the independent agent harness. Self-improving learning loop, 14+ messaging platforms, voice mode, SOUL.md personas, auto-skills, MCP, subagent delegation. Syncthing replaces S3/git sync. 4 days to migrate 85 agents.
- [2026-04-06 — Voice Conference Architecture](decision-voice-conference-architecture-2026-04-06.md) — Mo-moderated conference (no auto-rotation, Mo calls on agents by name). Family Standup with soul. Roll call attendance sheet. Mic mute toggle. Kill switch for instant silence. BlackHole audio bridge for Slack Huddle + Zoom meetings with clients. speak.py hard cap per turn.

## Reference
- [LLM Self-Hosting Cost Analysis](reference-llm-self-hosting-cost-analysis-2026-04-05.md) — AWS vs Cloudflare vs Bedrock. Cloudflare Qwen3-30B wins at $0.000113/turn. Full models need $21K+/mo (not feasible). Recommended: Cloudflare primary + Bedrock fallback = ~$40/mo total.

## Projects
- [QuikSession — Clara Code dogfood + music IP platform](./project-quiksession-clara-dogfood.md) — Studio session tracking, blockchain attribution, 4 creatives (engineer/producer/writer/artist), verbal publishing capture via STT, auto-royalty smart contracts. Quik's idea Apr 10.

## Architecture Plans
- [Independent Agent Harness](.claude/plans/2026-04-05-independent-agent-harness-architecture.md) — Full roadmap: Paperclip + agent brains + voice + monetization. Users TALK to agents, not type.
- [Paperclip Voice Full Plan](.claude/plans/2026-04-05-paperclip-voice-full-plan.md) — Three Paperclip companies (Internal/Clara Voice/Client Dashboard). NO chat boxes. DeepSeek V3.2 primary. Qwen3 free trial. Every Heru goes voice-first. @auset packages. 94.6% margin at 10K users.
- [Clara Voice Heru Sprint Plan](.claude/plans/2026-04-06-clara-voice-heru-sprint-plan.md) — 20 Herus in 4 sprints (10 agent-days). Per-Heru voice features, tool registries, agent personas. Revenue machines first, then conversion, then service, then platform.
- [Hermes + Syncthing Integration](.claude/plans/2026-04-06-hermes-syncthing-integration.md) — Hermes Agent as execution layer, Paperclip as governance layer, Syncthing as file sync layer. 85 agents migrated from .md impersonation to independent Hermes instances with persistent memory, auto-skills, and 14+ platform reach. Modal serverless = $0 when idle.
