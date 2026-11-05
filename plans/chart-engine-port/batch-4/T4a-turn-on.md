# T4a — Turn the port on

**Read:** `wbs/index.ts`, `src/index.ts:100-135`, `tests/unit/chart/lengthadjust-lad-t2f.test.ts`, `tests/unit/sprite-parsers.test.ts:160-180`, `tests/unit/utility-registration.test.ts:80-90,210-220`, D2, D3.

**Do, in one commit:**

1. Rewrite `chart/index.ts` per D2, exporting `chartPlugin` with `type: 'chart'`. `registered-plugins.ts` already imports it.
2. Delete `ast.ts`, `chart-layout-axes.ts`, `chart-layout-core.ts`, `chart-layout-series.ts`, `chart-renderer-axes.ts`, `layout-series-dispatch.ts`, `layout.ts`, `line-handlers.ts`, `parse-helpers.ts`, `parser.ts`, `renderer.ts`, `renderers/`. Grep first: `tests/unit/chart/parse-chart-ast.ts` and `src/index.ts` import them.
3. Delete `tests/unit/chart/{layout,renderer}.test.ts` and `renderers/`. Rewrite `parser.test.ts`'s and `annotations.test.ts`'s surviving cases against the factory, keeping a case per upstream behaviour they assert (`legend right` beats the chrome legend; `title` reaches `annotations`). Old assertions on old geometry are not a spec. Rewrite `parse-chart-ast.ts` and the `sprite-parsers` case on `parseChart`.
4. `src/index.ts#annotationsOf`: drop the `chrome` branch and its doc (D3). Rewrite the comments naming `renderErrorDiagram` and "chart's inline error path" in `core/dispatcher-types.ts:274`, `core/assemble-svg.ts:333`, `src/index.ts:149`, `diagrams/class/ast.ts:280`: pick a live example or remove it.
5. `npm run catalog`.

**Expected fallout:**

- `oracle/goldens/document-background.json`'s `chart-black` (104) and `chart-gradient` (75) are shrink-only: re-measure and shrink them, and strike dbp follow-on 2's chart part in `planning/next-missions.md`.
- `oracle/goldens/svg-lengthadjust/authored-baseline.json`'s four `chart-*` rows: re-measure with that gate's tool. A rise is a finding.
- The routing gate logs 29 `[FIXED]` lines already; T5 re-pins them.
- Coverage: the new files have tests from batches 1 to 3. Read the per-file report; 90/90/90 is the floor.

## Acceptance
- Given `renderSync` of `babadu-29`, then the result carries `data-diagram-type="CHART"` from the new engine, and `git grep -n "diagrams/chart/parser"` is empty.
- Given the survey, when `chart-moves` compares to b0, then lost is 0, and the journal has the new verdict count.
- Given the four gates, then they pass.

Observability N/A. Rollback Reversible.
