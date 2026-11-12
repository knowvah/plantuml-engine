# T2b — Draw and export

**Read:** D3, D4, D8; `FlowDiagram.java` `drawU`, `getCenter`, `movePoint`, `getMinMax`, `calculateDimension`,
`getDefaultMargins`, `getTextBlock`, `getMagneticBorder` and `getBackcolor`; `TitledDiagram.java` and
`core/TextBlockExporter.java` for where the background comes from when `getBackcolor()` is `null`; `DiagramType.java`
`getStyleName` for `FLOW`; `src/diagrams/bpm/bpm-export.ts`.

**Write-set:** `src/diagrams/flow/{FlowDiagram,flow-export}.ts`, `tests/unit/flow/**`.

**Do:**
1. `SINGLE_SIZE_X = 100`, `SINGLE_SIZE_Y = 35`, each with its java line.
2. `drawU`:
   - Translate by `-minX × 100` and `-minY × 35`.
   - Draw each box in `tilesBoxes` insertion order (D4), centred in its 200×70 cell.
   - Then, in `MY_RED` with a `MY_RED` background, draw each path: a `ULine` from the moved start to the moved dest,
     and `UEllipse.build(7, 7)` at `dest - 3`.
   - Put the box loop and the path loop in two named helpers (D10).
3. `calculateDimension` is `MinMaxGolem` width×100 by height×35. `getDefaultMargins` is `same(0)`.
4. `flow-export.ts` copies `bpm-export.ts` with `FLOW` (`data-diagram-type="FLOW"`), and takes the background source
   from the Java read in step 0, quoted. Handwritten goes through `UGraphicHandwritten` as in bpm.

## Acceptance
- Given `cov-single`, then the export is 201×71 with background `#FFFFFF`, and it equals the oracle byte for byte, once
  rendered through `renderFlow` directly in a unit test.
- Given `bemixo`, then the export is multiset-equal to the oracle (`multiset.mjs`'s comparison) and 605×421.
- Given `cov-option-handwritten`, then it is multiset-equal to its oracle (`path` and `polygon`, no `rect`).

Observability N/A. Rollback Reversible.
