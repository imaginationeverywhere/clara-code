When this command is invoked, IMMEDIATELY execute the following:

Run the branch cleanup script on the current repo:

```bash
bash .claude/scripts/branch-cleanup.sh
```

If the script does not exist at that path, execute these steps manually in order:

1. `git fetch --all --prune`
2. `git worktree prune -v` and delete any dangling `worktree-agent-*` branches
3. `git checkout develop && git pull origin develop`
4. For every `origin/*` branch EXCEPT `main` and `develop`:
   - `git merge --no-ff origin/<branch> -m "chore: merge <branch> into develop"`
   - If conflict: `git merge --abort`, skip that branch, continue to next
5. `git push origin develop`
6. Delete every LOCAL branch except `main` and `develop` (skip conflict branches)
7. Delete every REMOTE branch on origin except `main` and `develop` (skip conflict branches)
8. Print a summary: how many merged, how many conflicts, how many deleted local, how many deleted remote
9. If any branches had conflicts, list them at the end

**PRESERVED (never touched):** `main`, `develop`
**CONFLICT BRANCHES:** kept on local and remote so user can resolve manually

After completion, only `main` and `develop` should remain.
