# 01 — Frontend: Wire Dashboard + Polish Web-UI

**Surface:** claracode.ai frontend (Next.js, Cloudflare Pages)
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clara-code`
**Branch:** `develop` (all commits go here)
**Agent:** Motley (frontend Cursor agent on QCS1)

---

## Context

The claracode.ai web-ui has all its routes but the dashboard is entirely fake — it uses `localStorage` to store API keys with no backend connection. The backend has a real `GET /api/keys`, `POST /api/keys`, and `DELETE /api/keys/:id` endpoint ready at `/Volumes/X10-Pro/Native-Projects/AI/clara-code/backend/src/routes/keys.ts`. This prompt wires the dashboard to the real API and finishes any remaining marketing page gaps.

---

## Task 1 — Wire Dashboard to Backend API

**File:** `frontend/src/app/dashboard/page.tsx`

Replace all `localStorage` usage with real API calls:

1. Remove `STORAGE_KEY`, `loadKeys()`, `saveKeys()`, `randomId()`, `generateSecret()` (all client-side key generation)
2. On mount: `GET /api/keys` with Clerk JWT in `Authorization: Bearer <token>` header → populate `keys` state
3. Create key: `POST /api/keys` with `{ name }` → refresh key list
4. Delete key: `DELETE /api/keys/:id` → refresh key list
5. Display the `prefix` returned by the API (e.g. `sk_live_abc123...`) — never show full secret after creation except at creation time
6. Add loading states and error handling (toast or inline error)
7. Use `useAuth()` from `@clerk/nextjs` to get the token: `const { getToken } = useAuth()`

**Acceptance criteria:**
- [ ] Dashboard loads API keys from `GET /api/keys` on mount
- [ ] Creating a key calls `POST /api/keys` and shows the key prefix
- [ ] Deleting a key calls `DELETE /api/keys/:id`
- [ ] No `localStorage` references remain in dashboard page
- [ ] TypeScript compiles clean (`npm run type-check`)
- [ ] No console errors in browser

---

## Task 2 — Wire api-keys page to same backend

**File:** `frontend/src/app/api-keys/ApiKeysContent.tsx`

Check if this page also uses localStorage. If so, apply the same wiring pattern as Task 1.

---

## Task 3 — Marketing Pages Audit

Walk through all routes in `frontend/src/app/(marketing)/`:
- Confirm every page renders without errors
- Confirm pricing page shows $49/mo Starter and $99/mo Pro (check against `frontend/src/app/pricing/page.tsx`)
- Confirm `Install CTA` links point to the correct `npx` command: `npx claracode@latest`
- Confirm `Sign in` and `Sign up` links go to `/sign-in` and `/sign-up`
- Fix any broken links, placeholder text ("Lorem ipsum", "COMING SOON" without styling), or missing content

---

## Task 4 — Clerk Middleware Re-enable (if keys are present)

**File:** `frontend/src/middleware.ts`

Check current state. If middleware is currently a passthrough (`NextResponse.next()`), leave it — it's waiting for Clerk env vars in CF Workers. Document this clearly with a comment explaining it's intentional until BLK-02 is resolved.

---

## Task 5 — Cloudflare Build Verify

After all changes:
```bash
cd frontend
npm run type-check    # must pass
npm run pages:build   # must complete without error
```

Fix any build errors before committing.

---

## Commit and Push

```bash
cd /Volumes/X10-Pro/Native-Projects/AI/clara-code
git add frontend/
git commit -m "feat(frontend): wire dashboard to /api/keys backend, audit marketing pages"
git push origin develop
```

---

## Do NOT

- Do not touch backend files
- Do not add new pages or routes not listed above
- Do not enable Stripe checkout (merchant account not approved)
- Do not enable Clerk middleware (CF env vars not set)
- Do not use `localStorage` for any new functionality
