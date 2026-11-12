import type { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { IllegalStateException } from '../../core/real/AbstractReal.js';
import type { HColor } from '../../core/style/Value.js';
import { Arrow } from '../json/Arrow.js';
import type { Mirror } from '../json/Mirror.js';
import { back } from './git-klimt.js';

/** `new UStroke(2, 2, 1)`: dash 2, space 2, thickness 1. @see GitCurve.java:88 */
const CURVE_DASH = 2;
const CURVE_SPACE = 2;
const CURVE_THICKNESS = 1;
/** A cubic segment is 3 points after the first. @see GitCurve.java:93 */
const CUBIC_STEP = 3;

/**
 * GitCurve — one edge: a dashed cubic path through the mirrored control
 * points, then the arrowhead filled with the line colour when the engine
 * reports an arrow point.
 *
 * The one signature change (gip T2b interface): the Java constructor reads an
 * `ST_Agedgeinfo_t`; this one takes the engine edge's control points and its
 * `ep`, both in the engine's y-up frame. `getLayout()` publishes one point list
 * per edge and no bezier count, so `splines.size != 1` is observable only as
 * the zero-bezier case: an empty list throws (gip D5), a multi-bezier edge
 * (compound edges, absent from this graph) cannot reach here. A missing `ep` arrives as `undefined`, the port's form
 * of the `(0,0)` sentinel (`GitCurve.java:74-77`); an `ep` at the origin is
 * read as absent too. `sp` is read upstream but never used, so it is not taken.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/GitCurve.java:48-108
 */
export class GitCurve {
  /** @see GitCurve.java:50 */
  private readonly points: readonly XPoint2D[];
  /** @see GitCurve.java:52 */
  private readonly xMirror: Mirror;
  /** @see GitCurve.java:55 */
  private readonly ep: XPoint2D | undefined;

  /**
   * A routed edge, else `IllegalStateException` (gip D5).
   * @see GitCurve.java:57-79
   */
  constructor(points: readonly XPoint2D[], ep: XPoint2D | undefined, xMirror: Mirror) {
    this.xMirror = xMirror;
    if (points.length === 0) throw new IllegalStateException();
    this.points = points;
    this.ep = ep === undefined || (ep.getX() === 0 && ep.getY() === 0) ? undefined : ep;
  }

  /** @see GitCurve.java:87-106 */
  drawCurve(color: HColor, ug: UGraphic): void {
    ug = ug.apply(new UStroke(CURVE_DASH, CURVE_SPACE, CURVE_THICKNESS));
    const path = UPath.none();
    path.moveTo(this.xMirror.invGit(this.points[0]!));
    for (let i = 1; i < this.points.length; i += CUBIC_STEP) {
      const pt2 = this.xMirror.invGit(this.points[i]!);
      const pt3 = this.xMirror.invGit(this.points[i + 1]!);
      const pt4 = this.xMirror.invGit(this.points[i + 2]!);
      path.cubicTo(pt2, pt3, pt4);
    }
    ug.draw(path);
    if (this.ep !== undefined) {
      const last = this.xMirror.invGit(this.points[this.points.length - 1]!);
      const trueEp = this.xMirror.invGit(this.ep);
      new Arrow(last, trueEp).drawArrow(ug.apply(back(color)));
    }
  }
}
