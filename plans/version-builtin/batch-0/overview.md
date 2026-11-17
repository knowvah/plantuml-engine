# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/version-builtin/ and .agent-notes/vb-plan.md
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/version-builtin .agent-notes/vb-plan.md
git commit -m "docs(vb): add the version-builtin brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

Read the `rekefe-90-baju604` record in `tests/oracle/svg-conformance/parity-activity.json` and its
`diff-baseline.json` row; journal both if they differ from the README's starting state.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T2: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/vb-base-dts/`.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when `npm run build` runs, then `/tmp/vb-base-dts/` holds every `dist/*.d.ts`.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
