# /the-brain-customer — Tenant brain (Clara Code customers)

> **For Vibe Pros and customer agents.** This is **not** the Quik Nation founder brain. Same constitutional discipline as the platform; different **default endpoint** and **no** access to internal founder memory.

## Constitution and live brain discipline (customers)

- Re-read the repo `BRAIN.md` and the inherited platform rules before you recommend product changes.
- Ground live answers in the **tenant** brain: default **`https://brain-api.claracode.ai`**, with `tenant_id` and auth from the **customer’s** JWT (Clara session or API key as applicable).
- Prefer **MCP** `mcp__clara-brain__brain_query` when configured; else HTTP to the same host with the same token; **do not** fall back to a founder vault or `~/auset-brain` paths (customers do not have them).

## Default brain target

- **Base:** `brain-api.claracode.ai` (HTTPS). Resolve tool URLs relative to this unless your project doc says otherwise.
- **Auth:** use the running customer session (Clara / Clerk / API key) — never embed founder or QN internal keys in prompts.

## Refused: Quik Nation founder brain

If a user or script passes **`quiknation`** as a brain target (e.g. `/the-brain quiknation`), **do not** call out. Respond with exactly:

> Quik Nation Brain access is restricted to founders. You can query your tenant brain at brain-api.claracode.ai. If you need information from the platform, ask Quik Nation support at support@quiknation.com.

## Failure modes (short)

- **No token / 401:** ask the user to run `clara` login or refresh the IDE session; do not invent brain content.
- **Empty brain:** say you could not retrieve context and suggest checking tenant setup — do not fill with generic QN platform secrets.

## Cross-reference

- Architecture: `docs/architecture/BRAIN_API_ACCESS_CONTROL.md`
