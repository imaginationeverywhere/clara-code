# Brain API access control

Clara Code and the Auset platform distinguish **founder** brain endpoints (Quik Nation internal IP) from **customer** brain endpoints (tenant-scoped product data).

## Endpoints

| Surface | Default brain base | Notes |
|--------|---------------------|--------|
| Founders (internal) | `brain-api.quiknation.com` | Full Quik Nation working memory; not for customer bundles. |
| Clara Code customers | `brain-api.claracode.ai` | Tenant-scoped; JWT carries `tenant_id` / org scope. |

## Customer-facing `/the-brain` wrapper

1. **Default target** is `https://brain-api.claracode.ai` (not `*.quiknation.com`).
2. **Refused input:** any user attempt to pass `quiknation` as a brain target from a customer context must error with a fixed message (see `packages/cli/.claude/commands/the-brain-customer.md` and `clara the-brain` CLI).
3. **Constitution:** `BRAIN.md` and platform constitution are still re-read — law for everyone.
4. **Live query path:** MCP first → HTTP fallback. **No** fallback to the founder vault or QN-only endpoints for customers.
5. **MCP:** `mcp__clara-brain__brain_query` for customers must use `CLARA_BRAIN_URL` (or equivalent) pointing at `brain-api.claracode.ai` and the customer’s credentials — never founder-only service accounts in shipped defaults.

## Release gate

Shipped **npm `clara` package** and **VSIX** artifacts are scanned in CI for:

- The literal string `brain-api.quiknation.com` (must not appear).
- The founder-only marker phrase `Constitution + Live Brain Discipline` in shipped command markdown (the founder `the-brain` command file must not ship in the customer bundle).

See `scripts/verify-customer-brain-ship.mjs`.
