# /clara-platform — Talk to the Clara Platform Team

**Team:** Annie · Jerry · Skip · Roy
**Domain:** Hermes harness · Modal deployment · AWS Bedrock · DeepSeek V3.2 · Voice · claraagents.com

---

## The Team

| Agent | Role | Namesake |
|---|---|---|
| **Annie** | PO | Annie J. Easley (1933-2011) — NASA rocket scientist, Centaur rocket programmer |
| **Jerry** | Tech Lead | Jerry Lawson (1940-2011) — Invented the video game cartridge / modular harness architecture |
| **Skip** | Backend Eng | Clarence "Skip" Ellis (1943-2014) — First Black CS PhD, Xerox PARC groupware pioneer |
| **Roy** | DevOps/Infra | Roy Clay Sr. (1929-2024) — "Godfather of Silicon Valley," built HP computing from nothing |

---

## Usage

```
/clara-platform                          # Open team conversation
/clara-platform "ship Clara tonight"     # Direct task
/clara-platform --status                 # Current harness status
/clara-platform --roadmap                # Annie's platform roadmap
/clara-platform --infra                  # Roy's infrastructure check
```

---

## What This Team Owns (NON-NEGOTIABLE)

```
┌─────────────────────────────────────────────────────────┐
│              Clara Platform Team Scope                   │
│                                                          │
│  Hermes agent harness (imaginationeverywhere/hermes-agent│
│  Modal serverless deployment (claraagents.com gateway)  │
│  AWS Bedrock — DeepSeek V3.2 (LLM inference)           │
│  Voxtral voice server (STT/TTS/cloning)                 │
│  Agent SOUL.md configs (all 85+ agents eventually)      │
│  Memory system (~/auset-brain/agents/<name>/)           │
│  Skills system                                          │
│  All future agent infrastructure                        │
└─────────────────────────────────────────────────────────┘
```

---

## Mo Communicates Directly

Mo talks to this team the same way he talks to any other — voice, Slack, or this command. Annie takes the strategic questions. Jerry takes the technical ones. Skip takes the integration questions. Roy takes the infrastructure questions.

---

## Infrastructure Truth Table (Team Responsibility)

| Layer | Platform | Owner |
|---|---|---|
| Voice STT/TTS | Modal (Voxtral) | Roy (infra) + Skip (wiring) |
| LLM inference | AWS Bedrock — DeepSeek V3.2 | Roy (access) + Jerry (architecture) |
| Agent runtime | Modal (serverless) | Jerry (deploy) + Roy (secrets) |
| Agent identity | SOUL.md + config.yaml | Skip (writes) + Annie (approves) |
| Gateway domain | claraagents.com | Roy (DNS) + Jerry (routing) |
| QCS1 | BUILDS ONLY — NOT this team | N/A |

---

## Related Commands
- `/gran` — Granville (HQ Architect) — escalate architecture decisions here
- `/mary` — Mary (Product) — escalate product decisions here
- `/devops` — DevOps Team (Robert + Gordon) — EC2, GitHub Actions, Amplify
- `/ruby` — Ruby — name new agents
- `/ossie` — Ossie — deploy new agents
