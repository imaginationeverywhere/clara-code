# Security Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --security`

---

## CRITICAL RULES

### 1. Auth check on EVERY protected route — no exceptions

```typescript
// ❌ Route with no auth check
router.delete("/users/:id", async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ✅ Auth middleware first, then role check
router.delete("/users/:id", requireApiKey, async (req: ApiKeyRequest, res) => {
  const userId = req.claraUser?.userId;
  if (!userId) { res.status(401).json({ error: "unauthorized" }); return; }
  if (req.claraUser?.role !== "admin") { res.status(403).json({ error: "admin_required" }); return; }
  await User.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});
```

---

### 2. Never trust user input — validate at every boundary

```typescript
// ❌ Using raw user input in queries
const users = await db.query(`SELECT * FROM users WHERE name = '${req.body.name}'`); // SQL injection

// ✅ Parameterized queries always
const users = await db.query("SELECT * FROM users WHERE name = $1", [req.body.name]);

// ❌ Using req.params directly without validation
const id = req.params.id; // could be "../../etc/passwd" or SQL fragment

// ✅ Validate and sanitize
const id = req.params.id;
if (!/^[0-9a-f-]{36}$/.test(id)) {
  res.status(400).json({ error: "invalid_id" }); return;
}
```

---

### 3. Rate limiting on ALL public endpoints

```typescript
import rateLimit from "express-rate-limit";

// ✅ Global default limiter
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_requests" },
});
app.use(defaultLimiter);

// ✅ Stricter limit for auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/auth", authLimiter);
app.use("/api/webhooks", express.raw({ type: "application/json" })); // Webhooks exempt from JSON limiter
```

---

### 4. Secrets never in code, logs, or error messages

```typescript
// ❌ Secret in error message
catch (err) {
  res.status(500).json({ error: err.message, stack: err.stack, config: process.env });
}

// ✅ Generic error to client, full detail to server logs only
catch (err) {
  logger.error("Payment processing failed", { userId, err }); // server log: full detail
  res.status(500).json({ error: "internal_error" }); // client: generic
}

// ❌ Logging request body (may contain passwords, tokens)
logger.info("Request received", { body: req.body });

// ✅ Log only safe fields
logger.info("Request received", { path: req.path, userId: req.claraUser?.userId });
```

---

### 5. CORS locked to known origins

```typescript
// ❌ Open CORS — accepts requests from anywhere
app.use(cors());

// ✅ Explicitly allow known origins
const allowedOrigins = [
  "https://claracode.ai",
  "https://app.claracode.ai",
  process.env.NODE_ENV !== "production" ? "http://localhost:3000" : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
```

---

### 6. HTTP security headers required

```typescript
import helmet from "helmet";

// ✅ Apply Helmet before any routes
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://js.stripe.com"],
    frameSrc: ["https://js.stripe.com"],
  },
}));
```

If `helmet` is not in `package.json`, add it.

---

### 7. File upload validation (if applicable)

```typescript
// ✅ Always validate MIME type by magic bytes, not extension
import fileType from "file-type";

const detected = await fileType.fromBuffer(buffer);
const allowed = ["image/jpeg", "image/png", "image/webp"];
if (!detected || !allowed.includes(detected.mime)) {
  res.status(400).json({ error: "invalid_file_type" }); return;
}

// ✅ Size limit
if (buffer.length > 5 * 1024 * 1024) { // 5MB
  res.status(400).json({ error: "file_too_large" }); return;
}
```

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/security.md` that documents:
- Auth middleware used and where it's applied
- Rate limiting configuration
- CORS allowed origins for all environments
- Any known sensitive data fields and how they're protected
- File upload restrictions (if applicable)

If `docs/standards/security.md` does not exist, create it.
