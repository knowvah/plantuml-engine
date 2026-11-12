# T2c: residuals

**Writes:** `src/core/klimt/sprite/**`, and a shared module where a residual's mechanism lives (journal why, with the
Java quote). Tests beside each fix.

**Read:** the T2b journal rows, the Java behind each first diff, `decisions.md` D4, D8, D9.

**Do:** one sub-task (`T2c1`, `T2c2`, ...) per diff family from T2b. For each:
1. Read the Java that produces the jar's value and quote it in the journal before changing code.
2. Fix at the origin. Never fit a value.
3. Re-run `fixtures.mts` for the family and for every `cov-sprites-*` slug (a fix can reveal a hidden diff) and
   `corpus-rows.mts`.
4. A row that cannot end at zero ends by D9: an error pair, a `DIVERGENCES.md` entry with its forcing library, or a
   `needs-ruling` issue (`gh issue create --label needs-ruling`, body naming the fixture, the jar's value, ours and the
   Java). If `gh` is denied, put the issue text in `.agent-notes/lsp-T2c.md`.

Likely families, not yet measured: sprite kinds where D4's mapping does not hold; the creole name block; chrome
placement around a `HELP` page; the two stdlib corpus rows (48×48 `/16z` sprites).

## Acceptance
- Given `fixtures.mts` over every `cov-sprites-*` slug, then each row is zero or an error pair, or its D9 end is in the
  journal.
- Given `corpus-rows.mts`, then both rows are zero-diff, or the remaining mechanism is journaled with its D9 end.
- Given the batch-2 close survey, then `verdict-diff.mjs <base>` reports 0 lost.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
