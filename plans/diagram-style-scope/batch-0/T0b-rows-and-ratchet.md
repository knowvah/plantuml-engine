# T0b — authored rows, ratchet

Agent: typescript-pro (sonnet, effort high), worktree `dss-T0b`. Include [../task-contract.md](../task-contract.md).
Commit: `test(oracle): diagram style scope rows and ratchet (T0b)`.

## Context
No corpus row of a ported engine depends on these defects, so the rows are the gate. This task
authors them, renders their oracles and adds the gate every later task moves. It changes NO `src/` file.

## Task
1. `python3 plans/diagram-style-scope/tools/gen-rows.py tests/fixtures/diagram-style-scope` (256 `.puml`; do not hand-edit).
2. Render through `scripts/oracle-render.sh <ABSOLUTE tmp dir> <pumls>`; copy each `.svg` beside its `.puml`
   unmodified (`cmp` it). A row whose jar render is an error page is kept when that is the jar's real answer;
   list them (`sequence__scope-malformed-brace` is one; `hcl` is deliberately absent).
3. `tests/oracle/svg-conformance/diagram-style-scope.ts` ([interface](overview.md#interface-t0b--later-batches)) and
   `diagram-style-scope.ratchet.test.ts`, modelled on `document-background.{ts,ratchet.test.ts}`: every `.puml` with a
   `.svg` has exactly one pin row; every row names files on disk; `diffCount` shrink-only; a conformant row stays
   conformant. Reuse that module's helpers rather than copying them; a needed signature change there is in your write-set.
4. Seed `oracle/goldens/diagram-style-scope.json` from the CURRENT code (pre-fix values).
5. `plans/diagram-style-scope/tools/diff-row.mts <row> | --all [--json <out>]` printing diff count, conformant, first 10 diffs.
6. Unit-test the module (`tests/unit/oracle/diagram-style-scope.test.ts`): row listing, a missing-fixture failure, the shrink-only check.

## Write-set
`tests/fixtures/diagram-style-scope/*`, `tests/oracle/svg-conformance/diagram-style-scope.ts`,
`tests/oracle/svg-conformance/diagram-style-scope.ratchet.test.ts`, `tests/oracle/svg-conformance/document-background.ts`
(export or parameterise helpers only, its rows must measure the same), `tests/unit/oracle/diagram-style-scope.test.ts`,
`oracle/goldens/diagram-style-scope.json`, `plans/diagram-style-scope/tools/diff-row.mts`.

## Read-set
`tests/oracle/svg-conformance/document-background.ts`, `tests/oracle/svg-conformance/document-background.ratchet.test.ts`,
`plans/document-background-paint/tools/diff-row.mts`, `scripts/oracle-render.sh:1-20`, [../fixtures.md](../fixtures.md).

## Acceptance
- Given each new `.puml`, when re-rendered through `scripts/oracle-render.sh`, then `cmp` against the committed `.svg` is identical.
- Given today's code, then the ratchet passes with `sequence__selector-own-doc` and `sequence__variant-gradient` pinned non-conformant.
- Given `gantt`, `mindmap`, `salt`, `wbs` `selector` rows, then the hand-back reports their verdicts (expected conformant).
- Given a pin row whose fixture is missing, then the unit test asserts the gate fails naming it.

Observability: N/A. Rollback: Reversible.
