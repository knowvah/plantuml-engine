## Observation: TextBlockUtils.withMargin's 3-argument call is not Java's
- **Context**: dei-T2a, porting `TextBlockCucaJSon#getTextBlock`'s `withMargin(result, 5, 2)`.
- **Finding**: the port collapses Java's overloads into `withMargin(tb, x1, x2 = x1, y1 = x1, y2 = x2)`, so `withMargin(tb, 5, 2)` means left 5, right 2, top 5, bottom 2, not Java's `(marginX, marginY)`. Every faithful caller spells the 5-arg form (`USymbolUsecase.ts:155`, `MethodsOrFieldsArea.ts:156`).
- **Impact**: a literal translation of any Java `withMargin(tb, x, y)` is silently wrong by `x - y` per side; write `withMargin(tb, x, x, y, y)`.
- **Confidence**: High

## Observation: UFontFactory.byDefault ignores its size
- **Context**: dei-T4b, the domain corner letter (`new BoxedCharacter(c, 8, UFontFactory.byDefault(8), ...)`).
- **Finding**: `UFontFactory.byDefault(int size)` returns `sansSerif(12)` whatever `size` is (`UFontFactory.java:66-68`); the port mirrors it. The brief's "size 8" premise was wrong.
- **Impact**: captured glyph outlines for `BoxedCharacter` are SansSerif plain 12 (`src/core/descdiagram/boxed-glyph-data.ts`), keyed by font in `driver-centered-character-svg.ts`, separate from the Monospaced-bold spot tables.
- **Confidence**: High

## Observation: description's ink walk needs every shape LimitFinder knows
- **Context**: dei-T4c, first render of a domain leaf.
- **Finding**: `LimitFinder.draw` threw `unsupported shape UCenteredCharacter`, turning the diagram into our error page. Upstream has a no-op branch for it (`LimitFinder.java:138-139`), now ported.
- **Impact**: a new image drawing a shape the description renderer never drew before can crash the ink walk; check `LimitFinder.ts`'s dispatch against `LimitFinder.java:108-151` when one appears.
- **Confidence**: High

## Observation: a core Bodier port can already exist under cucadiagram/
- **Context**: dei-T3a drafted `src/core/command/BodierMap.ts` before finding `src/core/cucadiagram/BodierMap.ts` (and `BodierJSon.ts`), full ports with a deferred `getBody`.
- **Finding**: their `getBody` takes the opaque abel `Style`/`FontConfiguration` brands (`Bodier.ts`), so it cannot build a real text block; `BodierMap#getMap` was added to hand the table to the new `TextBlockMap`.
- **Impact**: grep `docs/catalog.md` for the upstream class name, not a guessed path, before porting a body.
- **Confidence**: High

## Observation: null-usymbol groups have no magnetic border
- **Context**: dei-T5 probe, an edge to a `domain { }` group.
- **Finding**: `Cluster.getMagneticBorder` returns `MagneticBorderNone` for a group with no usymbol that is not `GroupType.PACKAGE` (`Cluster.java:728-729`). The core `Cluster` port honours `symbol: null`; description must pass it (`renderer-cluster.ts#buildCluster`, `groupType`).
- **Impact**: any future description group created through `gotoGroup(..., null usymbol)` must reach `Cluster` with a null symbol, or edges to it clip at the package tab.
- **Confidence**: High
