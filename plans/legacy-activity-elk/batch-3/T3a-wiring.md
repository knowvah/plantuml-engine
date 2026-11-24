# T3a: wiring

**Goal:** a legacy diagram carrying `!pragma layout elk` is laid out by `CucaDiagramFileMakerElk` and drawn as
`MyElkDrawing` (D2). Every row reaches 0 diffs, or goes to T3b with its first diff in the journal.

## Port
1. `src/diagrams/activity-legacy/layout-elk.ts`: `layoutActivityLegacyElk(diagram, measurer, backend)`, shaped like
   `cheneer/layout-elk.ts`. Its header cites `CucaDiagramFileMakerElk.java:477-500` and states that none of the svek
   shortcuts apply (`GraphvizImageBuilder.java:145-158`).
2. `layout.ts`: in `layoutActivityLegacy`, branch on `diagram.isUseElk()` **before** the simplifier, with a
   `requireElk(elk)` that throws `ELK_RENDER_SYNC_UNSUPPORTED` (`cheneer/layout.ts:70-81`). `layoutActivityLegacy`
   gains an optional `elk?: ElkBackend` parameter.
3. `layout-geometry.ts`: `ActivityLegacyGeometry` gains `readonly elk?: MyElkDrawing`, documented.
4. `renderer.ts`: when `geometry.elk` is set, the text block is the drawing (`cheneer/renderer.ts:194-197`); the
   document wrapper (title, legend, scale) stays on its existing code path.
5. `index.ts`: `requiresElk(ast) { return ast.isUseElk(); }` with the comment Chen's plugin carries
   (`cheneer/index.ts`), and `layoutSync` passes `services?.elk`. Update the stale header ("Not registered ... T3a").

## Red
- `tests/unit/activity-legacy/layout-elk.test.ts`: `layoutActivityLegacy` on `pragma-elk.puml` with no backend throws
  `ELK_RENDER_SYNC_UNSUPPORTED`; with `await loadElk()` it returns a geometry whose `elk` is set and whose size is
  the drawing's `calculateDimension` (assert the numbers the jar implies: 55x179 less the document margins, read from
  the renderer, never fitted).
- `activityLegacyPlugin.requiresElk` is true for `pragma-elk.puml` and false for `lap-basic.puml`.

## Measure and pin
Measure (task contract step 5), then pin (step 6): every row at 0 leaves `OPEN_ROWS`. For every row still nonzero,
journal its first diff and hand it to T3b; its reason becomes `#158: residual under diagnosis (T3b)`.

## Write-set
`layout-elk.ts` + test, `layout.ts`, `layout-geometry.ts`, `renderer.ts`, `index.ts`, the ratchet, the builder, the
baseline json. Run `npm run catalog` for the new exports.

## Acceptance
- Given `pragma-elk.puml` through `renderSync` with `options.elk`, then the svg draws `<line>` edge sections and no
  `<g class="link">`, as the jar's does.
- Given `pragma-elk.puml` through `renderSync` without `options.elk`, then it throws `ELK_RENDER_SYNC_UNSUPPORTED`.
- Given any legacy row without the pragma, then its pinned score is unchanged and the DOT gate's count is unchanged.

Observability is N/A. Rollback is Reversible.
