# Batch 0 — brief, baseline, authored rows

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the baseline, add and pin the 131 authored rows | orchestrator | this brief, `tests/fixtures/diagram-style-scope/`, `oracle/goldens/diagram-style-scope.json` | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/style-mode-cascades/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/style-mode-cascades
git commit -m "docs(smc): add the style-mode-cascades brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/smc-b0
git show <base>:tests/oracle/svg-conformance/parity-activity.json > /tmp/smc-b0/parity-activity.json
git show <base>:tests/oracle/svg-conformance/parity-class.json > /tmp/smc-b0/parity-class.json
git show <base>:tests/oracle/svg-conformance/parity-component.json > /tmp/smc-b0/parity-component.json
git show <base>:tests/oracle/svg-conformance/parity-object.json > /tmp/smc-b0/parity-object.json
git show <base>:tests/oracle/svg-conformance/parity-sequence.json > /tmp/smc-b0/parity-sequence.json
git show <base>:tests/oracle/svg-conformance/parity-state.json > /tmp/smc-b0/parity-state.json
git show <base>:tests/oracle/svg-conformance/parity-usecase.json > /tmp/smc-b0/parity-usecase.json
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/smc-b0/parity-unknown.json
node plans/style-mode-cascades/measurements/gen-rows.mjs /tmp/smc-b0/rows
scripts/oracle-render.sh /tmp/smc-b0/rows /tmp/smc-b0/rows/*.puml
cp /tmp/smc-b0/rows/*.puml /tmp/smc-b0/rows/*.svg tests/fixtures/diagram-style-scope/
```

Generate and render in `/tmp`, never in the fixture dir: a glob there would re-render the 865 existing dss oracles,
whose bytes are the pin's reference. `git status` must show only new `.puml`/`.svg` pairs, no modified `.svg` and no
`svek-*.dot`.

Then:

1. `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/smc-b0/rows.json`.
   Compare with the planning measurement, `measurements/planning-rows.json` (taken on `47346297c`): `rows` is
   865 + 131 = 996, the new rows' open count is 78, and every dss row is at or under its pin. Journal any authored
   row whose count differs from planning.
2. Add a pin row for each new fixture at its measured count. Lower `component__probe-skin-rose` from 13 to its
   measured 1. Raise no row. Run `tests/oracle/svg-conformance/diagram-style-scope.ratchet.test.ts` and time it
   before and after; journal both times (operational readiness, "Scale").
3. Comment on #121: `gigefo-15-cami497` (reverse-colour root background) and `finadu-74-duvi890` (`!theme` cascade)
   move to #120 by D1.
4. Commit `test(smc): add the authored mode, malformed and cascade rows`.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then the brief commit and the rows
  commit sit on `<base>`, and journal row 1 holds the start time.
- Given `rows.mts`, then it prints `rows 996`. The 131 new rows carry their measured counts, 78 of them non-zero,
  and the dss ratchet passes.
- Given `git diff <base> --stat -- tests/fixtures/diagram-style-scope`, then every changed path is a new file.

Observability: N/A — no new observable operations. Rollback: Reversible.
