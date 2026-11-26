# T2: theme-driven engines

**Rows:** `seq`, `seq-title`, `seq-newpage`, `teoz`, `state`, `state-title`, `act`, `act-title`, `desc-title`.
**Writes:** `src/diagrams/sequence/renderer.ts`, `src/diagrams/state/renderer.ts`, `src/diagrams/activity/renderer.ts`,
`src/diagrams/description/index.ts`, the gate.
**Reads:** `src/diagrams/class/renderer-document.ts:130-187` (the model), `src/core/klimt/document-shell.ts:69-102,
244-266`, `src/core/assemble-svg.ts:320-395`, `src/core/annotations/chrome-export.ts` (`applyExportedChrome`),
`src/diagrams/activity/layout/document-margin.ts:181` (`applyActivityChrome`), D1, D2.

## Steps

1. In each producer, beside its `theme.lengthAdjust` spread, add
   `...(theme.svgDimensionStyle === false ? { svgDimensionStyle: false as const } : {})` with a comment citing
   `TextBlockExporter.java:418-421` and `SvgGraphics.java:795-799`, and widen the return type to
   `RenderFragment & SvgDimensionStyleFlag`:
   - `sequence/renderer.ts`: the page fragment built near `:195-212`, and every other return path of
     `renderSequence` / `renderSequencePage` / `renderPaginated` (`newpage`, `NewpagedDiagram.java:142-145`, styles
     each page);
   - `state/renderer.ts#renderState`, near `:398-400`;
   - `activity/renderer.ts#renderActivity`, near `:434-436`;
   - `description/index.ts:187-200`, the chromed fragment built from `unwrapKlimtSvg`. The unchromed path already
     omits the attributes through the klimt option (`description/renderer.ts:314-315`).
2. Find where teoz is rendered (`!pragma teoz true`). If it does not pass through the sequence producers above, give
   its producer the same spread.
3. Trace the chrome paths. Each title probe proves one: `seq-title` and `state-title` go through
   `applyExportedChrome`, `act-title` through `applyActivityChrome`, `desc-title` through `applyChrome`. A path that
   rebuilds the fragment without spreading it drops the flag: carry it there, and journal the file.
4. Run the measurer, the sequence, state, activity and description ratchets, and the gate. Move the 9 rows to
   `EXACT`.

## Acceptance
- Given `skinparam svgDimensionStyle false` on a sequence, teoz, paginated sequence, state or activity diagram, with or
  without title/legend/caption, when rendered, then the root has no `style`, `width` or `height` and its `viewBox`
  is unchanged.
- Given a chromed description diagram with the flag, when rendered, then its root matches the jar's.
- Given any of these engines without the skinparam, when rendered, then the output is byte-identical to the base
  (the ratchets and `ctl-default` hold).

Observability is N/A. Rollback is Reversible.
