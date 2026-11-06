/**
 * `SvekEdge#manageCollision` (`svek/SvekEdge.java:1205-1218`): a quantifier that overlaps a node, plus a margin of 8, is
 * moved away from it. Node ORDER is load-bearing: the loop reassigns the label as it goes, so a label pushed clear of one
 * node can be pushed again by a later one.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java:466-475
 */
import type { Positionable } from '../klimt/geom/Positionable.js';
import { PositionableImpl } from '../klimt/geom/PositionableImpl.js';
import { addMargin, intersect, moveAwayFrom } from '../klimt/geom/PositionableUtils.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';

/** `PositionableUtils.addMargin(sh, 8, 8)`, `SvekEdge.java:1207`. */
const PORT_LABEL_COLLISION_MARGIN = 8;

export function manageCollision(
  box: Positionable,
  nodes: readonly { readonly x: number; readonly y: number; readonly width: number; readonly height: number }[],
): Positionable {
  let current = box;
  for (const n of nodes) {
    const sh = new PositionableImpl(n.x, n.y, new XDimension2D(n.width, n.height));
    const cl = addMargin(sh, PORT_LABEL_COLLISION_MARGIN, PORT_LABEL_COLLISION_MARGIN);
    if (intersect(cl, current)) current = moveAwayFrom(cl, current);
  }
  return current;
}
