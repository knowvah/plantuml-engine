# Note audit — `scripts/parity-dashboard-notes.ts` against the 2026-11-04 numbers (ogc-T8)

One row per `ROW_NOTES` entry the capture touched, in the shape of
`plans/parity-dashboard-repair/measurements/note-audit.md`. Evidence is read from the
committed survey (`tests/oracle/svg-conformance/parity-<type>.json`), `new-rows.json`
(the rows absent from the same bucket's survey at the mission base `3aa0593e6`) and the
census. "old rows short" counts rows short of conformant that already existed at the base.
Verdict: **holds**, **corrected** or **added**.

| row | claim | evidence | verdict |
|---|---|---|---|
| activity | (none: the row conformed) | survey 594 / 37 / 247 (14 error); 284 rows short, old rows short 0, so every one is a new row (`new-rows.md`: activity-legacy 0/0/114, activity3 145/37/133); firstDiff on the 247 diverged: `@background` 120 (our error page against a jar drawing: 114 legacy `(*)` rows + 13 activity3 gaps, refusal-baseline known-gap 127; 7 of the 120 are error pages on both sides with different roots), `@stroke` 30, `@fill` 29, `g[childCount]` 23, `@stroke-width` 17, `@textLength` 15 | added: the fall is the 429 newly measured rows, not a regression |
| class | (none: the row conformed) | survey 831 / 20 / 23 (3 error); 43 short, old rows short 0; layoutEqual 641 / 664 (23 false); firstDiff on the 23 diverged: `@id` 5, `@stroke` 5, `@font-size` 3, `@fill` 3, `@textLength` 2 | added |
| dot | (none: the row conformed) | survey 60 / 2 / 0 (8 error); the 2 structural matches are new rows (`new-rows.md` dot 47 + 8 error / 2 / 0) | added |
| sequence | (none: the row conformed) | survey 1228 / 5 / 4; 9 short, old rows short 0; firstDiff on the 4 diverged: `title[1][childCount]`, `@background` (teoz-ng-001-11, `partition` grouping, refusal known-gap), `@stroke-dasharray`, `path[1]`; xobebi-29-jilu859 (two pages) conformant | added |
| state | layoutEqual 253 of 269; ids, text positions and widths, child counts, path data | survey 125 / 15 / 159 (4 error); layoutEqual true 272, false 21, n/a 6 (of 299); 174 short, old rows short 159 (so 15 of the 26 new rows diverged, 11 conform); firstDiff on the 159 diverged: `@id` 56, `@class` 23, `@textLength` 18, `@stroke-width` 15, `g[childCount]` 14, `@stroke` 9 | corrected: 272 of 293; groups now ids, classes, text widths, stroke widths, child counts; names the 15 new rows |
| object | mostly geometry on the 16 fixtures short of conformant | survey 65 / 8 / 8; 16 short, old rows short 16; the one new row (robitu-34-vupe367, `!pragma layout elk`) is conformant | holds |
| hcl, yaml | class `smetana`, no numbers in the note | hcl 8 / 7 / 0 (12 new rows: 7 conformant, 5 structural), yaml 7 / 35 / 1 (4 new rows, all structural); every new row is `aligned=true` in the positional pin (residue.mts) | holds |
| timing | class `notBuilt` | survey 0 / 0 / 139 + 6 error-page conformant; the 19 new rows all `firstDiff` `svg/@background` (our error page against the jar's diagram), refusal known-gap (ogc-T4a) | holds |
| unknown | generated (D4) | `unknownDetail` regenerated from `parity-unknown.json`: 715 / 21 / 312 (91 error) | holds (generated) |

## Preamble

| claim | evidence | verdict |
|---|---|---|
| **corpus** counts manifest rows guessed by `classify-corpus.ts`; **oracle** counts cached rows placed by the jar's `data-diagram-type`, so they differ | activity corpus 771 vs oracle 878, sequence 1271 vs 1237, unknown 825 vs 1048: `capture-report.json` routed 332 activity-manifest rows (282 activity, 36 unknown, ...) and 373 sequence-manifest rows by jar type (D2); of 373 sequence rows only 63 are SEQUENCE (D1) | added |
| the oracle coverage line | `oracleCoverage` over the real trees: 5855 manifest rows, 5855 oracled, 0 reasoned, 0 missing (`oracle-coverage.test.ts` green) | added |
