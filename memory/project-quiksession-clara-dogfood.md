---
name: QuikSession — Clara Code Dogfood + Music IP Platform
description: QuikSession is the first Heru that dogfoods Clara Code + Clara Radio + Blockchain IP tracking for music studios
type: project
---

# QuikSession — Clara Code Dogfood App

**Decision date:** 2026-04-10
**Source:** Mo + Quik's direct input on music studio problem

## The Problem Quik Described

Music studios get robbed. An artist records a track, puts it on a flash drive, takes it to a label, it becomes a #1 hit — and the studio gets nothing. Producers, engineers, writers all chase money after the fact. There's no real-time record of who contributed what, when.

**A standard session has 4 creatives:**
1. **Engineer** — on the computer, mixing, levels, production decisions
2. **Producer** — on the board, directing the session
3. **Writer** — speaks their lyrics and publishing declarations verbally
4. **Artist** — records vocals through the mic

All of this happens on ONE studio computer. None of it is attributed in real-time. None of it hits the blockchain. When the track blows up, everyone scrambles.

**Writers "speak their publishing"** — this was Mo's revelation. Writers verbally declare their publishing contributions during the session. That verbal declaration is legally meaningful but currently untracked.

## The Solution: QuikSession Powered by Clara Code

**Layer 1 — Session Tracking**
- Each creative's voice is cloned at session start (1 free clone per session, $1 each after)
- Clara voice ID tracks who is speaking at all times
- Every vocal take, verbal publishing declaration, production direction is timestamped and attributed

**Layer 2 — Blockchain IP Ledger**
- Immutable on-chain record of who contributed what, when
- Writers' verbal publishing declarations are captured by STT and logged on-chain
- Even if someone walks out with the file on a flash drive, the blockchain record says who made it and what they're owed
- Smart contract defines royalty splits at session time

**Layer 3 — Clara Radio Integration**
- Finished tracks flow directly into Clara Radio
- Artists can publish to their Clara Radio channel
- Producers get attribution visible to streaming platforms

**Layer 4 — Auto-Distribution**
- When royalties come in → smart contract auto-distributes based on session ledger
- No chasing. No lawyers. The ledger IS the contract.

## Why QuikSession is the Dogfood App

- **Built WITH Clara Code** (vibe coders on our platform build it)
- **Built ON Clara Code** (studio computer runs Clara Code for the session)
- **Proves the voice-first UX** — 4 creatives, no keyboards, everything via voice
- **Proves Clara Radio** — sessions produce content that feeds the radio
- **Proves blockchain IP** — the use case is perfect: clear IP, clear attribution, automatic payment

## Competitive Landscape

No one does this. DAWs (Pro Tools, Logic, Ableton) track audio, not attribution. ASCAP/BMI track published works, not session contributions. This is a gap worth hundreds of millions.

**Target customers:**
- Independent recording studios (underserved, getting robbed)
- Independent producers and engineers (can't afford lawyers)
- Indie artists (no label to chase money for them)
- Music schools and universities (teaching students about publishing)

## Product Architecture (Mo's Decision — Apr 10)

### Two-Tier Product

**Tier 1: QuikSession (pre-packaged)**
- Everything a label/producer/artist needs out of the box
- DAW plugins (Pro Tools AAX, VST3, AU, Ableton Max for Live)
- Blockchain IP ledger (real-time, per-session)
- Clara Radio publishing built in
- Smart contract royalty splits
- Voice cloning for all 4 session roles
- NO SDK required — it just works

**Tier 2: QuikSession SDK (bundled with Clara Code)**
- For those who want custom music apps
- npm package: `@imaginationeverywhere/quiksession`
- Vibe coders build their own music apps on top
- Labels build their own tooling
- Clara Code + QuikSession SDK = anyone can build a music app
- SDK comes FREE with every Clara Code subscription

### Standard-Setting Strategy
- QuikSession sets the standard for music app development
- We don't require adoption — the pre-packaged product is so complete they'll want it
- SDK lets rebels build their own way — still on our infrastructure, still our API key
- Eventually: QuikSession format becomes the industry standard for session attribution records

## Clara Radio — Legal Positioning (Mo's Decision Apr 10)

**Clara Radio is NOT a streaming service.** This is the critical distinction that keeps labels from coming after us.

- **Streaming services** (Spotify, Apple Music): license existing music, distribute on-demand → expensive ASCAP/BMI/mechanical rights required
- **Clara Radio**: artists and labels UPLOAD THEIR OWN music to PROMOTE themselves → they grant us rights by uploading. We broadcast. No licensing problem.

**The model:** iHeartRadio / SoundCloud / YouTube — not Spotify.
- Artists upload to get exposure (they want to be there)
- Podcasters syndicate shows (Breakfast Club, others)
- We run ads against all of it
- Free app on Apple App Store + Google Play Store
- Revenue: advertising (audio CPM $20-40)
- Labels don't come after us because we are not competing with streaming — we are a promotional platform

**Revenue model:**
- 100K listeners × audio ads → ~$75K/month
- 1M listeners → ~$750K/month
- Ad revenue share with major podcast partners (Breakfast Club, etc.) — ~70/30 their way
- Artists: free to upload (they want the distribution)

## Quik's Direct Requirement (Apr 10) — Studio Owner View

**Quik wants two things:**
1. **Daemon** — silent background process installed on every studio computer. Runs always. Tracks everything.
2. **Desktop app** — Quik's monitoring dashboard. He sees all studio machines in one view.

### What the daemon tracks:
- File system changes (new audio files, project saves, exports)
- Active applications (Pro Tools, Logic, Ableton running + duration)
- Microphone activity (is someone recording right now?)
- **USB/external drive connections** — the flash drive theft detection. If a creative connects a drive and copies files, Quik gets an alert immediately.
- Who is logged into the machine and when
- Session metadata (project name, duration, what was created)

### What the desktop app shows Quik:
- All studio computers in one dashboard (multi-machine view)
- Real-time activity per machine
- Session history — who worked on what, when
- File inventory — what was created, what was exported
- **Flash drive alerts** — files copied to external storage, timestamped with who did it
- Exportable evidence logs for contracts and disputes

### Architecture:
- Daemon: Electron background service or native LaunchAgent (macOS primarily — studios run Macs)
- Desktop app: Electron (Quik's machine only — the owner view)
- Communication: daemon → QuikSession API → desktop via WebSocket
- Storage: daemon logs to local SQLite + syncs to Neon PostgreSQL backend
- Blockchain: session fingerprints on-chain for immutable evidence

### Privacy disclosure:
- Creatives are informed at session start that the studio computer is monitored
- The session log is visible to BOTH studio owner AND creative (fairness, mutual protection)
- Quik owns the machines — legal to monitor with disclosure

## How to Apply

- QuikSession is Heru #N in the platform — first to use blockchain + voice + Clara Code together
- Build it to prove the platform. Sell it as a standalone product. License it to studios.
- Every artist/producer who uses QuikSession becomes a Clara Radio potential customer
- The flywheel: Session → Attribution → Clara Radio → Fan subscriptions → Royalty auto-pay
