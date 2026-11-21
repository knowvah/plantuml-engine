# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, measure the docs baseline | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/playground-stdlib/
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/playground-stdlib
git commit -m "docs(ps): add the playground-stdlib brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

Then measure the before-state, for T4's chunk comparison:

1. `npm run build:stdlib`. Journal its wall time; T4 cites it.
2. `npm run docs:build`. List `docs-site/.vitepress/dist/assets/*.js` sorted by size. Journal the playground page's
   chunk names and sizes, and the total `dist/` size (`du -sh`).
3. Snapshot `dist/*.d.ts` to `/tmp/ps-base-dts/` after `npm run build`. T6 diffs against it (stop 1).

Batch 0 closes with the README gates. At planning, `npm test`, `typecheck` and `lint` were run on `c41b639ca`
(journal row 0). `build`, `format:check`, `test:e2e` and `docs:build` were not, so this is their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when `docs:build` runs, then the journal holds the entry-chunk sizes T4 compares against.

Observability is N/A. Rollback is Reversible.
