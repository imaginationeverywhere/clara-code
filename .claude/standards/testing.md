# Testing Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --testing`

---

## CRITICAL RULES

### 1. 80% coverage minimum — enforced before merge

Every changed file must have ≥80% line/statement coverage. Global branch threshold: 65%.

```bash
# Must pass before any PR is opened:
npm run test:coverage

# Thresholds in jest.config.ts (DO NOT lower these):
coverageThreshold: {
  global: { lines: 80, statements: 80, branches: 65 },
  // Per-file minimums enforced by /review-code
}
```

---

### 2. Integration tests hit the real database — no DB mocks

```typescript
// ❌ Mocked DB — misses real constraint errors, migration bugs, query planner issues
jest.mock("../db", () => ({ query: jest.fn() }));

// ✅ Real DB in tests — use a test database, real pool
const pool = { query: mockQuery } as Pool; // ← only mock the pool interface, not the SQL
// OR for integration tests:
beforeAll(() => setupTestDatabase()); // real Postgres, test schema
afterAll(() => teardownTestDatabase());
```

---

### 3. Test behavior, not implementation

```typescript
// ❌ Tests implementation detail — breaks on every refactor
it("calls User.findByPk with the correct id", async () => {
  expect(User.findByPk).toHaveBeenCalledWith("user_1");
});

// ✅ Tests observable behavior — survives refactors
it("GET /api/users/:id returns the user", async () => {
  const res = await request(app).get("/api/users/user_1");
  expect(res.status).toBe(200);
  expect(res.body.user.id).toBe("user_1");
});
```

---

### 4. Error path coverage is mandatory

Every route/resolver MUST have tests for:
- Missing auth → 401
- Wrong role → 403
- Resource not found → 404
- Invalid input → 400
- Service/DB throws → 500

```typescript
it("returns 401 when no auth", async () => { /* ... */ });
it("returns 403 when not admin", async () => { /* ... */ });
it("returns 404 when not found", async () => { /* ... */ });
it("returns 500 when DB throws", async () => {
  mockQuery.mockRejectedValueOnce(new Error("db"));
  const res = await request(app).get("/api/resource/x").set("Authorization", "Bearer sk-test");
  expect(res.status).toBe(500);
});
```

---

### 5. Mock external services, never internal code

```typescript
// ✅ Mock Stripe (external)
jest.mock("stripe", () => jest.fn().mockImplementation(() => ({ checkout: { sessions: { create: mockCreate } } })));

// ✅ Mock Clerk (external)
jest.mock("@clerk/clerk-sdk-node", () => ({ verifyToken: jest.fn() }));

// ❌ Do NOT mock internal services — test them through the HTTP layer
jest.mock("../services/UserService"); // ← defeats the purpose
```

---

### 6. Test file naming and location

```
src/
└── __tests__/
    ├── routes/           # Route-level integration tests
    │   └── users.test.ts
    ├── graphql/          # Resolver unit tests
    │   └── resolvers.test.ts
    ├── services/         # Service unit tests (when complex logic warrants it)
    └── utils/            # Utility function tests
```

Test file name MUST mirror the source file: `users.routes.ts` → `users.test.ts`.

---

### 7. Use `beforeEach` to reset mocks and state

```typescript
beforeEach(() => {
  jest.clearAllMocks();           // Reset call counts and return values
  mockQuery = jest.fn();          // Fresh mock per test
  app = createTestApp(service);   // Fresh app instance per test
});
```

Never share mutable state between tests.

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/testing.md` that documents:
- Test database setup and teardown process
- Which services are real vs mocked in this project
- Coverage thresholds (if overriding the platform defaults)
- How to run tests locally
- CI test configuration

If `docs/standards/testing.md` does not exist, create it.
