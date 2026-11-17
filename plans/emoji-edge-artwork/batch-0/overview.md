# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/emoji-edge-artwork/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/emoji-edge-artwork
git commit -m "docs(eea): add the emoji-edge-artwork brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx tsx plans/emoji-edge-artwork/measurements/measure-eea.mts /tmp/eea-t0.json
```

The measurer must print `rows 9 zero 1 open 8 error 0`, with the per-row numbers in the README table. If it differs,
journal the live numbers and the rows that moved, and carry on with them.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T2: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/eea-base-dts/`.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning, so this is
their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the measurer runs, then it reports the README's numbers, or the journal says why not.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
