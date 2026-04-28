# Implement `clara gear add` namespace + first gear: `email-receiver-cf`

## Role
You are **Norbert Rillieux** implementing the `clara gear` namespace + the first productized Gear. Daysha directive §E. Cloudflare Email wrapper pattern already exists in boilerplate `infrastructure/mcp/wrappers/`.

## Read first
- 07 (Daysha §E)
- 08 (firewall)
- 09 (voice catalog §E)
- `infrastructure/mcp/wrappers/` in `quik-nation-ai-boilerplate` (existing email-receiver wrapper — productize as Gear)

## Intent contract

```yaml
intent: "gear.add"
tier: "plus"
params:
  gear_name: string (required — Gear slug from catalog)
  agent_name: string (default: from cwd)
  config: object (gear-specific, optional)
```

Voice: catalog 09 §E.

## Task

Two deliverables:

### A. `clara gear` namespace + dispatcher

1. `packages/cli/src/commands/gear.ts` — subcommand router:
   - `clara gear add <name>` → `runIntent("gear.add", { gear_name, ... })`
   - `clara gear remove <name>` → `runIntent("gear.remove", { gear_name })`
   - `clara gear list` → `runIntent("gear.list")` (lists installed gears for current agent)
   - `clara gear catalog` → `runIntent("gear.catalog")` (lists all available Gears in marketplace)
2. Each subcommand is a thin actuator. Server holds the catalog + the install logic.

### B. First productized Gear: `email-receiver-cf`

Gear that lets an agent receive inbound email. Server-side (gateway):

1. Provisions a Cloudflare Email Workers route for `<heru>.claracode.ai/email/*` → catch-all forward to a Worker
2. Worker parses inbound email, extracts text + attachments, POSTs to the agent's `/api/inbox/email` endpoint
3. Backend wires `/api/inbox/email` to dispatch the email body as an event the agent's runtime can act on
4. Brain partition records "email_inbox" facts for retrieval

CLI receives:
- The email address that's now live (e.g., `daysha@daysha-taylor.claracode.ai`)
- The webhook secret in SSM
- A test command: `clara gear test email-receiver-cf` sends a sample email to verify the loop

## Acceptance

- `clara gear add email-receiver-cf` provisions the route + worker + backend wiring end-to-end
- Returns the live email address; printed unadorned for easy copy
- 403 tier_lock for Taste (Plus+ required)
- 409 if already installed — `--force` to reinstall
- `clara gear test email-receiver-cf` sends a synthetic email through the loop, asserts agent receives it
- `clara gear list` shows email-receiver-cf as installed with the live address
- Tests: install, tier_lock, idempotent install (409), test command, list, remove
- **IP audit:** zero CF API tokens / Worker source code / SSM key paths in CLI

## Constraints

- Email Worker source lives in `infrastructure/cloudflare/workers/email-receiver/` on the platform side — productized as Gear, NOT shipped in customer repo
- Webhook secret rotated per agent
- Inbound emails > 25MB rejected at the Worker level
- Spam filtering via Cloudflare's built-in (not our own — out of scope)

## Mo is watching

Email-receiver is the first Gear pattern. Every future Gear builds on this scaffold (gateway-side install template + CLI thin actuator). Get this one right and the rest are mechanical.
