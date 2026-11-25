# T1: the gate

**Goal.** Every probe becomes a pinned row before any `src/` change, so T2 and T3 go red then green against it.

**Write-set:** `tests/fixtures/actor-line-routing/*.{puml,svg}`, `tests/oracle/svg-conformance/actor-line-routing.authored.test.ts`.
**Read-set:** `tests/oracle/svg-conformance/object-colour-refusal.authored.test.ts` (whole file: the template),
`plans/actor-line-routing/measurements/plan-baseline.txt`, `decisions.md#d7-what-conformant-means-for-an-error-row`.

## Steps

1. Copy each `measurements/probes/alr-*.puml` to `tests/fixtures/actor-line-routing/`, with its `jar/alr-*.svg` beside it
   (the layout `measure.mts` and the template read). Copy; never re-render a jar `.svg`.
2. Write the gate from the template. Row lists:
   - `ZERO`: the 12 rows at 0 today (controls and guards, README table).
   - `ERROR_PAGE`: none yet. The 6 jar-error rows go to `OPEN` with the jar's `{ label, line, welcome }` from
     `measurements/jar-error-check.txt`. Assert D7 items 1 to 4 only once ours is an error page: today ours draws, so
     hold them on `maxDiffs` alone with reason `T2` (`alr-unknown-bare`: the ruling, held as drawn per D7).
   - `OPEN`: every other row, `maxDiffs` at today's number, reason `T2` or `T3` per the README table.
3. Run the gate and read the count. Then run the measurer on `tests/fixtures/actor-line-routing` and check that it prints
   the baseline's numbers.

## Acceptance
- Given the base `src/`, when the gate runs, then every row passes and the count equals the row lists' total (44 +
  any push-forward probe).
- Given `alr-unknown-bare`, then the gate asserts it is not an error page and contains `fill="#D3D3D3"`.
- Given a ZERO row, then the gate asserts 0 diffs and 0 comment mismatches.

Observability: N/A. Rollback: Reversible.
