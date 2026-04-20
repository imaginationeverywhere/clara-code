# /brain-recent — Last auto-captured vault memories

Lists the **20 most recently modified** markdown files under `~/auset-brain/` whose frontmatter includes `origin: auto-capture`.

## Run locally

```bash
find ~/auset-brain -name '*.md' -mmin -1440 -print0 2>/dev/null \
  | xargs -0 grep -l '^origin: auto-capture' 2>/dev/null \
  | while IFS= read -r f; do stat -f '%m %N' "$f" 2>/dev/null || stat -c '%Y %n' "$f"; done \
  | sort -rn | head -20
```

Or quick grep-only (no sort by mtime):

```bash
grep -rl '^origin: auto-capture' ~/auset-brain --include='*.md' 2>/dev/null | head -20
```

## Notes

- Requires vault on disk (`AUSET_BRAIN_HOME` / default `~/auset-brain`).
- Cursor users without Claude Code can use the same `grep` patterns — see `infrastructure/brain/README.md`.
