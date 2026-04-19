# User Profile Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --profile`

Covers: User profile page, profile widget, avatar management, account settings, and the user wallet (balance, transactions, top-up).

---

## CRITICAL RULES

### 1. Profile data — sync from Clerk, extend in DB

```typescript
// ✅ Profile data architecture: Clerk is the source of truth for identity,
// DB (User table) extends it with app-specific fields

// DB User table (Sequelize)
User.init({
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  clerkId:        { type: DataTypes.STRING, allowNull: false, unique: true },
  email:          { type: DataTypes.STRING, allowNull: false },
  name:           { type: DataTypes.STRING },
  avatarUrl:      { type: DataTypes.STRING },  // synced from Clerk on webhook
  role:           { type: DataTypes.ENUM("USER", "ADMIN", "STAFF"), defaultValue: "USER" },
  // App-specific profile fields:
  bio:            { type: DataTypes.TEXT },
  phone:          { type: DataTypes.STRING },
  preferences:    { type: DataTypes.JSONB, defaultValue: {} },
  // Wallet (denormalized balance for fast reads — canonical record in WalletTransaction)
  walletBalance:  { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { sequelize, tableName: "users" });

// ❌ Storing auth credentials or Clerk tokens in the DB
// ❌ Duplicating name/email from Clerk without a sync webhook
```

---

### 2. Profile API endpoints

```typescript
// ✅ Standard profile routes
// GET    /api/profile          — fetch current user's profile
// PATCH  /api/profile          — update name, bio, phone, preferences
// POST   /api/profile/avatar   — upload new avatar (S3)

router.get("/api/profile", requireAuth, async (req: ApiKeyRequest, res) => {
  const user = await User.findOne({ where: { clerkId: req.claraUser!.userId } });
  if (!user) { res.status(404).json({ error: "profile_not_found" }); return; }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    phone: user.phone,
    preferences: user.preferences,
    walletBalance: user.walletBalance,
    role: user.role,
  });
});

router.patch("/api/profile", requireAuth, async (req: ApiKeyRequest, res) => {
  const { name, bio, phone, preferences } = req.body;
  const allowed = { name, bio, phone, preferences };  // never allow role/clerkId update here

  await User.update(allowed, { where: { clerkId: req.claraUser!.userId } });
  res.json({ success: true });
});
```

---

### 3. Profile page structure — /account/profile

```typescript
// app/account/profile/page.tsx
// ✅ Required sections on the profile page:
//
// 1. Avatar — display + upload button
// 2. Personal info — name, email (read-only from Clerk), phone, bio
// 3. Account info — subscription tier badge, member since date
// 4. Wallet summary — balance + link to full wallet page
// 5. Notification preferences — email/push toggles
// 6. Danger zone — delete account (soft delete, require confirmation)

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <ProfileHeader />        {/* Avatar + name + tier badge */}
      <PersonalInfoForm />     {/* Editable fields */}
      <WalletSummaryCard />    {/* Balance + recent transactions + top-up CTA */}
      <NotificationPrefs />    {/* Preferences toggles */}
      <DangerZone />           {/* Delete account */}
    </div>
  );
}
```

---

### 4. Wallet — schema, endpoints, and display

```typescript
// ✅ Wallet transaction table
WalletTransaction.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
  type:        { type: DataTypes.ENUM("credit", "debit", "refund", "topup"), allowNull: false },
  amount:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },  // always positive
  balanceAfter:{ type: DataTypes.DECIMAL(10, 2), allowNull: false },  // running balance
  description: { type: DataTypes.STRING, allowNull: false },
  referenceId: { type: DataTypes.STRING },  // order ID, payment ID, etc.
  metadata:    { type: DataTypes.JSONB, defaultValue: {} },
}, { sequelize, tableName: "wallet_transactions" });

// ✅ Wallet endpoints
// GET  /api/wallet/balance         — current balance
// GET  /api/wallet/transactions    — paginated transaction history
// POST /api/wallet/topup           — initiate Stripe top-up checkout

router.get("/api/wallet/balance", requireAuth, async (req, res) => {
  const user = await User.findOne({
    where: { clerkId: req.claraUser!.userId },
    attributes: ["walletBalance"],
  });
  res.json({ balance: user?.walletBalance ?? 0 });
});

router.get("/api/wallet/transactions", requireAuth, async (req, res) => {
  const page  = parseInt(String(req.query.page ?? "1"), 10);
  const limit = 20;
  const { count, rows } = await WalletTransaction.findAndCountAll({
    where: { userId: req.claraUser!.userId },
    order: [["createdAt", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });
  res.json({ transactions: rows, total: count, page });
});

// ✅ Wallet top-up via Stripe Checkout
router.post("/api/wallet/topup", requireAuth, async (req, res) => {
  const { amountCents } = req.body; // e.g. 1000 = $10.00
  if (!amountCents || amountCents < 100) {
    res.status(400).json({ error: "minimum_topup_$1" });
    return;
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: amountCents,
        product_data: { name: "Wallet Top-up" },
      },
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/wallet?topup=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/account/wallet`,
    metadata: {
      type: "wallet_topup",
      userId: req.claraUser!.userId,
      amountCents: String(amountCents),
    },
  });
  res.json({ checkoutUrl: session.url });
});
```

---

### 5. Wallet top-up — credit via Stripe webhook

```typescript
// In Stripe webhook handler (checkout.session.completed):
case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.type === "wallet_topup") {
    const userId    = session.metadata.userId;
    const amountUSD = (session.amount_total ?? 0) / 100;

    const user = await User.findOne({ where: { clerkId: userId } });
    if (user) {
      const newBalance = parseFloat(String(user.walletBalance)) + amountUSD;
      await user.update({ walletBalance: newBalance });
      await WalletTransaction.create({
        userId: user.id,
        type: "topup",
        amount: amountUSD,
        balanceAfter: newBalance,
        description: `Wallet top-up via Stripe`,
        referenceId: session.id,
      });
    }
  }
}
```

---

### 6. Wallet display component

```typescript
// src/components/wallet/WalletSummaryCard.tsx
"use client";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function WalletSummaryCard({ balance, transactions }: WalletProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-brand-teal" />
          <h3 className="font-semibold">Wallet</h3>
        </div>
        <button
          onClick={() => topUpWallet()}
          className="flex items-center gap-1 text-xs bg-brand-purple/20 text-brand-purple px-3 py-1 rounded-full hover:bg-brand-purple/30 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add funds
        </button>
      </div>

      {/* Balance */}
      <p className="text-3xl font-bold font-mono text-brand-teal mb-4">
        ${balance.toFixed(2)}
      </p>

      {/* Recent transactions */}
      <div className="space-y-2">
        {transactions.slice(0, 3).map(tx => (
          <div key={tx.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {tx.type === "credit" || tx.type === "topup"
                ? <ArrowDownLeft className="w-4 h-4 text-brand-success" />
                : <ArrowUpRight  className="w-4 h-4 text-red-400" />
              }
              <span className="text-gray-400">{tx.description}</span>
            </div>
            <span className={tx.type === "debit" ? "text-red-400" : "text-brand-success"}>
              {tx.type === "debit" ? "-" : "+"}${tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <Link href="/account/wallet" className="text-xs text-brand-purple mt-3 block hover:underline">
        View full history →
      </Link>
    </div>
  );
}
```

---

### 7. Avatar upload — S3 signed URL

```typescript
// ✅ Avatar upload via S3 presigned URL (never upload through the backend)
router.post("/api/profile/avatar", requireAuth, async (req, res) => {
  const { contentType } = req.body; // "image/jpeg" | "image/png" | "image/webp"
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(contentType)) {
    res.status(400).json({ error: "invalid_image_type" });
    return;
  }

  const key = `avatars/${req.claraUser!.userId}/${Date.now()}`;
  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Conditions: [["content-length-range", 1, 5 * 1024 * 1024]], // max 5MB
    Expires: 300,
  });

  res.json({ uploadUrl: url, fields, key });
});

// After upload completes on frontend, update avatarUrl in DB + Clerk
router.patch("/api/profile/avatar/confirm", requireAuth, async (req, res) => {
  const { key } = req.body;
  const avatarUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;

  await User.update({ avatarUrl }, { where: { clerkId: req.claraUser!.userId } });

  // Also update Clerk user profile image (optional but recommended)
  await clerkClient.users.updateUser(req.claraUser!.userId, {
    profileImageId: avatarUrl, // or use Clerk's file upload API
  });

  res.json({ avatarUrl });
});
```

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/profile.md` documenting:
- Profile fields collected beyond the Clerk defaults
- Wallet enabled: yes/no (and min/max top-up amounts)
- Avatar storage: S3 bucket name and key prefix
- Notification preference fields and what they control
- Any profile data required for app functionality (e.g., shipping address, pro license number)

If `docs/standards/profile.md` does not exist, create it.
