# Squash — one commit per batch (jff procedure)

Agent: orchestrator. Runs last, after the exit batch is committed and its
gates are green. Never rebase or cherry-pick to squash; build each batch
commit from the tree its close produced (`plans/json-family-followons/batch-squash/overview.md`
is the procedure this copies; in zsh split the map with explicit `read`, and
verify every sha is 40 hex characters).

## Steps
0. **Record, then freeze.** Write `<batch> <close sha> <tree sha>` per close
   (b0, b1, b2, exit) to `$M/squash-map.txt`, journal the tag `dbp/pre-squash`
   and the map, tick the squash batch in `README.md`, commit `docs(dbp): squash map`.
   That commit's tree is the target tree.
1. `git tag dbp/pre-squash HEAD` (local, never pushed).
2. Re-read the map; the last entry's tree must equal `HEAD^{tree}`.
3. Build the chain with `git commit-tree <close-tree> -p <prev> -F <msg-file>`,
   first parent `git merge-base main dbp/pre-squash` (must be `fe794c0a9`; if
   main was merged into the branch, stop and ask). Unsigned. One commit per
   batch plus `docs(dbp): close out` kept separate.
4. Messages: Conventional Commits, e.g. `fix(core): dbp batch 2 — document
   background through the SvgGraphics branches`; body lists the tasks, the dbg rows
   before → after, `Refs: dbp/pre-squash <first>..<last>`.
   Subjects ≤ 72, lines ≤ 80; no attribution.
5. Verify: every new commit's tree equals its recorded close tree; the final
   tree equals `dbp/pre-squash^{tree}`; `git rev-list --count fe794c0a9..<new tip>`
   = batches + 2 with 0 merges. Any mismatch: stop, branch unmoved.
6. `git update-ref refs/heads/feat/document-background-paint <new tip> dbp/pre-squash`
   (compare-and-swap), then `git reset --hard HEAD`.
7. Hand-off: give the user `git rebase --force-rebase -S fe794c0a9`; expect `G`
   on every line of `git log --format='%G? %h %s' fe794c0a9..`; they push and open
   the PR. Say that every hash the brief or journal cites resolves only through
   `dbp/pre-squash`.

## Write-set
`refs/heads/feat/document-background-paint`, tag `dbp/pre-squash`; step 0 only:
`$M/squash-map.txt`, `decision-journal.md`, `README.md`.

## Acceptance
- Given the new branch, then `git rev-list --count fe794c0a9..HEAD` is batches + 2 and contains no merges.
- Given each new commit, then its tree equals its batch's close tree; the final tree equals `dbp/pre-squash^{tree}`.

Observability: N/A. Rollback: Reversible — `git update-ref` the branch back to `dbp/pre-squash`.
