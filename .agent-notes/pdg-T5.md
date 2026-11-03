# pdg-T5 — findings from the note audit (2026-11-03), recorded not fixed (D6)

## Observation: object has 35 pins against 64 census zero-diff rows
- **Context**: `pins-vs-census.mjs` after the T4 census.
- **Finding**: `svg-object/ratchet.json` pins 35; `census-object.json` reads 64 rows at zero diffs. 29 conformant rows are unpinned. Issue #115 owns this.
- **Impact**: the ratchet protects fewer object rows than it could.
- **Confidence**: High.

## Observation: oracle count exceeds corpus count for files and json
- **Context**: matrix rows `files | 8 | 9` and `json | 49 | 50` (corpus | oracle).
- **Finding**: `test-results/dot-cache/files/` holds 9 `.done` fixtures against 8 entries in `tests/visual/data/files.json`; json 50 against 49. The extra cached fixture is not in the manifest bucket.
- **Impact**: the "oracle" column can exceed "corpus"; a reader should not take oracle ⊆ corpus for granted.
- **Confidence**: High (counts read from both sources).

## Observation: c4 `gikaju-64-bari602` is a jar error page we draw
- **Context**: c4 survey `firstDiff: 'error-page'`, verdict `diverged`.
- **Finding**: the cached jar SVG is an error page and the port renders a diagram, so the row cannot conform (CLAUDE.md: "we draw where it errors = accepted divergence once the latest release jar also errors", signed per row). It is not in `oracle/accepted-divergences.json`.
- **Impact**: a candidate for a signed accepted-divergence row, a user decision (stop condition 5 forbids editing that file here).
- **Confidence**: High on the facts; the ruling is the user's.

## Observation: PARITY-SVG.md's preamble carries the same stale render-path sentence
- **Context**: T5 corrected `docs/parity-report.md`'s preamble ("the ratchets and the DOT-conformance census render through the low-level `renderFixture` helpers").
- **Finding**: `scripts/svg-parity-dashboard.ts` prints the same sentence into `tests/oracle/svg-conformance/PARITY-SVG.md`; that script is outside T5's write-set.
- **Impact**: the two reports disagree on the render-path description until that script is edited.
- **Confidence**: High.

## Observation: `state`'s `@class` first-diff is a survey-only view
- **Context**: auditing the state note.
- **Finding**: the survey's `firstDiff` names `@class` on 16 rows, but the census `--families` tally (every diff, not the first) has no `@class` family in its top 14; the census-wide groups are `path/@id`, `text/@x`, `@textLength`, `@y`, `g[childCount]`, `path/@d`.
- **Impact**: a note written from `firstDiff` alone over-weights whatever attribute happens to come first in document order.
- **Confidence**: High.
