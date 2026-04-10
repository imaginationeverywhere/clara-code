---
type: decision
date: 2026-04-06
topic: Voice Conference Architecture — Mo-Moderated, Meeting Bridge, Roll Call
tags: [voice, conference, vtalk, blackhole, slack, zoom, standup, mute]
---

# Voice Conference Architecture — Final Design

## What Was Decided

### Conference Protocol: Mo Moderates
- ALL agents hear every prompt in conference mode
- ONLY the agent Mo calls by name responds vocally
- If Mo addresses the whole team without naming anyone, only the Product Owner speaks
- No automatic rotation. No auto-speaking. Mo is the moderator.
- Prevents agents from overtalking each other

### Family Standup Flow
1. `vtalk --team hq` sends a context-loading prompt to ALL agents simultaneously
2. Agents silently read: team-registry.md, live-feed.md, git log, session-checkpoint.md, daily notes
3. Roll call displayed — Mo sees who is ready
4. Mo opens: "Good morning family. Mary, start us off."
5. Mo calls on each agent by name. Only the called agent speaks.
6. Agents speak in character as their historical namesake. Sunday dinner energy, not corporate standup.
7. `--no-standup` flag skips context loading for quick sessions

### Attendance / Roll Call
- Visual roll call in Mo's vtalk terminal after standup and after each agent speaks
- Shows checkmark (spoke) or empty box (hasn't spoken) for every agent
- Type `r` anytime to see the roll call

### Mic Mute
- Press Enter to toggle mute/unmute during voice session
- Muted = vtalk stops recording, agents can't hear Mo
- Unmute = press Enter again
- Use when phone call comes in or need privacy

### Kill Switch
- `vtalk stop` sets `/tmp/clara-voice-killswitch`
- speak.py checks killswitch FIRST — refuses to play audio if set
- Also kills all afplay, sox, say, speak.py processes
- Killswitch auto-cleared when vtalk starts a new session

### speak.py Hard Cap
- `--turn <turn-id>` parameter tracks conference responses
- After MAX_SPEAKERS (3) responses per turn, speak.py skips audio (text only)
- Safety net in case agents ignore "listen only" instructions

### Slack Huddle / Zoom Meeting Integration
- **BlackHole** (free, `brew install blackhole-2ch`) virtual audio driver
- Create Multi-Output Device in Audio MIDI Setup (speakers + BlackHole)
- Slack/Zoom mic input = BlackHole 2ch
- Agent TTS → speakers → BlackHole → Slack/Zoom
- Mo's mic stays as normal mic
- Three modes: relay (Mo repeats client), audio capture (script), Hermes bot (planned)
- Toggle with: `SwitchAudioSource -s "Multi-Output Device"` / `SwitchAudioSource -s "MacBook Pro Speakers"`

## Files Changed
- `infrastructure/voice/voice-to-swarm.sh` — Mo-moderated conference, standup, roll call, mute, killswitch
- `infrastructure/voice/server/speak.py` — killswitch check, conference hard cap, --turn parameter
- `operations/voice-agent-architecture.md` — Complete command reference for all 13 teams, 85+ agents, meeting integration
- `operations/TMUX.md` — tmux cheat sheet with all custom bindings

## Cost
- BlackHole: free, open source
- SwitchAudioSource: free, Homebrew
- No new API costs — uses existing Deepgram STT + MiniMax TTS (migrating to Voxtral)
