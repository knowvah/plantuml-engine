# T1b — only PNG-bounder rows move (D7)

**Read first:** `scripts/recapture-oracles.ts` (header), `scripts/lib/recapture-classify.ts`,
`.claude/memory/recapture-reference-jar-order.md`, `.claude/memory/jar-identity-hash-nondeterminism.md`.

## Steps

1. **Chunk the run.** The queue session is headless: it stops background work about 10 minutes after a turn ends, and a
   foreground Bash call is capped at 600 s. Run the re-capture in `--only` chunks, each one a foreground call that
   finishes in under about 9 minutes, at `uptime` below about 10, alone:
   `node plans/png-bounder-seam/measurements/recapture.mjs -- --verify --workers 6 --jar /tmp/pbs-jar/plantuml-seam5.jar
   --only '<glob>' --report /tmp/pbs-T1b/report-<chunk>.json`.
   - The manifest was **16,783 targets** at planning: dot-cache 5,948 (sequence 1,248, unknown 1,048, activity 878,
     class 874), `oracle/goldens/**` 6,814 and `tests/fixtures/**` 4,021. At about 2 s per JVM and 6 workers, that is
     roughly 90 minutes in total.
   - Time the first chunk (`…/unknown/**`, which holds every #170 row) and size the rest from it, splitting
     `oracle/goldens/**` and `tests/fixtures/**` by subdirectory.
   - Before running, prove the chunk list covers the manifest exactly once:
     `npx jiti plans/png-bounder-seam/measurements/manifest-count.mts '<glob>' ...` exits 0 only then. Journal the
     list.
   - Multi-page `<name>_NNN.svg` pages are not in the manifest: list every `_NNN.svg` beside a `<name>.puml` whose source
     has `<math>`, `<latex>` or a wire `print`, and check those by hand.
2. Run `node plans/png-bounder-seam/measurements/classify-movers.mjs /tmp/pbs-T1b/report-*.json --json
   /tmp/pbs-T1b/movers.json`. It concatenates the chunk reports.
3. For each `unexpected` CHANGED row, re-render it 3 times with the reference jar: `--jar
   oracle/dist/plantuml-oracle.jar --only '<target>'`.
   - If the reference is not SAME each time, the row is jar noise: journal it, and add it to an exclusion list that T2a
     passes to `--write` by omission (`--only` the rest).
   - If a stable `unexpected` mover remains, that is stop 1.
4. For a sample of each class, diff the committed svg against a seam-5 render, to show that the movement is what the
   PNG bounder sizes. Render with `node plans/png-bounder-seam/measurements/render-seam5.mjs /tmp/pbs-T1b/render <puml...>`,
   which keeps its output; `--verify` deletes its own. The sample is every #170 row (no authored fixture has a creole
   rollback, see README), the wire corpus row with `print`, and 3 wire fixtures.
   - Rollback rows: element positions and the canvas size may move. No `<image>` payload and no text content may move
     (`AtomMath#drawU` still draws the SVG export, `AtomMath.java:88-90`).
   - Wire rows: the `y` after each `print`.
   - Anything else moving is stop 1.
5. Save the chunk reports' non-SAME rows and `movers.json` as `measurements/t1b-report.json` and `measurements/t1b-movers.json`, and write
   `measurements/t1b-summary.md`: counts per class, the noise list, and the sample diffs, one line each.
6. Commit `test(pbs): record the seam #5 re-capture verification` (`Refs: #170`).

## Acceptance

- Given the full manifest, when classified, then every CHANGED row is `rollback`, `wire-print`, or proven jar noise, and
  no row FAILED.
- Given each #170 row, then it is CHANGED and classed `rollback`.
- Given the wire corpus row with `print`, then it is CHANGED and classed `wire-print`.
- Given the sample diffs, then only positions and canvas size move: no `<image>` payload and no text content.

Observability: N/A, no new observable operations. Rollback: Reversible (revert the commit).
