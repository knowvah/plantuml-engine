# T1: the 43 rows

**Why:** #138's done-when list pins both orders of each key in `oracle/goldens/diagram-style-scope.json`. Landing the
rows first, at today's counts, makes T2 a pure shrink that the ratchet verifies (D5).

**Read-set:** `plans/partition-skinparam-order/probes/*.puml`, `/tmp/pso-plan/fx/*.svg`,
`tests/oracle/svg-conformance/diagram-style-scope{,.ratchet.test}.ts`.

**Write-set:** `tests/fixtures/diagram-style-scope/{activity,component,class}__frameorder-*.{puml,svg}` (86 files),
`oracle/goldens/diagram-style-scope.json`.

## Steps

1. Render fresh oracles from the committed probes:
   `scripts/oracle-render.sh /tmp/pso-T1/r1 <abs>/plans/partition-skinparam-order/probes/*.puml`. Render them again
   into `/tmp/pso-T1/r2`, and `cmp` every pair. Any difference is stop 6.
2. Copy each probe `.puml` and its r1 `.svg` into `tests/fixtures/diagram-style-scope/`. Never edit an oracle.
3. Measure, alone:
   `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/pso-T1/rows.json activity__frameorder- component__frameorder- class__frameorder-`.
   It must print `rows 43 open 14`, matching the README's table row by row. Journal any difference, with its first
   diff, before going on.
4. Pin: `node plans/partition-skinparam-order/measurements/pin-rows.mjs /tmp/pso-T1/rows.json --partial`. It must
   print 43 `add` lines and exit 0.
5. Run the ratchet:
   `npx vitest run tests/oracle/svg-conformance/diagram-style-scope.ratchet.test.ts`. Read the count: it must collect
   the 1172 earlier rows plus 43.
6. Commit `test(activity): pin frame skinparam order rows` with the footer `Refs: #138`.

## Acceptance
- Given the 86 new files, when the ratchet runs, then it passes, and the pin holds 43 `__frameorder-` rows, 29
  conformant.
- Given two jar renders of every probe, then every pair is byte-identical.
- Given `pin-rows.mjs`, then no existing row changed (`git diff` touches only added keys).

Observability is N/A: there are no new observable operations. Rollback is Reversible.
