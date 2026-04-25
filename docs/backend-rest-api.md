# Clara Code backend — REST surface (agent platform)

This document summarizes **non-GraphQL** HTTP routes on the Clara Code API (`backend/`) that support multi-agent workflows. All routes require **Clerk session** or **Clara API key** (`Authorization: Bearer sk-clara-*` or `cc_live_*`) unless noted.

## Migrations (run per environment)

| File | Purpose |
|------|---------|
| `backend/migrations/028_agent_messaging.sql` | `agent_messages` — async agent-to-agent inbox |
| `backend/migrations/029_sprints_and_standups.sql` | `sprints`, `sprint_tasks`, `standup_reports` |
| `backend/migrations/030_user_profile.sql` | `user_profiles` — global context for all agents |
| `backend/migrations/031_agent_phase.sql` | `agents.phase` (`builder` \| `runtime`), `industry_vertical` |

Apply with `psql $DATABASE_URL -f <file>` (or your standard migration process).

## `/api/agents`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Create harness agent. Body: `name`, `soul` (or `soul_md`), optional `phase` (`builder` default), `industry_vertical`, `skills[]`. **Runtime** agents require **Business/Enterprise** tier. |
| `POST` | `/message` | Send message. Body: `from_agent_id`, `to_agent_id`, `content`, optional `message_type`, `thread_id`, `metadata`. Only `clara` may send to `to_agent_id: "all"`. |
| `GET` | `/inbox?agent_id=` | List unread for agent; marks read. |
| `GET` | `/thread/:threadId` | Thread history **scoped to authenticated user**. |

## `/api/sprints`

Register order lists **static** paths before `/:sprintId` routes.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/active` | Current active sprint (includes tasks). |
| `GET` | `/velocity` | `avgTurnsPerSprint`, `sprintsCompleted`. |
| `GET` | `/profile` | Global `user_profiles` row for the user. |
| `GET` | `/standup/agent?agent_id=` | Agent memory summary (Clara “read any agent”). |
| `POST` | `/standup/team` | Full team standup; returns `report` and voice `prompt` text. |
| `POST` | `/` | Create sprint; body: `goal`. |
| `POST` | `/:sprintId/tasks` | Add task; body: `agent_id`, `title`, `description?`. |
| `PATCH` | `/tasks/:taskId` | Update task; body: `status`, `blocker?`. |
| `POST` | `/:sprintId/standup` | Per-agent standup report for a sprint. |

## Voice memory integration

`GET /api/voice/...` continues to use `memory.service.ts`. After these changes, `getMemoryContext` / `buildHistory` prepend (when present): **phase prefix** (UUID agents with a row in `agents`), **global user profile**, **inbox messages**, then **`[My Memory]`** summary, then recent turns.

See `backend/CHANGELOG.md` and root `CHANGELOG.md` for release notes.
