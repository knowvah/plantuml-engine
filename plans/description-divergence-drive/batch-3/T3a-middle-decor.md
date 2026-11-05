# T3a — middle decor

Commit: `fix(description): draw a link's middle decor`.

## Context
`CommandLinkElement.java:149-157` maps INSIDE `0`, `0)`, `(0`, `(0)` to `LinkType#withMiddleCircle*`. `SvekEdge.java:353-356` sets `labelShield` to 7 when the decor is not `NONE`, `:441` widens the note dimension by `2 * labelShield`, `:953-954` offsets the label, and `:982-990` draws it at `dotPath.getMiddle()` with `getMiddleFactory(arrowLollipopColor, backgroundColor).createUDrawable(angleDeg - 45)`.

D5: class has this. Move `buildMiddleDecorMarkup` and its radii out of `src/diagrams/class/renderer-arrowhead-middle.ts` into `src/core/svek/extremity/`, narrowing its `EdgeGeo` and `MiddleDecor` parameters, and `LABEL_SHIELD` out of `class-layout-edge-labels.ts:50`. Class stays byte-identical. Then description: the grammar's `INSIDE` group (`link-grammar.ts:15`), the shield in `link-edge-attrs.ts` (`:329` says `hasMiddleDecor` is fixed `false`, so that stops being true), the draw in `renderer-edge.ts`. `DotPath#getMiddle` is ported (`core/klimt/shape/DotPath.ts:374`). `arrowLollipopColor` is on the theme, and class's fallback is `theme.colors.background` (`class/renderer-edge.ts:441`, `SvekEdge.java:266-268`).

The diff at `lakuti-06` is the decor's `A10,10` path first, then the edge path and its id, `childCount` 1 against 3.

Check `SUBSET`/`SUPERSET` reach: journal it (D5). `befemi-82`, `vusopa-96`, `vugaso-74`, `saveje-35` are under `scale`: they have `dotEqual` false today, and the shield is the likely reason (*lead*). `povuju-56` also has `note on link`: T4e.

## Rows
`lakuti-06`, `bokumi-45`, `tireno-34`, `nofunu-07`, `povuju-56`, `saveje-35`, `befemi-82`, `vusopa-96`, `vugaso-74`.

## Acceptance
- Given `lakuti-06`, when rendered, then it has zero diffs.
- Given `bokumi-45`, then `skinparam ArrowLollipopColor yellow` reaches the decor's fill.
- Given every class row, then `verdict-diff` reports no move: the extraction was pure.

Observability: N/A — no new observable operations. Rollback: Reversible.
