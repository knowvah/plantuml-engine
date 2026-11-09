# Batch 0 — brief, baseline, authored rows

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T0 | Commit the brief, record the baseline, add and pin the 48 authored rows | orchestrator | this brief, `tests/fixtures/diagram-style-scope/`, `oracle/goldens/diagram-style-scope.json`, `tests/unit/oracle/diagram-style-scope.test.ts` | — | [x] |

## T0

`<base>` is the mission base sha named in the execution prompt.

```sh
git status --porcelain   # only plans/activity-authored-rows/ may appear
git branch --show-current   # must print feature/parity-queue
git config --worktree commit.gpgsign false
git add plans/activity-authored-rows
git commit -m "docs(aar): add the activity-authored-rows brief"
node -p "new Date().toISOString()"   # journal row 2: the mission start
mkdir -p /tmp/aar-b0
git show <base>:tests/oracle/svg-conformance/parity-activity.json > /tmp/aar-b0/parity-activity.json
git show <base>:tests/oracle/svg-conformance/parity-unknown.json > /tmp/aar-b0/parity-unknown.json
git show <base>:tests/oracle/svg-conformance/parity-class.json > /tmp/aar-b0/parity-class.json
git show <base>:tests/oracle/svg-conformance/parity-sequence.json > /tmp/aar-b0/parity-sequence.json
git show <base>:tests/oracle/svg-conformance/parity-state.json > /tmp/aar-b0/parity-state.json
git show <base>:tests/oracle/svg-conformance/parity-component.json > /tmp/aar-b0/parity-component.json
node plans/activity-authored-rows/measurements/gen-rows.mjs /tmp/aar-b0/rows
scripts/oracle-render.sh /tmp/aar-b0/rows /tmp/aar-b0/rows/*.puml
cp /tmp/aar-b0/rows/*.puml /tmp/aar-b0/rows/*.svg tests/fixtures/diagram-style-scope/
```

Generate and render in `/tmp`, never in the fixture dir: a glob there would re-render the 996 existing dss oracles,
whose bytes are the pin's reference. `git status` must show only new `.puml`/`.svg` pairs, no modified `.svg` and no
`svek-*.dot`.

Then:

1. `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/aar-b0/rows.json`.
   `rows` is 996 + 48 = 1044. Compare the new rows with `measurements/planning-authored.json`: all 48 open at
   planning. Journal any row whose count differs.
2. `node plans/style-mode-cascades/measurements/stock-check.mjs tests/fixtures/diagram-style-scope/activity__long3-oneline-colour.puml`.
   The oracle draws an error page. If the stock jar errors too, and ours already draws our error page, flag the row
   `stockError: true` (D4); otherwise pin it raw and journal the verdict for T1b.
3. Add a pin row for each new fixture at its measured count, raise `ROW_COUNT` in
   `tests/unit/oracle/diagram-style-scope.test.ts` to 1044, and raise no other row. Time
   `tests/oracle/svg-conformance/diagram-style-scope.ratchet.test.ts` before and after; journal both.
4. `npx jiti plans/activity-authored-rows/measurements/row-diffs.mts /tmp/aar-b0/parity-activity.json /tmp/aar-b0/diffs.json`:
   `rows 268` (154 in scope plus the 114 legacy rows). Journal the in-scope total against planning's Σ 18,202.
5. Snapshot `dist/*.d.ts` after `npm run build` into `/tmp/aar-b0/dts` for D7's check.
6. Planning already commented on #121 with the brief path and D1-D10 (issuecomment-6686967329). Comment again
   only if T0's measurement changes the scope.
7. Commit `test(aar): add the authored split, merge, long3, spot and group rows`.

## Acceptance
- Given the driver has checked out `feature/parity-queue`, when T0 finishes, then the brief commit and the rows
  commit sit on `<base>`, and journal row 2 holds the start time.
- Given `rows.mts`, then it prints `rows 1044`, the 48 new rows carry their measured counts, and the dss ratchet
  passes.
- Given `git diff <base> --stat -- tests/fixtures/diagram-style-scope`, then every changed path is a new file.

Observability: N/A — no new observable operations. Rollback: Reversible.
