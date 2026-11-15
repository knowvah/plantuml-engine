# `xetase-70-zaza808` — an embedded diagram in an edge label

Rewritten 2026-11-15 by ele T1c (issue #144). The 2026-09-08 version of this note measured the jar before oracle
seam #3 (54x54 = the 42x42 catch arm + 2·6); those numbers are stale and were removed.

## Observation: an unterminated `{{` label is the Welcome page of an empty embedded `@startuml`
- **Context**: Pinning `state/xetase-70-zaza808` (`LexTop --> LexTop: {{`).
- **Finding**: The jar's `svek-1.dot` reserves `WIDTH="544" HEIGHT="239"`: 532x227 (the nested document) plus
  2·6 self-loop `marginLabel` (`SvekEdge.java:372-373`). `EmbeddedDiagram#calculateDimensionSlow` takes its SVG
  arm (`EmbeddedDiagram.java:129-133`); the 42x42 catch arm (`:152`) is only for a renderer that throws.
- **Impact**: Never target 42x42 for `{{`. State now reserves and draws the embed through
  `src/core/svek/edge-label-embed.ts`; the row is pinned in `oracle/goldens/svg-state/ratchet.json`.
- **Confidence**: High

## Observation: low-level fixture harnesses must register the nested renderer
- **Context**: The state ratchet (`render-fixture-state.ts`) calls `parseState/layoutState/renderState` directly.
- **Finding**: Without `registerNestedDiagramRenderers` ahead of layout the embed measures 42x42 (no renderer),
  or through whatever a previous test left registered. `src/index.ts#prepareBlock` registers per `renderSync`.
- **Impact**: Any harness that bypasses `renderSync` and meets a `{{` must register as `render-fixture-class.ts`
  and `render-fixture-state.ts` do.
- **Confidence**: High
