# Batch 0: brief, baseline

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the start, re-measure the rows, snapshot the d.ts | orchestrator | this brief | none | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/license-page/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree --get commit.gpgsign   # must print false; if not, set it
git add plans/license-page
git commit -m "docs(lic): add the license-page brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
npx vitest run tests/unit/version tests/oracle/svg-conformance/utility.diff-baseline.ratchet.test.ts
```

Both must pass on the base. Journal the test counts. Read the three license rows in
`oracle/goldens/svg-utility/authored-baseline.json` and journal their `diffCount`/`weightedScore` (87 / 145 at
planning); a different value is a finding to journal before T1 changes anything.

The every-engine baseline is the committed `tests/oracle/svg-conformance/parity-*.json` at `<base>`.
`verdict-diff.mjs` reads it from the ref, so T0 needs no survey. Snapshot the d.ts for T3: run `npm run build`, then
copy `dist/*.d.ts` to `/tmp/lic-base-dts/`.

Batch 0 closes with the README gates. `typecheck`, `build` and `format:check` were not run at planning (test and lint
were), so this is their first run on the base.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then `git log -1` is the brief commit and
  journal row 1 holds the start time.
- Given the base tree, when the version tests and the authored ratchet run, then both pass and the journal holds
  their counts and the three license rows' numbers.

Observability is N/A: there are no new observable operations. Rollback is Reversible (revert the brief commit).
