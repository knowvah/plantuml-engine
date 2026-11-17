# T1c: hidden entities and links write their comment (D2)

**Writes:** `src/diagrams/class/renderer.ts` (`drawEdge`), `src/diagrams/class/renderer-leaf.ts`
(`renderClassifierLeaf`'s hidden return), `src/diagrams/class/class-relationship-ast.ts` (the wrong citation at
`:192-200`), unit tests beside them.
**Reads:** D2 in `decisions.md`; `svek/SvekResult.java:70-101`, `AbstractUGraphic.java:120-146`,
`SvgGraphics.java:1190-1195`, `SvekEdge.java:830-846`, `Link.java:177-186,458-459`, `WithLinkType.java:95-160`,
`Cluster.java:298-311`; the description precedent `description/layout-helpers-types.ts:275-284` and
`description/renderer-draw-sequence.ts#drawEdges`.

## Steps

1. Read `SvekEdge#drawU` past the comment: what does a hidden link still do to `ids` (`setSharedIds`,
   `idCommentForSvg`)? Decide from the Java whether `renderEdge`'s `linkIds` must see a hidden link, and journal it
   with the `file:line`.
2. Red: unit tests on `lafama-65-zoci799` (expect `<!--class Foo1-->`, `<!--class Foo2-->`, `<!--class Foo3-->`,
   `<!--reverse link Foo2 to Foo3-->`), `guxode-39-dobi371` (`<!--link A to B-->` last) and the `hidden-map-json` gate
   row (map and json write nothing, both links do).
3. Green: at `renderer-leaf.ts:108`, push only the comment T1b's predicate gives (`class` or `entity`), escaped. At
   `renderer.ts:246-247`, push only `linkCommentOf(edge, syntheticNames)`, escaped. `consumedByOpaleNote` keeps
   returning first with nothing. A hidden namespace keeps writing nothing (`renderer.ts:180` is already right).
4. Fix the citation in `class-relationship-ast.ts`: `-[hidden]-` is `WithLinkType#goHidden` → `Link#isHidden`, drawn
   under `UHidden` (`SvekResult.java:98`), so its comment is written; `SvekEdge.java:836-837` is `isInvis`.
5. Measure. Expect bucket A (23 rows) to empty, and the gate's hidden rows to reach 0 except where D3 names still
   differ (`hidden-entity-in-namespace`). Update the open lists and the gate.

## Acceptance
- Given `lafama-65-zoci799`, `doseko-41-mavu661`, `jakapi-64-tine258`, `xifuza-00-paze682`, `senece-96-fomu913` and
  `guxode-39-dobi371` (the issue's 6), when rendered, then each comment sequence equals its golden's.
- Given `hide @unlinked` (`zekona-69-sifo120`, `xelere-85-zodo588`), when rendered, then the hidden leaf's comment sits
  in node order, before the first link comment.
- Given any pin, when `compareSvg` runs, then its verdict is unchanged (a hidden element draws no shape).

Observability is N/A. Rollback is Reversible.
