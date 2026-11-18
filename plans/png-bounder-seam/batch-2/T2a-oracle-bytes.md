# T2a — write the seam-5 oracle bytes

**Read first:** `.claude/memory/recapture-reference-jar-order.md`, `measurements/t1b-summary.md` (the noise list).

## Steps

1. With the **reference** jar still in `oracle/dist` (md5 `7066a3b4…`), run this alone:
   `node plans/png-bounder-seam/measurements/recapture.mjs -- --write --workers 6 --jar /tmp/pbs-jar/plantuml-seam5.jar
   --only '<every T1b rollback and wire-print target, comma-separated>' --report /tmp/pbs-T2a/report.json`.
   - The wrapper sets `PLANTUML_FORK=/tmp/plantuml-seam5`, so the drift guard sees five seam commits.
   - Restricting `--only` to T1b's movers keeps jar-noise rows unwritten (D7).
2. Check that the CHANGED set equals T1b's `rollback` and `wire-print` set exactly. A difference is stop 1.
3. Re-capture by hand every multi-page `_NNN.svg` page T1b listed, with `render-seam5.mjs`.
4. Adopt the jar: `cp /tmp/pbs-jar/plantuml-seam5.jar oracle/dist/plantuml-oracle.jar`. Journal the new md5.
   - `oracle/dist` is gitignored. The jar is the user's working instrument, and the exit comment says how to rebuild it.
5. Run `npm test` once and journal the failing test names: wire `print` goldens and fixtures, `svg-factories`,
   `rollback.test.ts`, and anything else.
   - Each must be a test over a T1b mover. Any other failure means the oracle write touched something it should not
     have: stop 1.
6. Commit `test(oracle): re-capture the PNG-bounder rows under seam #5` (`Refs: #170`), red by design (D6).

## Acceptance

- Given T1b's movers, when `--write` runs, then exactly those targets change on disk, plus their `_NNN` pages.
- Given `oracle/dist/plantuml-oracle.jar` after T2a, then its md5 is the seam-5 jar's.
- Given `npm test`, then every failure is a test over a T1b mover.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit; restore the reference jar from
`/tmp/pbs-jar/reference-before-build.jar`).
