# T2b: residuals

Split into T2b1, T2b2, … with one diff family each. Name each in the journal.

**Known at planning:** `cov-listfonts-tab` (`listfonts<TAB>X`) is 19 diffs, first `svg/g[1]/text[18]/@textLength
345.975 vs 371.25`. Both sides draw an error page, but the body lines differ, so it is not an error pair. The mechanism
is not yet known. Do not guess it:
- read how the jar's error page prints a tab in the listing (`error/PSystemError.java`, the listing lines);
- read how our `error-text.ts` prints one;
- then instrument.

This may be a shared error-page defect. If so, fix it at its origin and survey every engine.

**Writes:** whatever each mechanism's origin is, with the Java quote.

**Do:** for each open fixture after T2a, read the Java, state the mechanism with `file:line`, fix it, re-measure the
whole family (step 6 of the contract), and journal it. A fixture that needs a ruling goes on a `needs-ruling` issue
(D9).

## Acceptance
- Given `fixtures.mts` over this mission's slugs, then no row is open except the `cov-listfont*` drawn pages (#169) and
  any row on a `needs-ruling` issue.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert each sub-task's commit.
