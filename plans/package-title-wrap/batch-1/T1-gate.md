# T1: the authored gate (D4)

## Context

The probes live in `plans/package-title-wrap/measurements/probes/` (`<slug>.puml`, jar svg at `jar/<slug>.svg`). The
gate must hold them in `tests/` so that `npm test` ratchets them. `hidden-note-host.authored.test.ts` is the shape to
copy; drop nothing it checks (row set on disk = ZERO ∪ OPEN, disjoint; ZERO rows 0 diffs and 0 comment mismatch; OPEN
rows never above their bar).

## Write-set

- Create `tests/fixtures/package-title-wrap/<slug>.puml` and `<slug>.svg` for all 17 rows (copy; the svg beside the
  puml, not under `jar/`).
- Create `tests/oracle/svg-conformance/package-title-wrap.authored.test.ts`.

## Read-set

- `tests/oracle/svg-conformance/hidden-note-host.authored.test.ts` (whole file, 236 lines).
- `plans/package-title-wrap/measurements/plan-baseline.txt`.

## Steps

1. Copy the fixtures. Run `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/package-title-wrap`
   and confirm the same 17 rows and numbers as the plan baseline.
2. Write the gate. The module doc comment states the three upstream reads (README "Objective") with `file:line`.
   - `ZERO`: the five controls (`ptw-as-label-skinparam`, `ptw-control-cluster`, `ptw-control-nowrap`,
     `ptw-node-group`, `ptw-upstream-3018`), each group with a dated comment saying why it is a control.
   - `OPEN`: the other 12 at today's `maxDiffs` (comments are 0 everywhere today), each with a `reason` naming
     `#219` and the owning task and mechanism, e.g. `'#219 T2a (M1): the title never wraps'`.
3. Run the gate alone and read the count: 17 row tests + the 2 manifest tests (rows = files on disk; every OPEN reason names an issue) must pass.

## Acceptance (Given/When/Then)

- Given the fixtures, when the gate runs on the T0 tree, then every row passes and the test count is 19 (17 rows plus the two
  manifest tests).
- Given a fixture added on disk but in neither list, when the gate runs, then the manifest test fails naming it.
- Given an OPEN row whose diffs rise by one, when the gate runs, then that row fails with its first diff.

## Interface contract (consumed by T2a, T2b, T2c)

`ZERO: readonly string[]` and `OPEN: Readonly<Record<string, { maxDiffs: number; maxComments: number; reason: string
}>>` in the gate file. Every later task edits only these two literals (and comments).

Observability N/A. Rollback Reversible.
