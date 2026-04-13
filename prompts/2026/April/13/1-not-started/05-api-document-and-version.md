# 05 — API: Document, Version, and Stabilize

**Surface:** Clara Code public API (Express backend)
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Branch:** `develop`
**Agent:** Miles (backend Cursor agent on QCS1, run after prompt 02)

---

## Context

The Express backend IS the Clara Code API. Before calling it "done," it needs:
1. API versioning (`/v1/` prefix)
2. OpenAPI/Swagger documentation
3. Rate limiting per API key
4. Clear stable contracts for public consumption

This runs after prompt 02 (backend hardening) is complete.

---

## Task 1 — Add API Versioning

All routes should be accessible at `/v1/`:
- `GET /v1/health`
- `GET /v1/keys`, `POST /v1/keys`, `DELETE /v1/keys/:id`
- `POST /v1/voice/chat`
- `POST /v1/waitlist`
- `GET /v1/auth/me`

**Approach:**
- In `backend/src/routes/index.ts`, mount all routes under `/v1` as well as their existing paths
- Keep the existing paths working (backward compat) — just add `/v1` alias
- Or: migrate all routes to `/v1` exclusively (cleaner — choose this if no external integrations exist yet)

---

## Task 2 — Add Rate Limiting per API Key

Install `express-rate-limit` if not present:
```bash
cd backend && npm install express-rate-limit
```

Apply rate limiting to voice endpoint specifically (most expensive):
```typescript
import rateLimit from 'express-rate-limit'

const voiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 voice requests per minute per IP/key
  keyGenerator: (req) => req.headers['x-api-key'] as string || req.ip,
  message: { error: 'Rate limit exceeded. Upgrade at claracode.ai/pricing' },
})

router.post('/voice/chat', voiceLimiter, voiceChatHandler)
```

---

## Task 3 — OpenAPI Documentation

Create `backend/src/openapi.ts` or `backend/openapi.yaml`:

Document all public endpoints:
```yaml
openapi: 3.0.0
info:
  title: Clara Code API
  version: 1.0.0
  description: Voice-first AI coding API

paths:
  /v1/health:
    get:
      summary: Health check
      ...
  /v1/keys:
    get:
      summary: List API keys
      security:
        - BearerAuth: []
    post:
      summary: Create API key
      ...
  /v1/voice/chat:
    post:
      summary: Send voice message to Clara
      security:
        - ApiKeyAuth: []
      ...
```

Serve the docs at `GET /v1/docs` using `swagger-ui-express`.

---

## Task 4 — API Key Auth Middleware

**File:** `backend/src/middleware/apiKeyAuth.ts`

Create middleware that accepts EITHER:
1. `Authorization: Bearer <clerk-jwt>` — for dashboard/web users
2. `X-API-Key: <clara-api-key>` — for CLI/IDE/third-party integrations

Both should resolve to a user ID. Use the Clara API key to look up the user in the database.

Apply to voice and keys routes.

---

## Task 5 — API Reference Page on Web-UI

**File:** `frontend/src/app/docs/page.tsx` (or a new `api-reference` page)

Create a minimal API reference page at `claracode.ai/docs/api` that shows:
- Authentication (Bearer JWT vs X-API-Key)
- `POST /v1/voice/chat` — request/response format
- `GET /v1/keys` — returns list of keys
- Rate limits

This can be static markdown rendered with a code component — no need for interactive docs yet.

---

## Task 6 — Update MVP Blockers

Update `docs/auto-claude/MVP_BLOCKERS.md`:
- Mark BLK-03 (Svix) as resolved (was done in prompt 02)
- Update BLK-05 (dashboard mock data) as resolved (was done in prompt 01)
- Add note that API is versioned and documented

---

## Commit and Push

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add backend/ frontend/src/app/docs/
git commit -m "feat(api): add v1 versioning, rate limiting, OpenAPI docs, dual auth middleware"
git push origin develop
```

---

## Acceptance Criteria

- [ ] All routes accessible at `/v1/` prefix
- [ ] `GET /v1/health` returns `{ status: 'ok', db: 'connected' }`
- [ ] Rate limiting active on `/v1/voice/chat`
- [ ] OpenAPI docs accessible at `/v1/docs`
- [ ] Both Clerk JWT and X-API-Key authentication work
- [ ] API reference page live at `claracode.ai/docs/api`
- [ ] `npm run type-check` passes
- [ ] Test coverage stays ≥80%

---

## Do NOT

- Do not touch the IDE extension or CLI packages
- Do not break existing routes (backward compat required)
- Do not add GraphQL or WebSocket support (future work)
- Do not publish to npm or any registry
