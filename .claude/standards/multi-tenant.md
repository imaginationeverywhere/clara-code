# Multi-Tenancy Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --multi-tenant`

---

## CRITICAL RULES

### 1. Every DB query MUST scope to tenant — no exceptions

**FORBIDDEN:**
```typescript
// ❌ Returns data for ALL tenants — catastrophic data leak
const orders = await Order.findAll({ where: { userId } });

// ❌ Admin endpoint without tenant scope
const users = await User.findAll();
```

**REQUIRED:**
```typescript
// ✅ Always scope to tenantId from context
const orders = await Order.findAll({
  where: { userId, tenantId: ctx.tenantId },
});

// ✅ Even platform admin queries should be intentional about scope
const users = await User.findAll({
  where: { tenantId }, // explicit — reader knows this is scoped
});
```

---

### 2. PLATFORM_OWNER vs SITE_OWNER — never mix

```
PLATFORM_OWNER = Quik Nation / Auset Platform
  → Owns: infrastructure, Stripe master account, Clerk application, AWS
  → Can read ALL tenant data (for support/billing)
  → Has platform-admin role

SITE_OWNER = the client (e.g., DreamiHairCare, QuikCarRental)
  → Owns: their business data, customers, revenue
  → Can ONLY see their own tenant's data
  → Has site-admin role
```

**Enforced in code:**
```typescript
// Platform admin check — only for PLATFORM_OWNER operations
if (ctx.user.role !== "platform-admin") {
  throw new ForbiddenError("Platform admin access required");
}

// Site admin check — for SITE_OWNER operations
if (ctx.user.role !== "admin" || ctx.user.tenantId !== targetTenantId) {
  throw new ForbiddenError("Site admin access required");
}
```

---

### 3. Every table that holds tenant data MUST have `tenantId`

```sql
-- ✅ Required on ALL business data tables
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),  -- REQUIRED
  user_id UUID NOT NULL,
  -- ...
  INDEX idx_orders_tenant_id (tenant_id),           -- REQUIRED
  INDEX idx_orders_tenant_user (tenant_id, user_id) -- REQUIRED for hot paths
);
```

Tables that do NOT need `tenantId`: `tenants` itself, platform-level configs, global lookup tables (countries, currencies).

---

### 4. Middleware must resolve tenantId before any route handler

```typescript
// src/middleware/tenant.ts
export async function resolveTenant(req, res, next) {
  // Resolution strategies (use whichever fits the Heru):
  // 1. Subdomain: app.dreamihaircare.com → tenantId from DB lookup
  // 2. Custom domain: mysite.com → tenantId from domain mapping table
  // 3. Header: X-Tenant-ID (for API clients)
  // 4. JWT claim: tenantId embedded in Clerk session token metadata

  const tenantId = await getTenantIdFromRequest(req);
  if (!tenantId) {
    res.status(404).json({ error: "tenant_not_found" });
    return;
  }
  req.tenantId = tenantId;
  next();
}
```

---

### 5. Stripe Connect — payments NEVER cross tenants

```typescript
// ✅ Always use the tenant's Stripe account for charges
const charge = await stripe.charges.create(
  { amount, currency: "usd" },
  { stripeAccount: tenant.stripeConnectAccountId } // ← critical
);

// ❌ Charging to the platform account for site-owner revenue
const charge = await stripe.charges.create({ amount, currency: "usd" });
// ^ This charges the PLATFORM master account, not the client's account
```

---

### 6. Logs must include tenantId — never log cross-tenant data

```typescript
// ✅
logger.info("Order created", { tenantId, orderId, userId });

// ❌ Logging full user objects leaks PII across tenants in shared log streams
logger.info("Order created", { order, user });
```

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/multi-tenant.md` that documents:
- How `tenantId` is resolved for this Heru (subdomain? domain mapping? header?)
- Tables that intentionally DO NOT have `tenantId` (and why)
- Whether this Heru uses Stripe Connect or the platform master account
- Any tenant isolation exceptions (shared catalog tables, etc.)

If `docs/standards/multi-tenant.md` does not exist, create it.
