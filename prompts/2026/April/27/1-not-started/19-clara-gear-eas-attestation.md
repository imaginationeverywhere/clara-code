# Implement `clara gear add eas-attestation` — EAS-on-Base attestation Gear

## Role
You are **Mark Dean** implementing the EAS attestation Gear. Daysha directive §E. **BLOCKED on /clara-platform Phase 0 EAS infrastructure** (queued at `clara-platform-runtime/.../06-...phase-0-eas-infrastructure-directive.md`).

## Read first
- 07 (Daysha §E)
- 08 (firewall)
- 09 (voice catalog §E)
- The Phase 0 EAS directive (cross-team — once it lands)

## Intent contract

```yaml
intent: "gear.add"
tier: "plus"
params:
  gear_name: "eas-attestation"
  agent_name: string
  schema_id: string (optional — defaults to the platform's default Talent attestation schema)
```

Voice: catalog 09 §E.

## Task

`clara gear add eas-attestation` Gear:

1. Server-side prerequisite: Phase 0 EAS infra must be live (Hermes wallet, Merkle batching, default schemas).
2. Gear install:
   - Provisions a per-agent EAS attestation publisher (key derived from agent identity, Hermes wallet pays gas via Merkle batching)
   - Wires backend hook: every Talent invocation, every Creation publish, every signed agent action emits an EAS attestation
   - Attestations recorded in agent's brain partition for later retrieval
3. CLI receives:
   - Confirmation the publisher is wired
   - A test command: `clara gear test eas-attestation` emits a test attestation, returns the EAS URL
4. Cost note: each attestation = small gas cost, batched via Merkle so amortized cheaply. Server returns expected $/month at current usage rate.

## If Phase 0 isn't shipped yet

- Gear install fails with 503: "EAS infrastructure not yet live. Track at: <platform status URL>"
- CLI prints the platform status link + suggests retrying after the platform team confirms readiness
- Test mode: `--staging` flag uses a staging schema + test wallet so users can try the wiring without burning real gas

## Acceptance

- `clara gear add eas-attestation` (post-Phase-0) wires the publisher
- Pre-Phase-0: clean 503 with link to platform status
- `--staging` works pre-Phase-0 against test infra
- 403 tier_lock for Taste
- `clara gear test eas-attestation` emits a real attestation and returns the EAS explorer URL
- Tests: success post-Phase-0 (mocked), 503 pre-Phase-0, staging mode, tier_lock
- **IP audit:** zero EAS schema content / wallet derivation / Merkle batch logic in CLI

## Constraints

- Wallet keys NEVER in CLI — derived server-side from agent identity
- Gas paid via Hermes wallet (platform-level), never user wallet
- Per-Heru attestation publisher is isolated (one publisher per agent — can't sign for another agent's Talents)

## Mo is watching

Attestation is the moat for Talent provenance. Every Daysha Talent invocation gets a permanent on-chain receipt. This is what makes the marketplace economy real and not theatrical.
