# /merge-all — One command. Merge every branch into develop. Delete everything else.

**No flags. No options. Runs on the current repo.**

```
/merge-all
```

That's it.

## What it does (in order)

1. `git fetch --all --prune`
2. `git checkout develop && git pull`
3. For every origin branch **except main / develop / backup/\* / HEAD**:
   - `git merge --no-ff origin/<branch>` → develop
   - Conflict? `git merge --abort`, skip, keep going.
4. `git push origin develop`
5. Delete every branch local AND remote except main / develop / backup/\*.

## What gets preserved

- `main` (never touched)
- `develop` (the target, never deleted)
- `backup/*` (anything backup-prefixed)

## What happens to conflicts

Skipped. Listed at the end. You rebase manually. The script does NOT attempt auto-resolution.

## Run it in any Heru's tab

```bash
bash .claude/scripts/merge-all.sh
```

That's the whole command. No parameters to learn.

## Related

- `/git-sweep` — parameterized version (dry-run, merged-only, etc.) if you want nuance. `/merge-all` is the no-nuance sledgehammer.
