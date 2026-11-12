# T3a — Turn the engine on

**Read:** D2, D7; `src/diagrams/wire/index.ts`; `src/registered-plugins.ts` (`registerUmlRun`); `src/core/block-extractor.ts`
(the `DiagramType` union, the start-tag map near :167, `PORT_TO_UPSTREAM` near :426); `src/core/assemble-svg.ts`
(:320-340, the titled path); `src/core/document-back-color.ts:58-59`; `tests/architecture/layering.test.ts` `ALLOWLIST`;
`PSystemBuilder.java:141`; `DiagramType.java:98-99` and `getStyleName` (no BPM branch → `activityDiagram`).

**Write-set:** `src/diagrams/bpm/index.ts`, `src/registered-plugins.ts`, `src/core/block-extractor.ts`,
`src/core/assemble-svg.ts`, `tests/architecture/layering.test.ts`, `tests/unit/bpm/**`; optionally
`tests/oracle/svg-conformance/render-fixture-bpm.ts` early (T4 owns it).

**Do:**
1. `index.ts` mirrors wire's plugin shape with `BPM`.
2. `registry.register(bpmPlugin); // java:141` right after `activityPlugin` (java:140) in `registerUmlRun`; update the
   function's doc range comment.
3. `'bpm'` in `block-extractor.ts`'s union, start-tag map and `PORT_TO_UPSTREAM` (`UpstreamDiagramType.BPM`).
4. `DIAGRAM_TYPE_BPM` on the titled path in `assemble-svg.ts`. `document-back-color.ts` needs no row (D3; confirm).
5. The `ALLOWLIST` entry `src/diagrams/bpm/ → src/diagrams/activity/ftile/`, quoting `BpmElement.java`'s
   `activitydiagram3.ftile.vertical` imports (D2).
6. Do **not** touch `EmbeddedDiagram.ts`: upstream has no `bpm` keyword (`EmbeddedDiagram.java:257-348`).
7. Measure: survey `unknown`, `verdict-diff`, `survey-moves`, `bpm-rows.mjs`, `row-diffs.mts` on all 7.

## Acceptance
- Given `renderSync` on `bibuka-01`, then the output carries `data-diagram-type="BPM"` and the survey moves the row off
  `svg/@background`.
- Given the `unknown` survey, then `verdict-diff` exits 0 and `bpm-rows.mjs` lists each row's verdict, journaled.
- Given the layering test, then it passes with exactly one new `ALLOWLIST` entry.

Observability N/A. Rollback Reversible.
