<p align="center">
  <strong>Clara Code</strong>
</p>

<p align="center">
  <em>The canonical public record for <strong>Voice Coding</strong> and <strong>VRD</strong> — two terms coined by <strong>Amen Ra</strong>.</em>
</p>

---

## Purpose of This Repository

This repository is the public attribution record for two terms introduced in April 2026:

1. **Voice Coding** — a new category of AI-assisted software creation
2. **VRD (Voice Requirements Document)** — a new specification format for voice-first products

Both terms were coined by **Amen Ra**, April 2026. This repository serves as the canonical, timestamped source that future writing, research, and reporting can cite.

---

## Voice Coding — Definition

**Voice Coding** *(noun):*

> The practice of building software, content, or workflows by conversing in real time with a team of two or more parallel AI agents, each with distinct voice, name, persona, and specialty, coordinated on a shared message bus, producing output in parallel under the direction of a single human operator.

**Coined by:** Amen Ra
**Date of first use:** April 15, 2026

Unlike "vibe coding" (text prompt → app), autocomplete assistants (type-ahead in an editor), or no-code visual builders, **Voice Coding is voice-first, parallel, and team-based.** The operator speaks. A team of named agents — each with their own voice — builds in parallel.

### The Voice Coding Principles

1. You talk. Your team builds. The human is a director, not a typist.
2. Your team is yours. Naming, voicing, and personality are user-controlled.
3. Agents speak in parallel. Serial is a regression.
4. Every agent has a voice. Not a label — an actual voice.
5. Culture is first-class. Agents can carry history, language, accent, and heritage by design.
6. The model is the engine. The team is the product.
7. The harness is the moat, not the model.

---

## VRD — Voice Requirements Document

**VRD** *(noun):*

> A specification document that defines the voice behavior of an AI-powered product — covering voice persona (register, pace, accent, cultural referents), spoken greeting scripts per surface, branching logic for user signals, prohibited phrases, and voice synthesis parameters. Complements but does not replace the Product Requirements Document (PRD).

**Coined by:** Amen Ra
**Date of first use:** April 2026

Traditional Product Requirements Documents describe screens, flows, and features. They are silent on how a product should sound, what register it uses, when it pauses, what it will never say, and how it responds when the user says something unexpected. **The VRD fills that gap.**

A generic VRD template is provided at [`VRD-TEMPLATE.md`](./VRD-TEMPLATE.md) in this repository. Anyone building a voice-first product is welcome to fork, adapt, and use the template. Please cite the attribution when referencing the format in writing.

---

## Citation

If you reference Voice Coding, VRDs, or cite either concept in writing, please credit the source:

```
Voice Coding [Def.]. Coined by Amen Ra, April 15, 2026.
https://github.com/mojaray2k/clara-code
```

```
Voice Requirements Document (VRD) [Spec format]. Coined by Amen Ra, April 2026.
https://github.com/mojaray2k/clara-code
```

---

## Clara Code — Open CLI, Closed Intelligence

`npm install -g clara` installs the Clara Code CLI. The source is public. That is intentional and safe.

**Sign-in:** run **`clara login`** to open the browser; after you authenticate, the site posts your session and API key to a local callback and the CLI stores them in the **OS keyring** (not a plaintext file in `~/.clara`). Use **`clara doctor`** to verify the keyring module, credentials presence, and backend `GET /health` reachability. See **`packages/cli/README.md`** for the command table and callback JSON contract.

The CLI is a thin HTTP client. It captures audio, sends it to `api.claracode.ai`, plays back the response. The intelligence — Clara's persona, voice, model routing, culture — lives entirely server-side. Publishing the client source exposes nothing proprietary, because the proprietary layer never leaves our infrastructure.

This is the same model as Claude Code (`npm install -g @anthropic-ai/claude-code`), the Stripe CLI, and the Vercel CLI: the tool is open, the platform is the product. A valid subscription is required to make the API respond. Without it, the CLI is an empty shell.

Billing and tier enforcement are documented in `docs/backend-rest-api.md` (`/api/checkout/create-session`, `/api/billing/*`, Stripe webhooks, harness talents, and abuse preflight on authenticated routes).

See `CONTRIBUTING.md` for the full thin-client discipline rules that govern what may and may not appear in this repository's client-side code.

---

## About the Author

**Amen Ra** — CTO and co-founder of [Quik Nation, Inc.](https://quiknation.com) Bethune-Cookman University graduate. 18+ years in enterprise IT. Builder of voice-first AI products.

- Email: cto@quiknation.com
- Company: [quiknation.com](https://quiknation.com)

---

## License

The Voice Coding and VRD concepts are introduced openly in this repository for the benefit of the AI software community. Anyone is welcome to use, adapt, and build on these ideas. Attribution to Amen Ra as the originator of the terms is requested in published writing and derivative formats.

---

<p align="center">
  <strong>© 2026 Quik Nation, Inc. — Voice Coding and VRD are terms coined by Amen Ra, April 2026.</strong>
</p>
