# T1b — A failing `<style>` block stops the parse at its line

**State at planning:** the stock jar draws an error page for `sequence__scope-malformed-brace` (line 7) and
`-colour` (line 10), and for all seven `*__malformed-novalue` rows: `Error in style definition: parsing`. We draw
the diagram (6-40 diffs). `buildTheme` and five other sites catch `StyleParsingException` and fall back (dss D6,
D6a): `document-back-color.ts:125`, `activity-box-style.ts:79`, `activity-circle-style.ts:103`,
`elk/layout-services.ts:56`, `mindmap-style-builder.ts:165,202`.

**Read:** `CommandStyleMultilinesCSS.java:84-98`, `CommandStyleSingleLineCSS.java:80-95` (the one-line `<style>`
form), `CommandStyleImport.java:120-135`, `StyleParser.java:100-175`. On our side, `skin-command.ts` (`skinCutOf`,
`SkinCut`) and its two callers, `src/index.ts:294` and `dispatcher.ts:125,186`. Also the preprocessor collector that
hoists `<style>` blocks (where `preprocessed.styles` is filled, with each block's document position), and dss
D6/D6a in `plans/diagram-style-scope/decisions.md`.

**Do:** per D3.
1. Red: a unit test that a source with a malformed block yields a cut at the block's first line, with
   `Error in style definition: parsing`. A well-formed block, or a stray `}` alone, yields none. Then an end-to-end
   `renderSync` test that `sequence__scope-malformed-brace` draws an error page.
2. Parse each hoisted block the way `CommandStyleMultilinesCSS#executeNow` does, against the builder state at that
   point. A block that fails makes a cut. Mirror `CommandStyleSingleLineCSS` and `CommandStyleImport` if the
   collector hoists those forms too. When a skin cut and a style cut both exist, the earlier line wins, as upstream's
   per-line loop would.
3. Check each existing `StyleParsingException` catch. Delete a catch that is now unreachable, with a journal line;
   keep it where upstream catches too (D3).

**Measure:** `rows.mts` prefixes `sequence__scope-malformed` and every `*__malformed-novalue`; the full survey,
since any corpus source with a failing block moves. Read every moved row.

## Acceptance
- Given the nine malformed rows, when the dss ratchet runs, then each is conformant through T1a's rule.
- Given the seven `*__malformed-straybrace` rows (a stray `}` after a complete block), then each stays conformant:
  the jar draws them, and so must we.
- Given `verdict-diff` against `<base>`, then 0 lost, and every corpus row the cut moved is journaled with its
  stock verdict.

Observability N/A. Rollback Reversible.
