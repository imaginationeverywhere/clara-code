# Agent Ejection — Export ZIP + Fingerprint + Attestation

**TARGET REPO:** imaginationeverywhere/clara-code
**Priority:** P1 — Beta-required. Enterprise partners ask about ejection in contract negotiations. Missing = blocker for signing.
**Packages:** `backend/`, `frontend/`
**Depends on:** prompt 11 (PLAN_LIMITS), prompt 20 (templates), prompt 22 (billing)
**Milestone:** VPs can export any built agent they own — identity, voice, data, configuration — as a signed ZIP. Export is metered per tier (1/3/6/12/Custom per month). Every export is cryptographically fingerprinted so we can detect the same agent running on a competing AI platform (anti-double-hosting). Ejection does NOT cancel subscription.

Source of truth: `pricing/ip-ownership-and-ejection.md`.

---

## What Gets Exported (IP Split)

**VP's IP — included in the ZIP:**
- Agent SOUL.md (sanitized of any Clara platform refs)
- Voice samples + voice config
- Conversation history + agent memory (JSON)
- Structured configuration (name, skill-list-by-NAME only, personality tweaks)
- Blockchain ownership certificate
- README + `what-you-have.md` + `what-you-need.md`
- Signed attestation PDF

**Clara's IP — NOT in the ZIP:**
- Hermes runtime, Cognee knowledge engine
- Skill implementation code (only names, not implementations)
- Voice server weights (XTTS/Whisper)
- Model routing logic
- Template source SOUL.mds
- IP firewall patterns

---

## Part 1 — Migration

**File:** `backend/migrations/025_ejections.sql`

```sql
CREATE TABLE IF NOT EXISTS ejections (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               VARCHAR(255)  NOT NULL,
  user_agent_id         UUID          NOT NULL REFERENCES user_agents(id),
  month_key             VARCHAR(10)   NOT NULL,                -- YYYY-MM (counts against monthly cap)
  fingerprint_hash      VARCHAR(128)  NOT NULL UNIQUE,         -- SHA-512 of SOUL.md + owner_id + export_ts
  s3_url                VARCHAR(500)  NOT NULL,                -- pre-signed download URL
  attestation_signed_at TIMESTAMPTZ,
  attestation_s3_url    VARCHAR(500),
  status                VARCHAR(50)   NOT NULL DEFAULT 'pending_attestation',
  exported_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  subscription_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  detected_double_hosting BOOLEAN     NOT NULL DEFAULT FALSE,
  double_hosting_evidence JSONB
);

CREATE INDEX IF NOT EXISTS idx_ejections_user_month
  ON ejections (user_id, month_key);
CREATE INDEX IF NOT EXISTS idx_ejections_fingerprint
  ON ejections (fingerprint_hash);
```

---

## Part 2 — Ejection Caps Per Tier

**File:** `backend/src/services/ejection.service.ts`

```typescript
import crypto from "crypto";
import archiver from "archiver";
import { Readable } from "stream";
import { s3Client, PutObjectCommand, GetObjectCommand } from "@/lib/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Ejection, UserAgent, UserSubscription } from "@/models";
import { PLAN_LIMITS, type PlanTier } from "./plan-limits";
import { sanitize } from "@/lib/ip-firewall";
import logger from "@/lib/logger";

const EJECTION_CAPS: Record<PlanTier, number | null> = {
  basic: 1, pro: 3, max: 6, business: 12,
  enterprise: null, // custom per contract
};

export class EjectionService {
  async requestEjection(userId: string, tier: PlanTier, userAgentId: string): Promise<Ejection> {
    const monthKey = new Date().toISOString().slice(0, 7);  // YYYY-MM
    const cap = EJECTION_CAPS[tier];

    if (tier !== "enterprise" && cap !== null) {
      const used = await Ejection.count({ where: { userId, monthKey } });
      if (used >= cap) {
        throw new Error(`ejection_cap_reached:${cap}`);
      }
    }

    const userAgent = await UserAgent.findOne({ where: { id: userAgentId, userId } });
    if (!userAgent) throw new Error("agent_not_found");

    // Fingerprint: hash of (SOUL.md + userId + timestamp)
    const timestamp = Date.now();
    const fingerprintInput = `${userAgent.soulMd}:${userId}:${timestamp}`;
    const fingerprintHash = crypto.createHash("sha512").update(fingerprintInput).digest("hex");

    // Build ZIP in memory
    const zipStream = await this.buildExportZip(userAgent, fingerprintHash, userId);
    const s3Key = `ejections/${userId}/${userAgent.id}-${timestamp}.zip`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.EJECTION_S3_BUCKET,
      Key: s3Key,
      Body: zipStream,
      ContentType: "application/zip",
      Metadata: { userId, agentId: userAgent.id, fingerprint: fingerprintHash },
    }));

    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: process.env.EJECTION_S3_BUCKET, Key: s3Key }),
      { expiresIn: 60 * 60 * 24 },  // 24 hours
    );

    const ejection = await Ejection.create({
      userId, userAgentId, monthKey,
      fingerprintHash, s3Url: presignedUrl,
      status: "pending_attestation",
    });

    logger.info("ejection_requested", { userId, agentId: userAgent.id, fingerprintHash });
    return ejection;
  }

  private async buildExportZip(
    userAgent: UserAgent,
    fingerprint: string,
    userId: string,
  ): Promise<Readable> {
    const archive = archiver("zip", { zlib: { level: 9 } });

    const sanitizedSoul = sanitize(userAgent.soulMd);

    archive.append(sanitizedSoul, { name: `agents/${userAgent.name}/soul.md` });
    archive.append(
      JSON.stringify({
        name: userAgent.name,
        skillNames: userAgent.attachedSkills,    // names only — NOT implementations
        personalityTweaks: userAgent.personalityTweaks,
        voiceId: userAgent.voiceId,
      }, null, 2),
      { name: `agents/${userAgent.name}/configuration.json` },
    );

    // Conversation history (from memory engine, scoped to this agent)
    // ... fetch and include JSON export ...

    // Voice sample if user cloned one
    // ... fetch voice sample blob from S3 and append ...

    archive.append(this.buildReadme(userAgent.name, fingerprint), { name: "README.md" });
    archive.append(this.buildWhatYouHave(), { name: "what-you-have.md" });
    archive.append(this.buildWhatYouNeed(), { name: "what-you-need.md" });
    archive.append(this.buildAttestationTemplate(userId, fingerprint), { name: "ATTESTATION.pdf.txt" });

    archive.finalize();
    return archive;
  }

  private buildReadme(agentName: string, fingerprint: string): string {
    return `# ${agentName} — Clara Export

This ZIP contains your agent's identity + data. It does NOT contain Clara's platform (Hermes runtime, knowledge engine, skill implementations, voice server).

## Fingerprint
\`${fingerprint}\`

This fingerprint is registered with Clara. Using this exported agent configuration on a competing AI platform (Anthropic Managed Agents, OpenAI GPTs, etc.) while maintaining active Clara subscription of the same agent is a material breach of Clara's Terms of Service.

## Files
- \`soul.md\` — your agent's personality
- \`configuration.json\` — name, skills (by name only), personality tweaks
- \`voice_sample.wav\` — the sample you recorded (if you cloned your voice)
- \`conversations.json\` — conversation history
- \`what-you-have.md\` — full inventory
- \`what-you-need.md\` — what you'd need to run this elsewhere
- \`ATTESTATION.pdf.txt\` — sign and return

## Ejection ≠ Cancellation
Your Clara subscription remains active unless you explicitly cancel. Many customers build on Clara and deploy elsewhere while continuing to use Clara for new builds.
`;
  }

  private buildWhatYouHave(): string {
    return `# What You Have

- Your agent's identity and personality
- Your voice (if cloned)
- Your data (conversations, memory)
- Your skill selections (by name, not by implementation)
- A cryptographic fingerprint proving ownership

`;
  }

  private buildWhatYouNeed(): string {
    return `# What You Need to Run This

To actually operate your agent on your own infrastructure, you'll need:

1. **LLM inference** — your own access to an LLM (OpenAI, Anthropic, self-hosted). Clara's routing logic is not exported.
2. **Voice pipeline** — Whisper or similar for STT; any TTS for voice output. Clara's XTTS weights + server are not exported.
3. **Skill implementations** — every skill name you selected (e.g., "stripe-connect", "calendar-management") needs its code rebuilt. Clara's implementations are not exported.
4. **Orchestration** — the agent harness (tool dispatch, memory management, context injection). LangChain or a custom framework will do.
5. **Memory system** — Cognee-like knowledge graph. Mem0 or similar is the closest open alternative.

Most customers find this is weeks of work — and they often prefer to stay on Clara. Enterprise customers get dedicated migration engineering help.
`;
  }

  private buildAttestationTemplate(userId: string, fingerprint: string): string {
    return `ATTESTATION — Clara Agent Export

I, as the owner of Clara account ${userId}, acknowledge:

1. This exported agent configuration is my IP. I own it.
2. Clara's platform (Hermes, Cognee, skill code, voice server, routing) remains Clara's IP and is NOT exported.
3. I will NOT run this exported agent configuration on a competing AI platform (Anthropic, OpenAI, etc.) while maintaining active Clara hosting of the same agent. Doing so is a material breach of Clara's Terms of Service.
4. Clara may cryptographically fingerprint-match this export against competing platforms' public directories. If matched with active Clara hosting, my subscription will be terminated without refund.
5. Exporting this agent does NOT cancel my Clara subscription.

Fingerprint: ${fingerprint}

Signed: ____________________  Date: __________
Print name: ________________
`;
  }

  async recordAttestation(ejectionId: string, signedPdfS3Key: string): Promise<void> {
    await Ejection.update(
      {
        attestationSignedAt: new Date(),
        attestationS3Url: signedPdfS3Key,
        status: "attested",
      },
      { where: { id: ejectionId } },
    );
  }
}

export const ejectionService = new EjectionService();
```

---

## Part 3 — Routes

**File:** `backend/src/routes/ejections.ts`

```typescript
import { Router } from "express";
import { requireClaraOrClerk } from "@/middleware/api-key-auth";
import { ejectionService } from "@/services/ejection.service";
import { Ejection } from "@/models";

const router = Router();

router.post("/agents/:agentId/eject", requireClaraOrClerk, async (req, res) => {
  try {
    const ejection = await ejectionService.requestEjection(
      req.claraUser!.userId,
      req.claraUser!.tier,
      req.params.agentId,
    );
    res.status(201).json({
      ejection,
      download_url: ejection.s3Url,
      attestation_required: true,
      attestation_upload_url: `/api/ejections/${ejection.id}/attestation`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "error";
    res.status(400).json({ error: message });
  }
});

router.post("/:id/attestation", requireClaraOrClerk, async (req, res) => {
  // Upload signed PDF, update ejection
  const { signed_pdf_s3_key } = req.body;
  await ejectionService.recordAttestation(req.params.id, signed_pdf_s3_key);
  res.json({ attested: true });
});

router.get("/", requireClaraOrClerk, async (req, res) => {
  const ejections = await Ejection.findAll({
    where: { userId: req.claraUser!.userId },
    order: [["exportedAt", "DESC"]],
  });
  res.json({ ejections });
});

export default router;
```

---

## Part 4 — Fingerprint Scanning Job (Anti-Double-Hosting)

**File:** `backend/src/jobs/fingerprint-scan.ts`

Nightly job that scrapes public agent directories and matches fingerprints:

```typescript
import cron from "node-cron";
import { Ejection } from "@/models";
import { scanAnthropicMarketplace, scanOpenAiGptStore } from "@/services/fingerprint-scanners";
import logger from "@/lib/logger";

cron.schedule("0 3 * * *", async () => {
  const anthropicMatches = await scanAnthropicMarketplace();
  const openAiMatches = await scanOpenAiGptStore();

  for (const match of [...anthropicMatches, ...openAiMatches]) {
    const ejection = await Ejection.findOne({ where: { fingerprintHash: match.fingerprint } });
    if (!ejection) continue;

    // Check: does user STILL have an active Clara subscription for this agent?
    const activeSub = await UserSubscription.findOne({
      where: { userId: ejection.userId, status: "active" },
    });
    if (!activeSub) continue;  // No active sub — not a violation

    await ejection.update({
      detectedDoubleHosting: true,
      doubleHostingEvidence: {
        platform: match.platform,
        url: match.url,
        detected_at: new Date(),
      },
    });

    logger.error("double_hosting_detected", {
      userId: ejection.userId,
      ejectionId: ejection.id,
      platform: match.platform,
      url: match.url,
    });

    // Alert ops team, pause subscription pending review
    await alertOps("double_hosting_violation", { userId: ejection.userId, evidence: match });
  }
});
```

---

## Part 5 — Quarterly Attestation Modal

**File:** `frontend/src/components/QuarterlyAttestation.tsx`

Dashboard modal that fires on login once per quarter for users with any ejections:

```tsx
export function QuarterlyAttestation() {
  const { userHasEjections, needsAttestation } = useQuarterlyAttestation();
  if (!needsAttestation) return null;

  return (
    <Modal required>
      <h2>Quarterly Attestation</h2>
      <p>I confirm that no agents I've exported are currently running on a competing AI platform (Anthropic, OpenAI, etc.) while I maintain active Clara hosting of the same agent.</p>
      <button onClick={confirm}>I Confirm</button>
    </Modal>
  );
}
```

---

## Part 6 — Tests

```typescript
describe("EjectionService", () => {
  it("rejects when monthly ejection cap reached");
  it("allows enterprise to exceed cap (null = custom)");
  it("generates unique fingerprint per export");
  it("sanitizes SOUL.md before including in ZIP");
  it("does NOT include skill implementations");
  it("does NOT include Clara platform code");
  it("uploads ZIP to S3 + returns pre-signed URL");
  it("records Ejection row with status=pending_attestation");
});

describe("Routes", () => {
  it("POST /agents/:id/eject creates ejection + returns download");
  it("POST /:id/attestation accepts signed PDF");
  it("GET / lists caller's ejections");
});

describe("Fingerprint scan", () => {
  it("detects match between Clara export and Anthropic marketplace listing");
  it("flags double_hosting only if subscription is active");
  it("alerts ops team on detection");
});
```

---

## Acceptance Criteria

- [ ] `ejections` table in all three environments
- [ ] Per-tier ejection cap enforced (1/3/6/12/Custom)
- [ ] ZIP contains: soul.md (sanitized), configuration.json, voice, conversation history, README, what-you-have, what-you-need, attestation template
- [ ] ZIP does NOT contain: skill implementations, Clara platform code, model weights, voice server code
- [ ] Unique SHA-512 fingerprint per export
- [ ] Pre-signed S3 URL valid 24h
- [ ] Attestation PDF flow stubbed and wired
- [ ] Fingerprint scan job scaffolded for Anthropic + OpenAI directories
- [ ] Double-hosting detection flags Ejection + alerts ops
- [ ] Ejection does NOT cancel subscription
- [ ] Quarterly attestation modal in dashboard
- [ ] `npm run type-check` passes
- [ ] All tests pass
- [ ] CI thin-client gate passes

## Branch + PR

```bash
git checkout -b prompt/2026-04-23/25-ejection-export-system
git commit -m "feat(ejection): agent export ZIP + fingerprint + attestation + anti-double-hosting scan"
gh pr create --base develop --title "feat(ejection): agent export system with fingerprint + attestation"
```
