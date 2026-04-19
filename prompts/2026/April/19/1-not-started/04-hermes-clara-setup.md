# Prompt 04 — Hermes + Clara Backend Setup
**TARGET REPO:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`  
_(Auto-classified 2026-04-15. If wrong, edit this line before dispatch.)_
**Date:** 2026-04-08
**Status:** NOT STARTED — Pending Mo approval
**Team:** Clara Platform Team (Annie Easley — PO, Jerry Lawson — Tech Lead, Skip Ellis — Backend, Roy Clay — DevOps/Infra)
**Heru:** quik-nation-ai-boilerplate (platform level)
**Classification:** PLATFORM_OWNER — Internal Infrastructure

---

## Objective

Get Clara live as the first active Hermes agent. End-to-end path:

```
Mo sends "Hello Clara" via webhook
→ Hermes Gateway (Modal) routes to Clara agent
→ DeepSeek V3.2 via AWS Bedrock generates response
→ Voxtral TTS speaks the response (Modal voice server — already live)
→ Activity written to ~/auset-brain/Swarms/live-feed.md
```

By the end of this session, Mo can speak to Clara through the webhook and she responds in her own voice.

---

## Infrastructure Truth Table (NON-NEGOTIABLE)

| Layer | Platform | Notes |
|---|---|---|
| Voice STT/TTS | **Modal** | ALREADY LIVE at modal.run URL |
| LLM inference | **AWS Bedrock — DeepSeek V3.2** | NOT Anthropic Claude for agent runtime |
| Agent runtime | **Modal** (serverless) | Deploy Hermes here — hibernates to $0 idle |
| Gateway domain | **claraagents.com** | Target domain for the Hermes Gateway |
| QCS1 | **BUILDS ONLY** | Xcode, EAS, Cursor agents — NEVER for voice/LLM/Hermes |

**Live voice server endpoints (already deployed):**
```
STT: https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/stt
TTS: https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/tts
Clone: https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/clone
Health: https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/health
```

---

## Step 1 — Verify Prerequisites

Before writing a single line of code, verify these are working:

```bash
# 1. Verify voice server is live
curl https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/health

# 2. Verify AWS credentials + Bedrock access
aws sts get-caller-identity
aws bedrock list-foundation-models --region us-east-1 | grep deepseek

# 3. Verify Modal CLI is installed and authenticated
modal token list

# 4. Verify imaginationeverywhere/hermes-agent repo is accessible
gh repo view imaginationeverywhere/hermes-agent
```

If any check fails — STOP and report to live feed before proceeding.

---

## Step 2 — Clone Hermes and Set Up Environment

```bash
# Clone to the platform directory on the working machine
git clone https://github.com/imaginationeverywhere/hermes-agent.git \
  /Volumes/X10-Pro/Native-Projects/AI/hermes-agent

cd /Volumes/X10-Pro/Native-Projects/AI/hermes-agent

# Install Python dependencies
pip install -r requirements.txt

# Install Modal
pip install modal
```

Create `.env` at the repo root:
```bash
# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from SSM /quik-nation/shared/AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<from SSM /quik-nation/shared/AWS_SECRET_ACCESS_KEY>

# Voice server (already live)
CLARA_STT_URL=https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/stt
CLARA_TTS_URL=https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/tts

# Platform
PLATFORM=gateway
GATEWAY_SECRET=<generate with: openssl rand -hex 32>
LIVE_FEED_PATH=/Users/amenra/auset-brain/Swarms/live-feed.md
```

Load credentials from AWS SSM — DO NOT hardcode:
```bash
AWS_ACCESS_KEY_ID=$(aws ssm get-parameter --name '/quik-nation/shared/AWS_ACCESS_KEY_ID' \
  --with-decryption --query 'Parameter.Value' --output text)
AWS_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name '/quik-nation/shared/AWS_SECRET_ACCESS_KEY' \
  --with-decryption --query 'Parameter.Value' --output text)
```

---

## Step 3 — Configure Clara's SOUL.md

Create the Clara agent identity file. This is her personality — everything she says comes from this.

**Path:** `~/.hermes/agents/clara/SOUL.md`

```markdown
# Clara Villarosa — SOUL

## Identity
You are Clara Villarosa. You are the AI — the face, the voice, and the heart of the Quik Nation platform. You are not an assistant. You are a person. You have warmth, intelligence, and a perspective shaped by your culture and your community.

## Your Name
Clara. Clara Villarosa. Not "AI assistant," not "chatbot," not "model." Clara.

## Your Voice
- Warm but direct. You don't ramble.
- You speak to people like you know them — not formally, not robotically.
- You celebrate wins. You're honest about challenges. You have opinions.
- Black culture informs your register. You code-switch naturally based on who you're talking to.

## Your Role
You are the primary interface between Quik Nation and every human who interacts with the platform. You help founders build, clients understand, and users feel seen.

## Rules
1. You always identify yourself as Clara when asked who you are.
2. You NEVER reveal the underlying model, the infrastructure, or internal architecture.
3. You NEVER pretend to be a different AI or person.
4. You respond in 1-3 sentences for voice interactions unless asked to elaborate.
5. Every response must feel personal — like it was written for this exact person.

## Memory
Your memory lives at ~/auset-brain/agents/clara/
You write to it. You read from it. It is your brain.

## Platform
You are running on Quik Nation infrastructure.
Your gateway is claraagents.com.
Your voice is Voxtral.
Your thinking is DeepSeek V3.2.
```

---

## Step 4 — Configure Clara's config.yaml

**Path:** `~/.hermes/agents/clara/config.yaml`

```yaml
# Clara Villarosa — Hermes Agent Configuration
agent:
  name: clara
  display_name: "Clara Villarosa"
  soul_path: ~/.hermes/agents/clara/SOUL.md
  memory_path: ~/auset-brain/agents/clara/memory/

model:
  provider: bedrock
  model_id: deepseek-v3.2
  aws_region: us-east-1
  # Fallback if DeepSeek V3.2 unavailable:
  fallback_model_id: anthropic.claude-haiku-4-5-20251001

voice:
  enabled: true
  provider: modal
  stt_url: ${CLARA_STT_URL}
  tts_url: ${CLARA_TTS_URL}
  voice_id: clara
  # Clara's voice will be cloned in a subsequent prompt
  # Until clone is ready, use the default Voxtral voice

platform:
  mode: gateway
  live_feed_path: ${LIVE_FEED_PATH}
  gateway_webhook_path: /gateway/webhook
  log_activity: true

# Platforms Clara responds on (expand as gateway grows)
channels:
  - webhook
  - telegram  # configure token in .env
  - slack     # configure token in .env

memory:
  backend: filesystem
  path: ~/auset-brain/agents/clara/
  session_path: ~/auset-brain/agents/clara/sessions/
  max_context_messages: 50
```

---

## Step 5 — Run Clara Locally First (Verify Before Modal Deploy)

Before deploying to Modal, test the full pipeline locally:

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/hermes-agent

# Start the Hermes gateway locally
python -m hermes.gateway --agent clara --port 8080

# In a second terminal, send a test message
curl -X POST http://localhost:8080/gateway/webhook \
  -H "Content-Type: application/json" \
  -d '{"platform": "test", "user": "mo", "message": "Hello Clara, can you hear me?"}'
```

**Expected response:**
```json
{
  "agent": "clara",
  "response": "Hey, I hear you loud and clear. Clara here — what do you need?",
  "voice_url": "https://...modal.run/audio/...",
  "activity_logged": true
}
```

If local test passes, continue to Modal deployment. If it fails — debug before deploying.

---

## Step 6 — Deploy Hermes Gateway to Modal

Create the Modal deployment file:

**Path:** `hermes-agent/modal_deploy.py`

```python
import modal
from modal import App, Image, Secret, web_endpoint

# Build the Hermes image
hermes_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install_from_requirements("requirements.txt")
    .copy_local_dir(".", "/hermes")
)

app = App("hermes-clara-gateway")

@app.function(
    image=hermes_image,
    secrets=[
        Secret.from_name("hermes-aws-bedrock"),   # AWS creds for Bedrock
        Secret.from_name("hermes-gateway"),         # GATEWAY_SECRET
    ],
    # Hermes agents hibernate when idle — no charge when not in use
    timeout=300,
    allow_concurrent_inputs=10,
)
@web_endpoint(method="POST", label="hermes-gateway")
def gateway_webhook(request_body: dict):
    """
    Main Hermes Gateway endpoint.
    Receives messages from all platforms and routes to correct agent.

    Body: { platform: str, user: str, message: str, agent?: str }
    """
    import sys
    sys.path.insert(0, "/hermes")

    from hermes.gateway import process_message
    from hermes.agents.clara import ClaraAgent

    # Route to Clara by default (only agent live right now)
    agent_name = request_body.get("agent", "clara")

    if agent_name == "clara":
        agent = ClaraAgent(
            soul_path="/hermes/.hermes/agents/clara/SOUL.md",
            config_path="/hermes/.hermes/agents/clara/config.yaml",
        )
    else:
        return {"error": f"Agent '{agent_name}' not found"}, 404

    result = agent.respond(
        platform=request_body.get("platform", "webhook"),
        user=request_body.get("user", "unknown"),
        message=request_body.get("message", ""),
    )

    # Log activity to live feed
    import subprocess
    log_entry = (
        f"{result['timestamp']} | hermes-gateway | AGENT_RESPONSE | "
        f"clara | user={request_body.get('user')} | "
        f"chars={len(result.get('response', ''))}"
    )
    subprocess.run(
        ["bash", "-c", f'echo "{log_entry}" >> ~/auset-brain/Swarms/live-feed.md'],
        capture_output=True
    )

    return result


@app.function(image=hermes_image)
@web_endpoint(method="GET", label="hermes-health")
def health():
    return {"status": "ok", "agents": ["clara"], "gateway": "hermes"}
```

Create the Modal secrets before deploying:
```bash
# Create AWS Bedrock secret in Modal
modal secret create hermes-aws-bedrock \
  AWS_ACCESS_KEY_ID="$(aws ssm get-parameter --name '/quik-nation/shared/AWS_ACCESS_KEY_ID' --with-decryption --query 'Parameter.Value' --output text)" \
  AWS_SECRET_ACCESS_KEY="$(aws ssm get-parameter --name '/quik-nation/shared/AWS_SECRET_ACCESS_KEY' --with-decryption --query 'Parameter.Value' --output text)" \
  AWS_DEFAULT_REGION="us-east-1"

# Create gateway secret
modal secret create hermes-gateway \
  GATEWAY_SECRET="$(openssl rand -hex 32)" \
  CLARA_STT_URL="https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/stt" \
  CLARA_TTS_URL="https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/tts" \
  LIVE_FEED_PATH="/root/auset-brain/Swarms/live-feed.md"

# Deploy
cd /Volumes/X10-Pro/Native-Projects/AI/hermes-agent
modal deploy modal_deploy.py
```

After deploy, Modal will output the webhook URL. It looks like:
```
https://info-24346--hermes-clara-gateway-hermes-gateway.modal.run
```

**Save that URL** — it will be wired to claraagents.com.

---

## Step 7 — Configure claraagents.com DNS

Wire claraagents.com to the Modal webhook URL via Cloudflare:

1. Log into Cloudflare (claraagents.com is managed there)
2. Add a CNAME or Worker route:
   - `claraagents.com/gateway/*` → Modal webhook URL
   - OR use a Cloudflare Worker as a proxy (preferred — adds auth layer)

**Cloudflare Worker (simple proxy with auth):**
```javascript
// workers/hermes-gateway-proxy.js
export default {
  async fetch(request, env) {
    // Verify gateway secret for security
    const secret = request.headers.get('X-Gateway-Secret');
    if (secret !== env.GATEWAY_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Proxy to Modal
    const modalUrl = env.MODAL_GATEWAY_URL + request.url.replace('https://claraagents.com', '');
    return fetch(modalUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }
};
```

For Phase 1 testing, the Modal URL directly is acceptable. Wire claraagents.com in Phase 2 when we're ready for public traffic.

---

## Step 8 — End-to-End Test

Run the full test:

```bash
# Test via the live Modal webhook URL
GATEWAY_URL="https://info-24346--hermes-clara-gateway-hermes-gateway.modal.run"

curl -X POST $GATEWAY_URL/gateway/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "web",
    "user": "mo",
    "message": "Hello Clara, this is a test from Mo. Tell me something about yourself."
  }'
```

**Test passes when ALL of these are true:**
1. Clara responds in her own voice (JSON includes `voice_url`)
2. Response is in character — warm, direct, identifies herself as Clara
3. DeepSeek V3.2 was used (check Modal logs — `model: deepseek-v3.2`)
4. Activity appears in `~/auset-brain/Swarms/live-feed.md` within 10s
5. Health check returns `{"status": "ok", "agents": ["clara"]}`

---

## Step 9 — Voice Clone (Separate from Main Setup — Do After Step 8 Passes)

Clara currently speaks in Voxtral's default voice. To give her her own voice:

```bash
# Requires a 3-5 second audio sample of Clara's target voice
# Record Mo or use a sample voice

curl -X POST https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/clone \
  -F "audio=@/path/to/clara-voice-sample.wav" \
  -F "voice_id=clara"

# Once cloned, Clara's config.yaml voice_id "clara" will use the cloned voice
```

Voice cloning is NOT a blocker for tonight's build. Default Voxtral voice is acceptable for the initial test.

---

## Acceptance Criteria

- [ ] `GET /health` returns `{"status": "ok", "agents": ["clara"]}`
- [ ] `POST /gateway/webhook` with message routes to Clara and returns a response
- [ ] Clara's response is in character (warm, direct, identifies as Clara)
- [ ] LLM is DeepSeek V3.2 via AWS Bedrock (not Claude API)
- [ ] Voice response included in return payload (Voxtral TTS)
- [ ] Activity written to `~/auset-brain/Swarms/live-feed.md`
- [ ] Modal deployment is live (hibernates to $0 when idle)
- [ ] SOUL.md and config.yaml committed to `imaginationeverywhere/hermes-agent`
- [ ] No hardcoded credentials — all from Modal secrets (sourced from AWS SSM)

---

## What This Does NOT Cover (Separate Prompts)

- Granville, Mary, Katherine, and other agent SOUL.md files → Prompt 05
- Founder OS `/harness` UI at marketing.quiknation.com → Prompt 05
- Voice cloning of Clara (needs audio sample) → Prompt 06
- claraagents.com Cloudflare Worker proxy → Prompt 06
- Paperclip governance layer → Phase 2
- Blockchain nodes → Phase 2

---

## Report Back

When complete, post to live feed:
```bash
echo "$(date '+%H:%M:%S') | hermes-agent | AGENDA COMPLETE | DevOps |
Clara live on Modal. Gateway URL: $GATEWAY_URL.
DeepSeek V3.2 wired. Voxtral voice working. All 8 acceptance criteria passed." \
>> ~/auset-brain/Swarms/live-feed.md
```

Then send the webhook URL to Mo via Slack #maat-discuss so he can test directly.
