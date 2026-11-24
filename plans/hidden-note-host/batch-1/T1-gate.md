# T1: the gate

**Goal:** the authored gate holds every probe at today's numbers, rendered the way the survey renders a row (D4, D5).
After T1, a change in batch 2 shows as a number change on a named row.

## Steps

1. Copy each `plans/hidden-note-host/measurements/probes/<slug>.puml` to `tests/fixtures/hidden-note-host/`, and its
   `probes/jar/<slug>.svg` beside it as `<slug>.svg`. Re-render the oracles in place with
   `scripts/oracle-render.sh "$PWD/tests/fixtures/hidden-note-host" tests/fixtures/hidden-note-host/*.puml`, then
   check that the copied svgs did not change (`diff -r` against the probes; the oracle is deterministic). Delete every
   `svek-N.dot`.
2. Create `tests/oracle/svg-conformance/hidden-note-host.authored.test.ts`:
   - The doc comment states the rule (`CucaDiagram.java:778-853`, `SvekResult.java:82-101`), the render options, and
     what ZERO and OPEN mean (D4).
   - `beforeAll`: `elk = await prepareElkOnce()` (`render-fixture-class.ts:209`).
   - Render each row as `measurements/measure.mts` does: `renderSync` + `withJarCompatibleStyleInput({ measurer: new
     DeterministicMeasurer(), assetStore, includeStore: fixtureIncludeStore(), filename: 'in.puml', elk })`, with the
     asset store built once at module level, as the measurer builds it.
   - `ZERO: readonly string[]` and `OPEN: Record<string, { maxDiffs; maxComments; reason }>`. Each group gets a dated
     comment saying why (`// 2026-11-23 hnh T1: …`).
   - Tests: the manifest (rows are exactly the `.puml` files on disk, each listed once, each with its `.svg`); every
     OPEN reason matches `/#\d+|ruling 2026-08-09/`; each ZERO row has 0 diffs and `commentMismatch` 0; each OPEN row
     has diffs ≤ `maxDiffs` and mismatch ≤ `maxComments`.
   - Give the test the per-test timeout the class ratchet uses for slow rows (`CI_RENDER_BUDGET_MS`,
     `tests/helpers/ci-test-budgets.js`).
3. Pin: the planning zero rows go in `ZERO`. Every other row goes in `OPEN` at its T0 numbers, with a reason naming
   the task that owns it (README table), e.g. `#204: a note on a hidden class is drawn (T2a)`, or the I-issue number
   T0 filed.
4. `class-comment-bytes.authored.test.ts:57-58`: leave the row where it is. Change nothing there until T2a.

## Read-set
`usecase-title-style.authored.test.ts`, `class-comment-bytes.authored.test.ts`, `svg-comments.ts`,
`render-fixture-class.ts`, `measurements/measure.mts`, `/tmp/hnh-t0.json`.

## Write-set
`tests/fixtures/hidden-note-host/*.{puml,svg}`, `tests/oracle/svg-conformance/hidden-note-host.authored.test.ts`.

## Interface output (consumed by T2a, T2b, T2c)
The gate's `ZERO` list and `OPEN` map, keyed by slug, with `maxDiffs`, `maxComments` and `reason`. A task moves a
row from `OPEN` to `ZERO`, or lowers its numbers and rewrites its reason.

## Acceptance
- Given T1, when the gate runs, then it collects 50 rows plus the manifest tests, and passes.
- Given each OPEN row, then its `maxDiffs` and `maxComments` equal its `/tmp/hnh-t0.json` numbers, and its reason
  names a task or an issue number.
- Given `npm run svg:survey` and verdict-diff against `<base>`, then nothing moves.

Observability is N/A. Rollback is Reversible.
