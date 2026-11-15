# T1a — core helper `src/core/svek/edge-label-embed.ts`

## Context

The jar builds every svek link label with `Display#create0` (`SvekEdge.java:299-300`). Inside it,
`CreoleParser#createSheetSlow` (`CreoleParser.java:146-170`) turns a line that opens an embed into one
`EmbeddedDiagram` atom stripe, via `EmbeddedDiagram.createAndSkip` over the same iterator. `SheetBlock1` then
stacks the stripes. This port has that walk only inside class (`class-edge-label-embed.ts#splitEmbedLabelLines`).
State, description and legacy activity cannot import it (layering rule 2), so D3 puts it in core.

## Task

Create the helper with three pure-ish parts and their unit tests:

1. **The walk.** `display lines → readonly EdgeLabelSegment[] | undefined`, with `undefined` when no line opens an
   embed (the caller keeps its text path, D2).
   - Segments are `{ kind: 'text', lines }` or `{ kind: 'embed', source }`, where `source` is the
     `@start<type> … @end<type>` list that `createAndSkip` builds (`EmbeddedDiagram.java:97-115`).
   - Reuse `core/EmbeddedDiagram.ts`'s `getEmbeddedType` and `createAndSkip` line collection rather than a third
     copy. That includes the nested-closer detail: an inner `}}` is kept, and only the outermost one is swallowed.
   - Unterminated input absorbs the rest of the lines.
2. **The atom.** Given a segment's source, return an `EmbeddedDiagram` (or a thin wrapper) whose
   `calculateDimension`/`drawU` go through the registered `NestedDiagramRenderer` (`getNestedDiagramRenderer()`).
   It must keep the jar's catch arm, 42x42 logged (`EmbeddedDiagram.java:148-152`), and rethrow
   `EmbeddedDiagramDepthError`. Check how `state-composite-description-block.ts#nestedRenderer` and
   `class-nested-diagram-renderer.ts#guardedRender` already do this, and reuse rather than duplicate.
3. **The stacking.** Stripe dimensions plus the sheet's alignment give each stripe's `(dx, dy)` and the block's
   width/height, per `SheetBlock1.java` (read the file: `calculateDimension`, `drawU`, the coef for
   LEFT/CENTER/RIGHT).

Keep each function within the complexity limits (30 NLOC, CCN 10, 5 params).

## Write-set
`src/core/svek/edge-label-embed.ts`, `tests/unit/core/edge-label-embed.test.ts`, `docs/catalog.md` (`npm run catalog`).

## Read-set
`src/core/EmbeddedDiagram.ts:97-115,246-304,400-468`, `src/core/nested-diagram-registry.ts`,
`src/diagrams/class/class-edge-label-embed.ts:1-120`, `src/diagrams/class/class-body-enhanced-embeds.ts:82-124`,
`src/diagrams/state/state-composite-description-block.ts:40-60`, `tests/architecture/layering.test.ts:1-60`.

## Interface contract (consumed by T1b, T1c, T2a, T2b)

The exact names are the implementer's; the shape is fixed:
- `splitEdgeLabelEmbeds(lines: readonly string[]): readonly EdgeLabelSegment[] | undefined`
- `edgeLabelEmbedAtom(source: readonly string[], skinParam: ISkinSimple | null): TextBlock`, with `width`/`height`
  from `calculateDimension`, drawing an `<image>` through `UGraphic`.
- `stackEdgeLabelStripes(stripes: readonly { width: number; height: number }[], align: HorizontalAlignment):
  { width: number; height: number; offsets: readonly { dx: number; dy: number }[] }`

## Acceptance
- Given `['{{']`, when split, then one embed segment `['@startuml', '@enduml']`, and the atom measures 532x227 with
  the production renderer registered (the Welcome page).
- Given `['a', '{{', 'class X', '}}', 'b']`, when split, then text `['a']`, embed
  `['@startuml', 'class X', '@enduml']`, text `['b']`.
- Given `['plain']`, when split, then `undefined`.
- Given no registered renderer, when the atom measures, then 42x42 (`EmbeddedDiagram.java:152`).
- Given stripes 100x20 and 40x10 with CENTER, then the block is 100x30 and the second stripe's dx follows
  `SheetBlock1`'s coef (quote the line in the test).

Observability is N/A. Rollback is Reversible.
