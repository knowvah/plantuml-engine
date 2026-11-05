# T3a — A `|...|` body line is a table, on `entity` and `object`

**Row:** `pikuba-31-faxo766` (113 diffs). `entity "Table 1" as table { | PK | id | ... }` and `Object o1 { ... }`. Jar: cell text at `x` 20.85, 47.275, 112.462 and `#000` stroke-1 rules. Ours: literal `| PK | id | ...` text, with the second row sorted into another compartment. The title's own table (`g[1]`, 26 diffs) moves only because the canvas does.

**Read:** `BodierLikeClassOrObject.java:93-100,215-240`, `BodyEnhanced1.java:117,143,209`, `LeafType.java:85-88` (`OBJECT` is not `LIKE_CLASS`), `MethodsOrFieldsArea.java`. On our side `class-body-enhanced.ts:15-30,95-110`, `core/creole-table.ts:76`, `core/klimt/creole/legacy/CreoleParser.ts:271`.

**Do:** per D6. Add the `isTableLine` trigger and remove the "zero corpus reach" claim from `class-body-enhanced.ts`, which the row disproves. Establish the `OBJECT` route, and note which builder both share. Blank lines split the two tables in this row: `rawBody` holds the blank, and `class-body-blank-filter.ts` may not mirror that once the body is enhanced.

**Red, authored grid under `tests/fixtures/odd-T3a/` with oracles:** one table in `class`, `entity`, `interface`, `object`; a table beside `--` separators; `|=` header cells; a `| a |` line among plain fields; a line starting `|` that is not a table (`| a`).

**Measure, extra bucket:** `class` and `usecase`. `isEnhancedBody` is on their path. A regex scan over the corpus found only `pikuba-31`, and it is a heuristic: trust the survey.

## Acceptance
- Given `pikuba-31`, when compared, then conformant.
- Given each grid row, when compared with its oracle, then 0 diffs.
- Given `class` and `usecase`, then 0 rows lost.

Observability N/A. Rollback Reversible.
