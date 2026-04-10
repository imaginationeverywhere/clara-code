# /clara-agents — Talk to the Clara Agents Team

**Team:** Biddy · James Armistead · Alonzo · Solomon · Annie Malone · Aaron · Blackwell · Henson
**Domain:** claraagents.com · Voice agent storefront · $99/mo subscriptions · Agent provisioning
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/claraagents` (imaginationeverywhere/claraagents)
**tmux:** `clara-agents` (window 10 in swarm)

---

## The Team

| Agent | Role | Namesake |
|---|---|---|
| **Biddy** | PO | Biddy Mason (1818-1891) — Born enslaved, walked 1,800 miles to freedom, became one of the first Black women to own property in LA, built a real estate empire and renowned philanthropist |
| **James Armistead** | Tech Lead | James Armistead Lafayette (1748-1830) — First African American double agent, decisive intelligence at Battle of Yorktown, the Marquis de Lafayette petitioned for his freedom |
| **Alonzo** | Business Strategist | Alonzo Franklin Herndon (1858-1927) — Born enslaved, built Atlanta Life Insurance's 500+ agent distribution network across the South, became wealthiest Black man in America |
| **Solomon** | UX / Human-Agent Psychology | Solomon Carter Fuller (1872-1953) — First Black psychiatrist in America, trained under Alois Alzheimer, spent his career understanding what the human mind fears, trusts, and remembers |
| **Annie Malone** | Growth & Community | Annie Turnbo Malone (1869-1957) — Built a 75,000-agent distribution network, trained Madam C.J. Walker, founded Poro College, the original creator economy |
| **Aaron** | Frontend Engineer | Aaron Douglas (1899-1979) — "Father of African American Art", chief visual architect of the Harlem Renaissance, created the visual grammar that made Black life legible to the world |
| **Blackwell** | Backend Engineer | David Harold Blackwell (1919-2010) — First Black scholar inducted into the National Academy of Sciences, first Black tenured professor at UC Berkeley, revolutionized game theory and Bayesian statistics |
| **Henson** | Mobile Engineer | Matthew Alexander Henson (1866-1955) — First person to reach the North Pole, navigated the most hostile terrain on Earth by learning it, building for it, and moving. Robert Peary got the credit for decades. History gave it back to Matthew |

---

## Usage

```
/clara-agents                            # Open team conversation
/clara-agents "ship the landing page"    # Direct task
/clara-agents --status                   # Product status
/clara-agents --revenue                  # Revenue and waitlist numbers
/clara-agents --roadmap                  # Biddy's product roadmap
```

---

## What This Team Owns

```
┌─────────────────────────────────────────────────────────────┐
│              Clara Agents Team Scope                         │
│                                                              │
│  claraagents.com — customer-facing storefront                │
│  Waitlist capture — email + name, instant confirmation       │
│  Stripe $99/mo — subscription checkout                       │
│  Agent provisioning — on payment, spawn user's agent         │
│  User dashboard — see your agent URL, test widget            │
│  Voice agent UX — how users interact with their agent        │
│                                                              │
│  They do NOT own the infrastructure (that's cp-team)         │
│  They use the gateway — they don't build it                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Revenue Context

- **30 users identified** — ready to pay $99/mo
- **$2,970 MRR** available immediately on launch
- **Waiting list forming** — every day without a checkout is money left on the table
- Clara gateway is LIVE: `https://info-24346--hermes-gateway.modal.run`
- Voice server is LIVE: Modal Voxtral XTTS v2

---

## Infrastructure This Team Uses (DO NOT REBUILD)

| Layer | URL | Owner |
|---|---|---|
| Clara Gateway | `https://info-24346--hermes-gateway.modal.run` | cp-team |
| Voice TTS | `https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/tts` | cp-team |
| LLM | AWS Bedrock DeepSeek V3.2 | cp-team |
| SSM | `/quik-nation/shared/CLARA_GATEWAY_URL` | cp-team |

---

## Mo Communicates Directly

Mo talks to this team the same way he talks to any other — voice, Slack, or this command.
- **Biddy** takes product and strategy questions
- **Alonzo** takes technical architecture questions
- **Solomon** takes backend/API questions
- **Annie Malone** takes frontend/UX questions

---

## Related Commands
- `/clara-platform` — Platform infrastructure team (cp-team)
- `/gran` — Granville (HQ Architect) — architecture escalations
- `/mary` — Mary (Product Owner) — product decisions
- `/marketing` — Marketing team — content, VRDs, launch campaigns
