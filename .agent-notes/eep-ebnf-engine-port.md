# ebnf-engine-port observations

## Observation: oracle-render.sh writes beside the input, not into the out-dir
- **Context**: rendering T4b's 47 authored fixtures with
  `scripts/oracle-render.sh tests/fixtures/ebnf tests/fixtures/ebnf/*.puml`.
- **Finding**: the jar resolves `-o <dir>` relative to each input file's own directory, so a repo-relative out-dir
  writes to `tests/fixtures/ebnf/tests/fixtures/ebnf/*.svg`. `-DPLANTUML_DUMP_DOT=<dir>` is relative to the cwd, so a
  class-diagram probe also dropped a `svek-1.dot` into the fixture dir.
- **Impact**: pass an absolute out-dir, or move the SVGs up and delete stray `svek-*.dot`; otherwise the fixture tree
  silently keeps its old SVGs.
- **Confidence**: High

## Observation: Locale.forLanguageTag does not accept `_`
- **Context**: porting `I18n.getLocalizedValue` (eep T1a).
- **Finding**: measured on the oracle jar's JVM, `zh_CN` and `fr_FR` are ill-formed first subtags and resolve to the
  root (English) bundle; `zh-Hant` resolves to `zh_TW` through `ResourceBundle.Control`'s Chinese region inference;
  `zh-HK` has no bundle and falls back to the default locale (English on the oracle machine).
- **Impact**: `!option language zh_CN` prints English in the jar; mirror it, do not "fix" it.
- **Confidence**: High

## Observation: EBNF comment text keeps its blanks
- **Context**: a 7.15 px note-width gap in T2a.
- **Finding**: `readComment` and the single-line command's `COMMENTA`/`COMMENTB` keep the spaces inside `(* … *)`, so
  `(* lead *)` is the note text `" lead "`; under the deterministic measurer each space is 3.575 px at size 13.
- **Impact**: note widths and text x depend on the blanks; a test that passes `'lead'` mismeasures by 7.15.
- **Confidence**: High

## Observation: fixtures.mts error-pair check stripped header lines by position
- **Context**: T4b measurement.
- **Finding**: the jar's Welcome-style error page puts the version and `[From …]` lines at text 18-19, not first; the
  plan's `fixtures.mts` sliced off the first two lines and so missed three error pairs. It now strips them by pattern.
  nwdiag's copy (`plans/nwdiag-engine-port/measurements/fixtures.mts`) still slices by position.
- **Impact**: a copied fixtures tool under-reports error pairs on Welcome-style pages.
- **Confidence**: High

## Observation: JSON round-trips rewrite `\u` escapes
- **Context**: retiring `ladifa` in `oracle/accepted-divergences.json` (T4a).
- **Finding**: `JSON.parse` + `JSON.stringify` turned every `—`/`Δ` escape in unrelated entries into the
  literal character: a semantically identical file with a noisy diff. The move was redone as a text edit.
- **Impact**: edit the ledger as text when the diff must show one entry; key-compare before and after.
- **Confidence**: High
