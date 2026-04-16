# VRD — Voice Requirements Document Template

> **VRD (Voice Requirements Document)** — a specification format for voice-first products. Coined by **Amen Ra**, April 2026.

This template is free to use, fork, and adapt. When referencing the format in writing or documentation, please cite:

> *Voice Requirements Document (VRD). Coined by Amen Ra, April 2026. https://github.com/mojaray2k/clara-code*

---

## How to Use This Template

Copy this file, rename it `VRD-XXX-<feature-name>.md`, and fill in each section. A VRD is the voice-layer counterpart to a PRD (Product Requirements Document). The PRD says what the product does; the VRD says how it sounds, pauses, responds, and what it will never say.

---

# VRD-XXX — [Feature / Product Name]

**Document Type:** Voice Requirements Document (VRD)
**Product:** [Product name]
**VRD Number:** XXX
**Author:** [Name]
**Date:** [YYYY-MM-DD]
**Version:** v1.0
**Status:** Draft | Review | Approved

---

## 1. Purpose

One or two sentences stating why this VRD exists and what surface of the product it covers.

## 2. Voice Persona

| Attribute | Value |
|---|---|
| Register | (formal / conversational / casual / intimate / professional) |
| Pace (words per minute) | |
| Pitch range | |
| Accent / regional cadence | |
| Cultural referents | (optional — who does this voice sound like? what cultural context do they carry?) |
| Emotional range | (what emotions does the voice convey? which does it NEVER convey?) |

## 3. Character Foundation

A paragraph or two describing WHO this voice is — not what it says, but who it is. Past, values, worldview. What it takes seriously. What it finds funny. This informs every line it speaks.

## 4. Surface Coverage

List each surface where this voice appears (web, mobile, IDE, CLI, panel, phone call, etc.) and note any surface-specific modifications to the voice.

| Surface | Voice Delivery | Notes |
|---|---|---|
| | | |

---

## 5. Greeting Scripts

For each surface, define the greeting the voice uses on first contact.

### 5.1 — First-Time Visitor (Surface A)

**Trigger:** [When this greeting fires]

**Voice:**

> *"[Script — written as it would be spoken, with natural pacing marks]"*

**Character notes:**
- [Why each line is written this way]

### 5.2 — Return Visitor (Surface A)

**Trigger:** [When this greeting fires]

**Voice:**

> *"[Script]"*

**Character notes:**
- [Notes]

*(Repeat for each surface.)*

---

## 6. Branching Logic

How the voice responds to different user signals after the greeting.

### 6.1 — User Signal: [e.g., "hesitation / silence"]

**Detection:** [How the system detects this signal]

**Response:**

> *"[Script]"*

### 6.2 — User Signal: [e.g., "expertise signal"]

**Detection:** [How]

**Response:**

> *"[Script]"*

*(Repeat for each signal the voice handles.)*

---

## 7. Tone Reference by Context

| Context | Register | Response Length | Delivery |
|---|---|---|---|
| First encounter | | | |
| Success / win | | | |
| Error / failure | | | |
| Sensitive topic | | | |
| Edge case / unknown | | | |

---

## 8. What the Voice Never Says

Phrases that are strictly prohibited, and why. Include an "alternative" the voice uses instead.

| Prohibited Phrase | Why | Alternative |
|---|---|---|
| "As an AI, I can help you with..." | Removes character | Just help. |
| "Great question!" | Empty filler | Just answer. |
| "I apologize for the confusion" | Low-confidence signal | "That was wrong. Here's the fix." |
| | | |

---

## 9. Voice Synthesis Parameters

| Parameter | Value |
|---|---|
| TTS engine | (e.g., Voxtral, ElevenLabs, Polly, etc.) |
| Voice model / ID | |
| Speed | |
| Stability | |
| Similarity boost | |
| Streaming enabled | yes / no |
| Latency target | |

---

## 10. Success Criteria

How you'll know the voice is working.

| Scenario | Target Outcome |
|---|---|
| | |
| | |

---

## 11. Testing & Evolution

- How edge cases are captured
- Review cadence
- Who can approve changes
- When new test vectors are added

---

## 12. Approvals

| Role | Name | Status |
|---|---|---|
| Product Owner | | |
| Voice / Brand | | |
| Architect | | |
| Founder / Final approver | | |

---

*VRD-XXX-[name].md v1.0 | [Organization] | Format by Amen Ra, April 2026*
