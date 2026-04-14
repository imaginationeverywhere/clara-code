# Digital Pass Standard (PassKit Bridge)

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --digital-pass`

> ⚠️ **BRIDGE IMPLEMENTATION** — This standard covers PassKit (Apple Wallet + Google Wallet) as a temporary bridge until the Quik Nation native digital wallet is built. When the native wallet ships, this standard will be superseded.

Covers: PKPass generation (Apple Wallet), Google Wallet passes, pass signing, and delivery.

---

## CRITICAL RULES

### 1. Pass signing certificates from SSM — never checked into git

```typescript
// ✅ Certificate and key from SSM at runtime
const passCertificate = process.env.PASSKIT_CERTIFICATE;  // SSM: /[project]/PASSKIT_CERTIFICATE
const passKey         = process.env.PASSKIT_KEY;          // SSM: /[project]/PASSKIT_KEY
const passKeySecret   = process.env.PASSKIT_KEY_SECRET;   // SSM: /[project]/PASSKIT_KEY_SECRET (may be empty string)
const teamId          = process.env.APPLE_TEAM_ID;        // SSM: /quik-nation/shared/APPLE_TEAM_ID
const passTypeId      = process.env.PASSKIT_PASS_TYPE_ID; // SSM: /[project]/PASSKIT_PASS_TYPE_ID

// ❌ NEVER check .p12 files or certificates into git
// ❌ NEVER store key material in environment files committed to source control
```

**SSM paths:**
```
/quik-nation/shared/APPLE_TEAM_ID
/[project]/PASSKIT_CERTIFICATE          # PEM-encoded certificate (base64)
/[project]/PASSKIT_KEY                  # PEM-encoded private key (base64)
/[project]/PASSKIT_KEY_SECRET           # Optional passphrase
/[project]/PASSKIT_PASS_TYPE_ID         # e.g. pass.com.quiknation.loyalty
/[project]/GOOGLE_WALLET_ISSUER_ID      # Google Wallet issuer ID
/[project]/GOOGLE_WALLET_SERVICE_ACCOUNT_JSON  # JSON (base64)
```

---

### 2. PKPass structure — required fields

```typescript
// ✅ Minimal valid pass.json
const passJson = {
  formatVersion: 1,
  passTypeIdentifier: process.env.PASSKIT_PASS_TYPE_ID,
  serialNumber: `pass-${userId}-${Date.now()}`,
  teamIdentifier: process.env.APPLE_TEAM_ID,
  organizationName: "Quik Nation",
  description: "Loyalty Card",
  logoText: "QuikNation",

  // Barcode / QR code
  barcodes: [{
    message: userId,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
  }],

  // Pass type — one of: boardingPass, coupon, eventTicket, generic, storeCard
  storeCard: {
    primaryFields: [{ key: "balance", label: "POINTS", value: "1,250" }],
    auxiliaryFields: [{ key: "tier", label: "TIER", value: "Gold" }],
  },

  // Colors (match Heru design system)
  backgroundColor: "rgb(9,9,15)",
  foregroundColor: "rgb(255,255,255)",
  labelColor: "rgb(123,205,216)",
};
```

---

### 3. Use `passkit-generator` (node) — not manual zip construction

```typescript
import { PKPass } from "passkit-generator";

// ✅ Use passkit-generator for correct signing
export async function generatePass(userId: string, data: PassData): Promise<Buffer> {
  const pass = await PKPass.from(
    {
      model: "./src/passes/loyalty.pass", // directory with pass.json + images
      certificates: {
        wwdr: Buffer.from(process.env.PASSKIT_WWDR!, "base64"),
        signerCert: Buffer.from(process.env.PASSKIT_CERTIFICATE!, "base64"),
        signerKey: Buffer.from(process.env.PASSKIT_KEY!, "base64"),
        signerKeyPassphrase: process.env.PASSKIT_KEY_SECRET || undefined,
      },
    },
    {
      serialNumber: `pass-${userId}-${Date.now()}`,
      "storeCard.primaryFields.0.value": String(data.points),
    }
  );

  return pass.getAsBuffer();
}

// ❌ Never manually construct pkpass zip — signing will be wrong
```

---

### 4. Pass delivery — correct MIME type and headers

```typescript
// ✅ Apple requires exact MIME type for pass downloads
router.get("/api/passes/:userId", requireAuth, async (req, res) => {
  const passBuffer = await generatePass(req.params.userId, data);

  res.setHeader("Content-Type", "application/vnd.apple.pkpass");
  res.setHeader("Content-Disposition", `attachment; filename="pass.pkpass"`);
  res.setHeader("Content-Transfer-Encoding", "binary");
  res.send(passBuffer);
});

// ❌ Sending as application/octet-stream — iOS won't recognize it
res.setHeader("Content-Type", "application/octet-stream");
```

---

### 5. Pass updates via push — register device token

```typescript
// ✅ Handle Passkit push registration (Apple calls this on device add)
router.post("/api/passes/v1/devices/:deviceId/registrations/:passType/:serialNumber",
  validatePasskitAuth,
  async (req, res) => {
    const { deviceId, passType, serialNumber } = req.params;
    const pushToken = req.body.pushToken;

    await PassDeviceRegistration.upsert({
      deviceId,
      passTypeId: passType,
      serialNumber,
      pushToken,
    });

    res.status(201).json({});
  }
);

// ✅ Trigger push update when pass data changes
async function updatePass(serialNumber: string) {
  const registrations = await PassDeviceRegistration.findAll({ where: { serialNumber } });
  for (const reg of registrations) {
    await sendPassUpdatePush(reg.pushToken);
  }
}
```

---

### 6. Google Wallet passes — use JWT signing

```typescript
import { GoogleAuth } from "google-auth-library";
import jwt from "jsonwebtoken";

// ✅ Google Wallet pass as signed JWT
export async function generateGoogleWalletPassUrl(userId: string, data: PassData): Promise<string> {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON!, "base64").toString()
  );

  const loyaltyObject = {
    id: `${process.env.GOOGLE_WALLET_ISSUER_ID}.${userId}`,
    classId: `${process.env.GOOGLE_WALLET_ISSUER_ID}.loyalty`,
    state: "ACTIVE",
    loyaltyPoints: {
      label: "Points",
      balance: { int: data.points },
    },
  };

  const claims = {
    iss: serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.round(new Date().getTime() / 1000),
    payload: { loyaltyObjects: [loyaltyObject] },
  };

  const token = jwt.sign(claims, serviceAccount.private_key, { algorithm: "RS256" });
  return `https://pay.google.com/gp/v/save/${token}`;
}
```

---

### Heru-specific tech doc required

Each Heru using digital passes MUST have `docs/standards/digital-pass.md` documenting:
- Pass types used (loyalty, coupon, event ticket, etc.)
- PassKit certificate rotation schedule
- Which users/tiers receive passes
- Pass update triggers (when balance/status changes → push update)
- Bridge timeline — when native wallet replaces this implementation

If `docs/standards/digital-pass.md` does not exist, create it.
