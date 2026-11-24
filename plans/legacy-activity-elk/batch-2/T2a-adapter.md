# T2a: the adapter, leaf and link half

**Goal:** `ActivityLegacyElkAdapter implements ElkDiagramAdapter` over `ActivityDiagram` (D1), answering every leaf,
link, skin-parameter and diagram member from the abel model. The cluster members throw
`unported: <member> (T2b)` until T2b, in the same batch, replaces them. Nothing calls the adapter yet.

## Port
- Template: `ChenEerElkAdapter` (`src/diagrams/cheneer/cheneer-elk-adapter.ts`). Copy its shape, not its answers:
  each member names the Java call it stands for and is answered from the legacy engine's own helpers.
- **Leaf image:** `printEntityInternal(ent)` (`CucaDiagramFileMakerElk.java:462-475`) is
  `GeneralImageBuilder.createEntityImageBlock(ent, ...)`; the legacy svek path builds the same image in
  `activity-legacy-dot.ts`. Reuse that call; do not build a second image factory. `getSvekImage()` is always null here
  (D2: the simplifier never ran), so never read it.
- **Label:** the maker's private `getLabel` (`:190-248`): the arrow-styled font (`getFontForLink`, `:150-156`), the
  `wrapWidth` choice, `CreoleMode.SIMPLE_LINE`, `addVisibilityModifier`, `marginLabel = 1`, and the link note merged by
  `note.getPosition()` through `EntityImageNoteLink`. Never null: return `TextBlockUtils.empty(0, 0)` for nothing.
  Compare with `activity-legacy-edge-text.ts#buildEdgeTexts`, which answers the svek version: reuse its font helpers
  (`labelFontOf`), not its svek margins.
- **Arrow style:** `MyElkEdge#getStyle` (`MyElkEdge.java:140-145`). Read the Java to see which `SName` it signs; Chen
  found it is `classDiagram`, not the diagram's own style name (`cheneer-elk-adapter.ts`, `ELK_EDGE_STYLE_NAME`).
- **Identity:** a leaf or group by its uid, a link by `link<index into getLinks()>`, the root group by `''` (Chen's
  convention).

## Red
`tests/unit/activity-legacy/activity-legacy-elk-adapter.test.ts`: parse `tests/fixtures/activity-legacy/pragma-elk-if.puml`
and assert exact answers: `leafs()` ids in creation order, `getLinks()` length, `getEntity1/2` of `link0`, the
`calculateDimension` of the start circle (20x20) and of `A` (28.025x32, the jar's rect), `getLabel` of the `c?` link
(width and height from the deterministic measurer), `isInvis` false, and that a cluster member throws `unported` (T2b removes that assertion).

## Write-set
`src/diagrams/activity-legacy/activity-legacy-elk-adapter.ts`, its unit test. Keep the file under 500 lines.

## Acceptance
- Given `pragma-elk-if` parsed, when the adapter is built, then `leafs()` lists start, A, the branch, B, C, end in
  creation order and every link's endpoints match the source.
- Given the `c?` link, when `getLabel` runs, then its dimension is the label block plus `marginLabel` 1 on each side.
- Given any cluster member, then it throws an error naming T2b (until T2b lands).

Observability is N/A. Rollback is Reversible.
