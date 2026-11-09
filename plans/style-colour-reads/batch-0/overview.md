# Batch 0 — brief, baseline, authored rows

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the baseline, add and pin the 100 authored rows | orchestrator | this brief, `tests/fixtures/diagram-style-scope/`, `oracle/goldens/diagram-style-scope.json` | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/style-colour-reads/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/style-colour-reads
git commit -m "docs(scr): add the style-colour-reads brief"
node -p "new Date().toISOString()"   # journal row 1: the mission start
mkdir -p /tmp/scr-b0
git show <base>:tests/oracle/svg-conformance/parity-component.json > /tmp/scr-b0/parity-component.json
git show <base>:tests/oracle/svg-conformance/parity-state.json > /tmp/scr-b0/parity-state.json
git show <base>:tests/oracle/svg-conformance/parity-sequence.json > /tmp/scr-b0/parity-sequence.json
git show <base>:tests/oracle/svg-conformance/parity-class.json > /tmp/scr-b0/parity-class.json
git show <base>:tests/oracle/svg-conformance/parity-usecase.json > /tmp/scr-b0/parity-usecase.json
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/scr-b0/parity-unknown.json
node plans/style-colour-reads/measurements/gen-rows.mjs /tmp/scr-b0/rows
scripts/oracle-render.sh /tmp/scr-b0/rows /tmp/scr-b0/rows/*.puml
cp /tmp/scr-b0/rows/*.puml /tmp/scr-b0/rows/*.svg tests/fixtures/diagram-style-scope/
```

Generate and render in `/tmp`, never in the fixture dir: a glob there would re-render the 1,072 existing dss oracles,
whose bytes are the pin's reference. `git status` must show only new `.puml`/`.svg` pairs, no modified `.svg` and no
`svek-*.dot`.

Then:

1. `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/scr-b0/rows.json`.
   Compare with the planning measurement, `measurements/planning-rows.json` (taken on `8fe32c695`): `rows` is
   1,072 + 100 = 1,172, the new rows' open count is 15, and every dss row is at or under its pin. Journal any authored
   row whose count differs from planning.
2. Add a pin row for each new fixture at its measured count. Raise no row. Run
   `tests/oracle/svg-conformance/diagram-style-scope.ratchet.test.ts` and time it before and after; journal both times
   (operational readiness, "Scale").
3. Commit `test(scr): add the authored colour-read rows`.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then the brief commit and the rows
  commit sit on `<base>`, and journal row 1 holds the start time.
- Given `rows.mts`, then it prints `rows 1172`. The 100 new rows carry their measured counts, 15 of them non-zero,
  and the dss ratchet passes.
- Given `git diff <base> --stat -- tests/fixtures/diagram-style-scope`, then every changed path is a new file.

Observability: N/A — no new observable operations. Rollback: Reversible.
