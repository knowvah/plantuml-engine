# T2e — klimt carriers: the background rect leads, at the final size (D7)

Agent: typescript-pro (sonnet, effort high), worktree `dbp-T2e`. Include
[../task-contract.md](../task-contract.md). Commit: `fix(core): klimt carriers
paint the document rect first, at the final canvas (T2e)`.

## Context
gantt, mindmap, salt and wbs finalize through `TextBlockExporter.ts#finalizeTitledDiagramFragment`
around `BODY_ANCHOR`. With a title and any non-default background, the jar's
first child of the content `<g>` is the (0,0) rect sized to the whole canvas,
then `<g class="title">`. Ours: title first, then a rect sized to the
pre-title block. Measured `mindmap-title-solid`: jar `width="110" height="110"`,
ours `width="90" height="90"`, after the title. Solid and gradient alike.
The jar paints it in `SvgGraphics`' constructor before any draw
(`SvgGraphics.java:176-192`, sized `:819-821`). Description solved the same defect
(`description/renderer.ts#splitLeadingBackgroundRect`, `assemble-svg.ts#finalizeDescriptionFragment`);
`assemble-svg-backcolor.ts#backcolorMarkup` is the shared paint. Read how these four
bodies come to carry their rect first; state the mechanism before any edit.

## Task
Make the rect the content `<g>`'s first child at the final (chrome-composed)
canvas for all four engines, with and without a gradient, reusing the existing
helpers. The no-chrome path must stay byte-identical (every corpus and dbg row
without a title). Tests first; expected values cite the jar row or the Java.

## Measure
`diff-row.mts` on `{mindmap,wbs,gantt,salt}-title-{solid,gradient}` before → after.
Their `<g class="title">` child count is T2f's: a residue of exactly that one
diff on a `-gradient` row is expected until T2f merges. `-solid` rows go conformant.

## Write-set
`src/core/TextBlockExporter.ts`, `src/diagrams/{mindmap,wbs,salt,gantt}/index.ts`,
`src/core/assemble-svg.ts` (the `finalizeShellFragment` cases only), their unit tests.
Not `src/core/annotations/*` (T2f).

## Acceptance
- Given `{mindmap,wbs,gantt,salt}-title-solid`, then conformant.
- Given the four `-title-gradient` rows, then one rect, first, final size; only the title's own chrome-rect diff may remain.
- Given every corpus row of the four engines (mindmap 142, wbs 204, gantt 265, salt 51 conformant), then held; a corpus byte mover is reported with its mechanism.

Observability: N/A. Rollback: Reversible.
