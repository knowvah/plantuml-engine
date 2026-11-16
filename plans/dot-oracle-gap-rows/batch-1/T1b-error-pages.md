# T1b: pin the 8 error pages

**Rows:** `comment-stripping`, `rankdir-lr-pipeline`, `style-combined-node-edge`, `style-diagram-background`,
`style-edge-color`, `style-node-background`, `style-node-border`, `title-only`. Each is
`Syntax Error? (Assumed diagram type: dot)` at line 2 in `oracle/goldens/stock-error-pages.json`. **Why:** D3.

## Steps

1. Read the precedent: `tests/oracle/svg-conformance/board.diff-baseline.ratchet.test.ts:10-13` and `:88-131`, and
   the chart, bpm and flow versions of the same `jarError` shape test. Read `scripts/lib/survey-error-verdict.ts`
   for how the survey knows we drew our own error page (`setErrorPageObserver`).
2. Confirm why the jar errors, from the Java: what `PSystemDotFactory` accepts at line 2 of each source
   (`net/sourceforge/plantuml/directdot/PSystemDotFactory.java`). Quote it in the journal. We already error on all 8,
   so no `src/` change is expected. If we turn out not to error on one, that row is not conformant: stop and journal.
3. **Red:** in the dot ratchet test,
   - split AC1 so the zero-diff test runs on entries without `jarError`;
   - add, for entries with `jarError`: the weighted score never rises; `jarError` has the `{ line, message }` shape and
     its message is in the golden; error parity (the golden has no `id="graph0"`, and ours is our error page);
   - restrict the passthrough-contract block to entries without `jarError`;
   - raise the corpus count from 52 to 60.
   Run it and see it fail.
4. Extend the pin tool with a `jarError` path, with its test first: it copies `dot/<slug>` from
   `stock-error-pages.json` into the entry, measures `weightedScore` and `diffCount` on the ratchet path, and clones
   the `jar-error` routing twin and the `weErrored: true` refusal twin as they are. It refuses a row whose golden has
   `id="graph0"`.
5. Pin the 8: `npx jiti plans/dot-oracle-gap-rows/tools/pin-goldens.mts dogr-T1b T1b <the 8 slugs>` (with whatever flag
   step 4 adds).
6. Run the three tests in task contract step 6. Update the running counts (+8 each), including `pinnedJarErrors`
   (162 at planning) and the refusal suite's `pinnedErroring`, with dated `dogr/T1b` comment lines.
7. Add the error-page rule to `svg-dot/README.md`'s "Add rule".

## Acceptance
- Given `ratchet.json` after T1b, then 8 entries carry `jarError` equal to their `stock-error-pages.json` record and a
  `weightedScore`, and no entry without `jarError` has a nonzero score.
- Given the dot ratchet test, then all of its cases pass, the corpus count reads 60, and an in-memory edit that makes
  ours draw a diagram for an error row fails error parity.
- Given the routing and refusal tests, then both pass with the new counts.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
