# Per-agent checkpoints (optional)

When you launch a dedicated agent window (`gran`, `mary`, `swarm-launcher.sh agent …`), the environment sets `SWARM_RESUME_AGENT` to the agent file basename (e.g. `granville`, `mary-bethune`).

The **SessionStart** hook (`.claude/hooks/session-resume.py`) reads:

`memory/agent-checkpoints/<SWARM_RESUME_AGENT>.md`

if it exists, **before** the project-wide `memory/session-checkpoint.md`.

Use this for agent-specific “where I left off” notes. Update the file at the end of a focused session, or append from `/session-continue` workflows when you want separation from the shared project checkpoint.
