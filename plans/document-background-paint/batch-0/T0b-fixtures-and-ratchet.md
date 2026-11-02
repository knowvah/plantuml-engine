# T0b — authored fixtures, document-background ratchet

Agent: typescript-pro (sonnet, effort high), worktree `dbp-T0b`. Include
[../task-contract.md](../task-contract.md). Commit: `test(oracle): document
background black/gradient fixtures and ratchet (T0b)`.

## Context
The defect is a document-background paint (`SvgGraphics.java:176-192`) that
no corpus row exercises with a `<style>` gradient. This task authors the rows,
renders their jar oracles, and adds the gate every later task moves. It
changes NO `src/` file.

## Task
1. Author the rows in [../fixtures.md](../fixtures.md) "Authored rows" as
   `tests/fixtures/document-background/<engine>-<case>.puml` (`<case>` ∈
   `black`, `gradient`, plus `gradient-pipe`/`gradient-dash` for json and class,
   `skinparam-gradient` for sequence and activity). Each body minimal; the
   `<style>` block exactly `document { BackgroundColor <c> }`.
2. Render each through `scripts/oracle-render.sh <ABSOLUTE tmp dir> <puml>`;
   copy the `.svg` beside its `.puml` unmodified (`cmp` it). A row whose jar
   render is an error page is kept only if that is the jar's real answer for
   the engine; say so.
3. `tests/oracle/svg-conformance/document-background.ts` (the interface in
   [overview.md](overview.md#interface-t0b--b1-b2-exit)) and
   `document-background.ratchet.test.ts`, modelled on
   `files.authored.ratchet.test.ts`: every `.puml` with a `.svg` has exactly
   one pin row (a new fixture with no row fails naming it); every row names
   files on disk; `diffCount` shrink-only; a `conformant` row stays conformant.
   Render through `renderSync` + `withJarCompatibleStyleInput` +
   `DeterministicMeasurer` (memory `conformance-harness-mirrors-index-ts`).
4. Seed `oracle/goldens/document-background.json` from the CURRENT code
   (pre-fix values) — this task's write-set owns its creation.
5. `plans/document-background-paint/tools/diff-row.mts <row> | --all [--json <out>]`
   printing diff count, conformant, and the first 10 diffs (reuse step 3's module).
6. Unit-test the module (`tests/unit/oracle/document-background.test.ts`):
   row listing, a missing-fixture failure, the shrink-only check.

## Write-set
`tests/fixtures/document-background/*.{puml,svg}`,
`tests/oracle/svg-conformance/document-background.ts`,
`tests/oracle/svg-conformance/document-background.ratchet.test.ts`,
`tests/unit/oracle/document-background.test.ts`,
`oracle/goldens/document-background.json`,
`plans/document-background-paint/tools/diff-row.mts`.

## Read-set
`tests/oracle/svg-conformance/files.authored.ratchet.test.ts`,
`tests/oracle/svg-conformance/compare.ts` (exports only),
`src/core/internal-render-options.ts`, `scripts/oracle-render.sh:1-20`,
[../fixtures.md](../fixtures.md).

## Acceptance
- Given each new `.puml`, when re-rendered through `scripts/oracle-render.sh`, then `cmp` against the committed `.svg` is identical.
- Given today's code, then the ratchet passes and every in-scope `-gradient` row is pinned `conformant: false` (the defect is visible).
- Given gantt/wbs/files/nwdiag rows, then the hand-back reports their verdicts (a non-conformant one is stop 7 for the orchestrator — report, do not fix).
- Given a pin row whose fixture is missing, then the unit test asserts the gate fails naming it.

Observability: N/A. Rollback: Reversible.
