# T1a — The dss ratchet applies the error-page rule

**State at planning:** `diagram-style-scope.ts` measures through `document-background.ts`'s `measureDbgRow`, a pure
byte comparison. `sequence__scope-single-line-slash` is pinned at 7: the stock jar errors (`Syntax Error?`, exit 200,
checked 2026-11-05) and so do we, but the bytes differ (version string, file name). The survey already applies the
rule (`scripts/lib/survey-error-verdict.ts`, `errorPageVerdict`, `installErrorPageFlag`).

**Read:** `docs/svg-conformance.md` "Error pages"; `scripts/lib/survey-error-verdict.ts`;
`src/core/error/error-renderer.ts#setErrorPageObserver`; `tests/oracle/svg-conformance/document-background.ts`
(`measureDbgRow`, `renderDbgMarkup`, the `DbgPin` type) and its other consumers, found with Serena
`find_referencing_symbols`. `.claude/memory/error-page-conformance-rule.md`.

**Do:** per D5.
1. Red: a ratchet-helper test where a row marked `stockError: true` with our error page counts 0. The same row
   without the flag counts its bytes. A `stockError` row where we draw a diagram counts its bytes plus 1
   (`firstDiff: 'error-page'`), so the rule never hides a drawing.
2. Extend the pin row type with an optional `stockError: true` and the measure path with the observer. Install it
   and clear it in a `finally`, as the survey does. Keep `document-background`'s own ratchet unchanged, or prove
   that its rows carry no flag.
3. Run `stock-check.mjs` on every dss and authored row whose oracle `.svg` is an error page. Find those rows by the
   oracle's content, not by name: `PlantUML version` / `An error has occurred` text. Flag only rows the stock jar
   errors on. Journal the list with each label.
4. Re-measure, and lower `sequence__scope-single-line-slash` to 0.

## Acceptance
- Given `sequence__scope-single-line-slash`, when the ratchet runs, then it measures 0 and is pinned conformant.
- Given a `stockError` row that draws a diagram on our side, then it measures above 0 (red test).
- Given `stock-check.mjs` over every error-page oracle in the fixture dir, then each flagged row prints `exit=200`,
  and the journal lists them.

Observability N/A. Rollback Reversible.
