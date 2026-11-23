# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/embedded-diagram-preprocess/ and .agent-notes/edp-plan.md
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/embedded-diagram-preprocess .agent-notes/edp-plan.md
git commit -m "docs(edp): add the embedded-diagram-preprocess brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
```

Read both rows' records in `tests/oracle/svg-conformance/parity-class.json` and confirm that neither slug is in
`oracle/goldens/svg-class/ratchet.json`. Journal anything that differs from the README's starting state.

Confirm the pin still contains the fix: `git -C ~/git/plantuml merge-base --is-ancestor 58b9b3d53ee
$(node -p "require('./oracle/pin.json').upstreamSha")` exits 0. If it does not, D1 is contradicted (stop 4).

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T2: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/edp-base-dts/`.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when `npm run build` runs, then `/tmp/edp-base-dts/` holds every `dist/*.d.ts`.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
