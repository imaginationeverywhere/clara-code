---
type: decision
date: 2026-04-05
topic: Mistral Voxtral — New Voice Engine (Replacing MiniMax + Deepgram)
status: approved
priority: critical
tags: [voice, mistral, voxtral, tts, stt, agent-harness]
---

# Decision: Mistral Voxtral Replaces MiniMax + Deepgram

## What Changed

**OUT:** MiniMax (TTS/cloning) + Deepgram (STT) — two providers, two bills, two integrations.
**IN:** Mistral Voxtral — ONE provider for both STT and TTS, with built-in voice cloning.

## Why

1. Single provider for the entire voice pipeline (STT + TTS)
2. Zero-shot voice cloning from 2-3 seconds of audio — built into the API
3. Saved voice profiles (`voice_id`) — upload once, use everywhere
4. Streaming with ~90ms time-to-first-audio (PCM format)
5. Self-hostable open weights (Apache 2.0 for STT, CC BY NC 4.0 for TTS)
6. 13 languages supported

## Mistral Voice Stack

### STT: Voxtral Mini Transcribe Realtime (`voxtral-mini-transcribe-realtime-2602`)
- **Price:** $0.006/min
- **Latency:** Sub-200ms (configurable)
- **Features:** Streaming, multilingual, speaker diarization (offline model), open weights (4B params)
- **Replaces:** Deepgram Nova-2

### TTS: Voxtral TTS (`voxtral-mini-tts-2603`)
- **Price:** $16/M chars (API) or $0 (self-hosted)
- **Latency:** ~90ms time-to-first-audio (streaming, PCM)
- **Features:** Zero-shot voice cloning, saved voice profiles, streaming, 9 languages
- **Formats:** MP3, WAV, PCM (lowest latency), FLAC, Opus
- **Replaces:** MiniMax TTS

### Voice Cloning
- Upload 3-25 seconds of clean audio per agent
- Creates a `voice_id` stored on Mistral's servers
- All agents get persistent cloned voices — no `ref_audio` needed per call
- Existing MiniMax voice samples can be re-used as Mistral voice prompts

## Agent Voice ID Migration

| Agent | MiniMax Voice ID | Mistral Voice ID | Status |
|-------|-----------------|------------------|--------|
| Granville | granville03voice | TBD (create via API) | Pending |
| Mary | mary03voice | TBD | Pending |
| Katherine | katherine03voice | TBD | Pending |
| Nikki | nikki03voice | TBD | Pending |
| Abbott | abbott03voice | TBD | Pending |
| Maya | maya03voice | TBD | Pending |

## Cost Comparison

| Item | Old (MiniMax + Deepgram) | New (Mistral Voxtral) |
|------|-------------------------|----------------------|
| STT | ~$30/mo (Deepgram) | ~$20/mo (Voxtral Realtime) |
| TTS | ~$30/mo (MiniMax) | ~$25/mo (Voxtral TTS) or $0 (self-hosted) |
| Voice cloning | Included in MiniMax plan | Included in Voxtral TTS |
| **Total** | **~$60/mo** | **~$45/mo** (API) or **~$20/mo** (self-hosted TTS) |

## API Integration

### Create a voice (one-time per agent)
```bash
SAMPLE_AUDIO=$(base64 -i voice-samples/granville.mp3)
curl -X POST "https://api.mistral.ai/v1/audio/voices" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"granville\",
    \"sample_audio\": \"$SAMPLE_AUDIO\",
    \"sample_filename\": \"granville.mp3\",
    \"languages\": [\"en\"],
    \"gender\": \"male\",
    \"tags\": [\"architect\", \"deep\", \"authoritative\"]
  }"
```

### Speak (streaming, lowest latency)
```bash
curl -X POST "https://api.mistral.ai/v1/audio/speech" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "voxtral-mini-tts-2603",
    "input": "The auth schema needs to change before we deploy.",
    "voice_id": "<granville-voice-id>",
    "response_format": "pcm",
    "stream": true
  }'
```

### Transcribe (realtime)
```bash
# Via Mistral API — replaces Deepgram in voice-to-swarm.sh
curl -X POST "https://api.mistral.ai/v1/audio/transcriptions" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary "@/tmp/voice-swarm-chunk.wav"
```

## Files To Update

| File | Change |
|------|--------|
| `infrastructure/voice/voice-to-swarm.sh` | Replace Deepgram STT with Voxtral Realtime |
| `infrastructure/voice/server/speak.py` | Replace MiniMax TTS with Voxtral TTS |
| `infrastructure/voice/server/agent_personas.py` | Replace `minimax_voice` with `mistral_voice_id` |
| `infrastructure/voice/server/bot.py` | Replace Deepgram STT + MiniMax TTS in Pipecat pipeline |
| `pricing/voice-tiers.md` | Update internal provider references |
| `pricing/internal-and-founders.md` | Update cost line items |

## Customer-Facing Pricing (Unchanged)

Customers still see "Standard Voice" and "Premium Voice" — never provider names. Internally:
- **Standard Voice:** AWS Polly (cheapest, functional)
- **Premium Voice:** Voxtral TTS (replaces ElevenLabs for premium quality with cloning)
- **Internal agents:** Voxtral TTS with cloned voices

## The Harness Context

This voice engine powers the independent agent harness. Users TALK to agents, not type. The pipeline:
```
User speaks → Voxtral Realtime STT → Bedrock Haiku (agent brain) → Voxtral TTS (cloned voice) → User hears agent
```

Full architecture: `.claude/plans/2026-04-05-independent-agent-harness-architecture.md`
