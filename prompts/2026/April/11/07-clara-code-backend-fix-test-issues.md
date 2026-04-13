# Clara Code Backend — Fix All Remaining Issues (Test + Code)
**Repo:** `imaginationeverywhere/clara-code`
**Working dir:** `backend/`
**Branch:** `develop`
**Review docs:** `docs/review/20260411-082334-backend-corrective-review.md` (B+), `docs/review/20260411-084952-backend-test-suite-review.md` (A-)
**Grade to reach:** A

## YOUR MISSION

Fix all 4 remaining open issues. Three are in test files/config. One is a 4-line validation fix in an implementation file.

`npm run test:coverage` must exit 0 after every change.

---

## FIX 1 — [M1] Add branch coverage threshold to `jest.config.ts`

**File:** `backend/jest.config.ts`

Find this line:
```typescript
coverageThreshold: { global: { lines: 80, functions: 80, statements: 80 } },
```

Replace with:
```typescript
coverageThreshold: { global: { lines: 80, branches: 65, functions: 80, statements: 80 } },
```

**Why:** Branch coverage is currently ~68%. Adding a `65` floor locks in the current state and prevents silent regression as the codebase grows. This is a 1-character change that costs nothing if tests pass.

After this change, run:
```bash
npm run test:coverage
```
It must still pass (current branches ~68% > threshold 65%).

---

## FIX 2 — [M2] Replace `rate-limit.test.ts` stub with behavioral tests

**File:** `backend/src/__tests__/middleware/rate-limit.test.ts`

Replace the entire file content with:

```typescript
import request from "supertest";
import express from "express";
import { apiKeyCreateLimiter, voiceLimiter, waitlistLimiter } from "@/middleware/rate-limit";

describe("rate-limit middleware", () => {
  it("exports three configured limiter functions", () => {
    expect(typeof waitlistLimiter).toBe("function");
    expect(typeof voiceLimiter).toBe("function");
    expect(typeof apiKeyCreateLimiter).toBe("function");
  });

  it("waitlistLimiter allows 5 requests then returns 429", async () => {
    // Tests that max: 5 is actually configured
    const app = express();
    app.use(waitlistLimiter);
    app.post("/", (_req, res) => res.status(200).json({ ok: true }));

    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/").set("X-Forwarded-For", "10.0.0.1");
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).post("/").set("X-Forwarded-For", "10.0.0.1");
    expect(blocked.status).toBe(429);
  });

  it("voiceLimiter returns a function (rate limiter)", () => {
    // voiceLimiter max:20 is expensive to exhaust; verify it is a real rate-limit instance
    const app = express();
    app.use(voiceLimiter);
    app.post("/", (_req, res) => res.json({ ok: true }));
    // Just confirm it mounts and passes for a single request
    return request(app).post("/").expect(200);
  });

  it("apiKeyCreateLimiter returns a function (rate limiter)", () => {
    const app = express();
    app.use(apiKeyCreateLimiter);
    app.post("/", (_req, res) => res.json({ ok: true }));
    return request(app).post("/").expect(200);
  });
});
```

**Note:** `waitlistLimiter` uses an in-memory store. The test sets `X-Forwarded-For: 10.0.0.1` so the 6-request sequence hits the same logical IP without interfering with other test files (which mock the limiter at the module level).

---

## FIX 3 — [L1] Add `DELETE /:id` 500 error case to `keys.test.ts`

**File:** `backend/src/__tests__/routes/keys.test.ts`

Find this block (last test in the file):
```typescript
  it("DELETE /:id 404", async () => {
    (ApiKey.findOne as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app).delete("/api/keys/missing");
    expect(res.status).toBe(404);
  });
```

Add ONE new test immediately after it (before the closing `});`):
```typescript
  it("DELETE /:id 500 on db error", async () => {
    (ApiKey.findOne as jest.Mock).mockRejectedValueOnce(new Error("db crash"));
    const res = await request(app).delete("/api/keys/anid");
    expect(res.status).toBe(500);
  });
```

---

## FIX 4 — [M2-CODE] Add `name` length validation to `POST /api/keys`

**File:** `backend/src/routes/keys.ts`

Find this block:
```typescript
    const { name } = req.body as { name?: string };
    if (!name) {
      res.status(400).json({ error: "Key name is required" });
      return;
    }
```

Replace with:
```typescript
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Key name is required" });
      return;
    }
    if (name.length > 255) {
      res.status(400).json({ error: "Key name must be 255 characters or fewer" });
      return;
    }
```

Then add a test for it in `backend/src/__tests__/routes/keys.test.ts`.

Find this test:
```typescript
  it("POST / 400 without name", async () => {
    const res = await request(app).post("/api/keys").send({});
    expect(res.status).toBe(400);
  });
```

Add ONE new test immediately after it:
```typescript
  it("POST / 400 when name exceeds 255 chars", async () => {
    const res = await request(app).post("/api/keys").send({ name: "x".repeat(256) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/255/);
  });
```

---

## VERIFICATION

After all four fixes:

```bash
cd /Volumes/X10-Pro/Native-Projects/Quik-Nation/clara-code/backend

# Must pass with all thresholds including new branches: 65
npm run test:coverage

# Expected:
# Lines   : 90%+  ✅
# Branches: 68%+  ✅  (now enforced)
# Functions: 85%+ ✅
# Statements: 90%+ ✅
# All test suites pass. Zero failures.

# Also verify TypeScript compiles clean
npm run build
```

---

## COMMIT

```bash
cd /Volumes/X10-Pro/Native-Projects/Quik-Nation/clara-code

git add backend/jest.config.ts \
        backend/src/__tests__/middleware/rate-limit.test.ts \
        backend/src/__tests__/routes/keys.test.ts \
        backend/src/routes/keys.ts

git commit -m "fix(backend): resolve all remaining review issues — branch threshold + rate-limit behavior + DELETE 500 + name length guard

- [M1] jest.config.ts: add branches:65 coverage threshold
- [M2] rate-limit.test.ts: behavioral 429 test for waitlistLimiter
- [L1] keys.test.ts: add DELETE /:id 500 error case
- [M2-code] routes/keys.ts: add 255-char name length validation + test

Coverage: 90%+ lines/statements, 85%+ functions, 68%+ branches (all pass)
Build: clean

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin develop
```

---

## HARD RULES

1. **No `@ts-ignore`** — fix types properly
2. **Run `npm run test:coverage` after each fix** — all thresholds must pass
3. **`npm run build` must also pass** — confirm no TypeScript errors after the keys.ts change
4. **80% floor is non-negotiable** — don't lower thresholds to make tests pass
