# Implement `clara gear add voice-clone` — optional voice cloning Gear

## Role
You are **Nina Simone** implementing the voice-clone Gear. Daysha directive §E. Modal infra is locked (memory: `project_actual_voice_stack.md`).

## Read first
- 07 (Daysha §E)
- 08 (firewall)
- 09 (voice catalog §E)
- `project_actual_voice_stack.md` (Whisper + XTTS on Modal, sealed)

## Intent contract

```yaml
intent: "gear.add"
tier: "plus"
params:
  gear_name: "voice-clone"
  agent_name: string
  consent_confirmed: boolean (REQUIRED — must be true)
```

Voice: catalog 09 §E.

## Task

`clara gear add voice-clone` Gear:

1. **Consent gate (CRITICAL):** Before any voice work, CLI prompts:
   > "Voice cloning creates a synthetic voice from a sample you record. The clone is encrypted at rest, used only for this agent, and deleted on `clara gear remove voice-clone`. Are you the rightful owner of the voice you're about to record? (yes/no)"

   Must explicitly type `yes`. Refuses to proceed otherwise. Record consent timestamp + agent ID server-side.

2. **Voice sample capture:**
   - 5-second recording prompt
   - Reuses existing `audio-capture.ts` infrastructure
   - Streams to gateway as base64 over the intent dispatch
   - Server runs through XTTS clone pipeline on Modal
   - Returns `{ ok, voice_id, sample_url }` (sample for the user to verify the clone sounds right)

3. **Wire-up:**
   - Server registers the cloned voice with the agent's voice service
   - Subsequent TTS requests can use `voice_id: "<the-clone>"` to speak in that voice
   - Brain partition tracks: who consented, when, with what sample (audio NOT in brain — only metadata)

4. **Removal:**
   - `clara gear remove voice-clone` revokes the clone, deletes the sample server-side, blocks future TTS calls using that voice_id

## Acceptance

- Consent flow refuses to proceed without explicit `yes`
- 5-sec capture works on macOS / Linux / Windows (existing `audio-capture.ts` handles platform)
- 403 tier_lock for Taste
- Cloned voice plays back via `clara hello --voice-id=<the-clone>` (test path)
- `--from-file <wav>` accepts a pre-recorded sample (still requires consent confirmation)
- `clara gear remove voice-clone` revokes server-side; subsequent TTS calls with that voice_id 410 Gone
- Tests: consent gate, capture, removal, tier_lock, non-consenting path
- **IP audit:** zero XTTS / Modal endpoint / clone pipeline internals in CLI

## Constraints

- Consent confirmation is server-side AND client-side (defense in depth)
- Sample audio encrypted at rest server-side, deleted on removal
- No voice cloning of public figures via uploaded sample without explicit consent UI gate (server should refuse if the sample matches a known-public-figure voiceprint — out of scope for v1, but mark TODO)
- Only one voice-clone per agent in v1 (extensible later)

## Mo is watching

Voice cloning is the most legally sensitive Gear. Build the consent gate as carefully as you'd build a payment flow. One sloppy capture and we have a real lawsuit.
