# Memory Index

## Decisions
- [2026-04-05 — Swarm Communication Architecture](decision-swarm-comms-architecture-2026-04-05.md) — Event-driven inbox dispatcher, tmux-based wake, cron removal, push-herus resilience
- [2026-04-05 — Independent Agent Harness Architecture](decision-independent-agent-harness-2026-04-05.md) — Paperclip orchestration, per-agent brains, conversational voice agents (Bedrock Haiku $200/mo cap), Claude Max + Cursor Ultra for dev work
- [2026-04-05 — Mistral Voxtral Voice Engine](decision-mistral-voxtral-voice-engine-2026-04-05.md) — Replacing MiniMax + Deepgram with Mistral Voxtral (STT + TTS + voice cloning, one provider)
- [2026-04-05 — DeepSeek V3.2 Primary LLM](decision-deepseek-v3-primary-llm-2026-04-05.md) — **SUPERSEDED 2026-04-25.** Originally named DeepSeek V3.2 as primary; canonical stack is now Gemma 4 27B on Modal (default, ~80%), Kimi K2 on Modal (reasoning, ~10-15%), DeepSeek V3 on Bedrock (heavy/long-context only, ~3-5%), premium <1%. See `decision-canonical-stack-supersedes-deepseek-primary-2026-04-25.md` and `pricing/model-routing-strategy.md`.
- [2026-04-25 — Canonical Inference Stack (supersedes DeepSeek-primary)](decision-canonical-stack-supersedes-deepseek-primary-2026-04-25.md) — Pointer of record for current routing: Gemma 4 27B on Modal A100 default (~80%), Kimi K2 on Modal H100 reasoning (~10-15%), DeepSeek V3 on Bedrock heavy/long-context (~3-5%), Claude/GPT premium (<1%). Voice = Voxtral on Modal A10G + Gemma 4 via Hermes router. Live truth lives in `pricing/model-routing-strategy.md`.
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
- [Paperclip Voice Full Plan](.claude/plans/2026-04-05-paperclip-voice-full-plan.md) — **Routing layer SUPERSEDED 2026-04-25.** Three Paperclip companies (Internal/Clara Voice/Client Dashboard). NO chat boxes. Voice-first across every Heru. @auset packages. LLM routing in this plan named DeepSeek V3.2 as primary; canonical is now Gemma 4 27B on Modal first, DeepSeek V3 demoted to ~3-5% heavy/long-context. See `pricing/model-routing-strategy.md`.
- [Clara Voice Heru Sprint Plan](.claude/plans/2026-04-06-clara-voice-heru-sprint-plan.md) — 20 Herus in 4 sprints (10 agent-days). Per-Heru voice features, tool registries, agent personas. Revenue machines first, then conversion, then service, then platform.
- [Hermes + Syncthing Integration](.claude/plans/2026-04-06-hermes-syncthing-integration.md) — Hermes Agent as execution layer, Paperclip as governance layer, Syncthing as file sync layer. 85 agents migrated from .md impersonation to independent Hermes instances with persistent memory, auto-skills, and 14+ platform reach. Modal serverless = $0 when idle.
