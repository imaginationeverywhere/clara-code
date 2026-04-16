# /branch-cleanup — Merge all branches into develop. Delete everything else. Keep main, develop, and `origin`.

**No flags. No options. Runs on the current repo.**

```
/branch-cleanup
```

That's it.

## What it does (in order)

1. `git fetch --all --prune`
2. `git worktree prune` + delete dangling `worktree-agent-*` branches
3. `git checkout develop && git pull`
4. For every origin branch **except main / develop / origin** (the branch named `origin`, not the remote):
   - `git merge --no-ff origin/<branch>` into develop
   - Conflict? `git merge --abort`, skip, keep going.
5. `git push origin develop`
6. Delete every local branch except main / develop / origin
7. Delete every remote branch except main / develop / origin

## What gets preserved

- `main` (never merged in, never deleted)
- `develop` (the target, never deleted)
- `origin` — branch name `origin` on the remote (`origin/origin`): never merged, never deleted
- **Conflict branches** — if a merge conflicts, it's aborted and that branch is kept (local + remote) so you can resolve manually

## What happens to conflicts

Merge is skipped (`git merge --abort`). Those branch names are printed at the end. Rebase or resolve manually, then run `/branch-cleanup` again.

## Run it

```bash
bash .claude/scripts/branch-cleanup.sh
```

From a Cursor-only checkout (same script mirrored):

```bash
bash .cursor/scripts/branch-cleanup.sh
```

## Replaces

- `/git-sweep` — removed (was overcomplicated for this use case)
- `/merge-all` — removed (merged into this command)

## Command metadata

```yaml
name: branch-cleanup
version: 1.0.1
implementation: .claude/scripts/branch-cleanup.sh
replaces: [git-sweep, merge-all]
```
