# T3a — Turn the engine on

**Read:** D2, D7; `src/diagrams/bpm/index.ts`; `src/registered-plugins.ts` (`registerFromSalt`, between `ganttPlugin` at
java:183 and `chronologyPlugin`/`dedicationPlugin`); `src/core/block-extractor.ts` (the `DiagramType` union near :45,
the start-tag map near :170, `PORT_TO_UPSTREAM` near :433); `src/core/assemble-svg.ts` (the `DIAGRAM_TYPE_BPM` case
near :340); `PSystemBuilder.java:183-186`; `DiagramType.java:134-135`.

**Write-set:** `src/diagrams/flow/index.ts`, `src/registered-plugins.ts`, `src/core/block-extractor.ts`,
`src/core/assemble-svg.ts`, `tests/unit/flow/**`; optionally `tests/oracle/svg-conformance/render-fixture-flow.ts`
early (T4 owns it).

**Do:**
1. `index.ts` mirrors bpm's plugin shape with `flow`, `parseFlow` and `renderFlow`.
2. `registry.register(flowPlugin); // java:185` after `chronologyPlugin` (java:184, commented out upstream) and before
   `dedicationPlugin` (java:186). Upstream order is `GanttDiagramFactory`, the commented `ChronologyDiagramFactory`, then
   `FlowDiagramFactory`.
3. `'flow'` in `block-extractor.ts`'s union, start-tag map and `PORT_TO_UPSTREAM` (`UpstreamDiagramType.FLOW`; add the
   enum member if absent, in `DiagramType.java:45`'s order).
4. `DIAGRAM_TYPE_FLOW` on the titled path in `assemble-svg.ts`, as BPM's. Check `document-back-color.ts` as bpe T3a did.
5. Do **not** touch `EmbeddedDiagram.ts`: upstream has no `flow` keyword (`cov-embedded` draws `CLASS`).
6. `tests/architecture/layering.test.ts` passes with no new `ALLOWLIST` entry (D2).
7. Measure: survey `unknown`, `verdict-diff`, `survey-moves`, `flow-rows.mjs`, `row-diffs.mts`, and
   `multiset.mjs` on `bemixo`. Our SVG is in the row-diffs output directory.

## Acceptance
- Given `renderSync` on `bemixo-79-xulu250`, then the output carries `data-diagram-type="FLOW"`, is 605×421, and is
  multiset-equal to the cached oracle.
- Given the `unknown` survey, then `verdict-diff` exits 0, and the row's new verdict and first diff are journaled. The
  first diff is expected to be an order diff (D4).
- Given the routing gate, then any failure is the expected `bemixo` flip. T4 re-pins it; if the gate is red at batch
  close, re-pin that one row here and journal it.

Observability N/A. Rollback Reversible.
