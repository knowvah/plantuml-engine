/**
 * hexagon-polygon.ts -- the svek node polygon of a `USymbols.HEXAGON` leaf, shared by the engines that draw
 * `EntityImageDescription#drawHexagon`. `diagrams/class/class-hexagon-leaf.ts` carries the full derivation and re-exports
 * this; it lives in core so `diagrams/description` need not import a sibling engine.
 *
 * `SvekNode#appendShapeInternal` emits `shape=hexagon` (`svek/SvekNode.java:337-338`), `DotStringFactory.java:414-420`
 * reads graphviz's `points=` back as the node polygon, and `EntityImageDescription.java:307-341` draws it. Graphviz's
 * vertex rule for `sides = 6` (`~/git/graphviz/lib/common/shapes.c:2221-2289`) gives, about the centre, `(+-w/2, 0)` and
 * `(+-w/4, +-h/2)`; the closing point repeats the first, as `points=` does. Each coordinate is read at graphviz's
 * printed precision (`gvprintdouble`'s `%.02f`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageDescription.java:307-341
 */
import type { Point2D } from '../klimt/UTranslate.js';
import { svgDouble } from '../graph-layout-svek-read.js';

/** The polygon of a `width` x `height` hexagon node, in the node's own frame (top-left at 0,0), closing point included. */
export function hexagonPolygonPoints(width: number, height: number): Point2D[] {
  const pt = (x: number, y: number): Point2D => ({ x: svgDouble(x), y: svgDouble(y) });
  const midY = height / 2;
  return [
    pt(width, midY),
    pt((width * 3) / 4, 0),
    pt(width / 4, 0),
    pt(0, midY),
    pt(width / 4, height),
    pt((width * 3) / 4, height),
    pt(width, midY),
  ];
}
