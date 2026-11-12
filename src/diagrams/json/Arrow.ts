import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';

/** The half-width of the arrow base, as a fraction of its length. @see Arrow.java:61 */
const FACTOR = 0.4;
/** How far the notch sits from `p1`, as a fraction of the length. @see Arrow.java:62 */
const FACTOR2 = 0.3;

/**
 * Arrow — the notched arrowhead from `p1` (the curve's last point) to `p2`
 * (the engine's arrow point), drawn as one `UPath` through `UGraphic`.
 *
 * Ported for `GitCurve` (gip D3). `JsonCurve.ts` re-derives the same
 * arithmetic as SVG path strings and is deliberately left untouched.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/jsondiagram/Arrow.java:43-87
 */
export class Arrow {
  /** @see Arrow.java:45-46 */
  private readonly p1: XPoint2D;
  private readonly p2: XPoint2D;

  /** @see Arrow.java:48-51 */
  constructor(p1: XPoint2D, p2: XPoint2D) {
    this.p1 = p1;
    this.p2 = p2;
  }

  /**
   * `p4 → p11 → p3 → p2 → p4`, filled by whatever background the caller
   * applied. `closePath` is a no-op in the port as upstream.
   * @see Arrow.java:53-78
   */
  drawArrow(ug: UGraphic): void {
    ug = ug.apply(UStroke.simple());
    const p1p2 = ULine.create(this.p1, this.p2);
    const dist = this.p1.distance(this.p2);
    const alpha = Math.atan2(p1p2.getDX(), p1p2.getDY());
    const p3 = Arrow.getPoint(this.p1, alpha + Math.PI / 2, dist * FACTOR);
    const p4 = Arrow.getPoint(this.p1, alpha - Math.PI / 2, dist * FACTOR);
    const p11 = Arrow.getPoint(this.p1, alpha, dist * FACTOR2);
    const path = UPath.none();
    path.moveTo(p4);
    path.lineTo(p11);
    path.lineTo(p3);
    path.lineTo(this.p2);
    path.lineTo(p4);
    path.closePath();
    ug.draw(path);
  }

  /** `sin` on x, `cos` on y: `alpha` is measured from the y axis. @see Arrow.java:80-84 */
  private static getPoint(center: XPoint2D, alpha: number, len: number): XPoint2D {
    const x = center.getX() + len * Math.sin(alpha);
    const y = center.getY() + len * Math.cos(alpha);
    return new XPoint2D(x, y);
  }
}
