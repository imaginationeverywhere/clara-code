# Test audit — 2026-04-13

Full backend Jest run with coverage (`npm test -- --coverage`).

## Result

- **Suites:** 16/16 passing (0 failures)
- **Tests:** 77 passing
- **Coverage (global):** meets `jest.config.ts` thresholds — lines ≥80%, branches ≥65%, functions ≥80%, statements ≥80%

## Voice routes

- `src/routes/voice.ts` present; `src/routes/index.ts` imports `./voice` and mounts at `/voice` under the API router.
- `src/server.ts` mounts `apiRoutes` at `/api`, so voice endpoints are under `/api/voice`.

## Typecheck

- `npx tsc --noEmit` in `backend/` — clean
