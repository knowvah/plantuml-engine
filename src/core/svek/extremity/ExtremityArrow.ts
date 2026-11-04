import type { UGraphic } from '../../klimt/UGraphic.js';
import type { Point2D } from '../../klimt/UTranslate.js';
import { Back } from '../../klimt/Back.js';
import { UPolygon } from '../../klimt/shape/UPolygon.js';
import { ULine } from '../../klimt/shape/ULine.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import { Extremity } from './Extremity.js';
import type { ExtremityFactory } from './ExtremityFactory.js';
import type { Side } from './Side.js';
import { rotateAndTranslate } from './rotate-point.js';

/**
 * ExtremityArrow — the small filled arrowhead for `LinkDecor.ARROW`
 * (`<`/`>` — the default arrow on a plain `-->`/`<--` link: the trailing
 * `>`/`<` character in a bare arrow body IS one of `ARROW`'s decor
 * tokens, so an ordinary `a --> b` always resolves to this class, not
 * to a "no decor" case).
 *
 * Upstream: svek/extremity/ExtremityArrow.java +
 * ExtremityFactoryArrow.java. Ported: the single-point constructor
 * (`ExtremityArrow(XPoint2D p0, double angle)` — the only one
 * `ExtremityFactoryArrow#createUDrawable` calls), `buildPolygon`,
 * `drawU`, `getDecorationLength`.
 *
 * NOT ported (reachable-set cut):
 * - The two-point constructor `ExtremityArrow(XPoint2D p1, double
 *   angle, XPoint2D center)` + its `line`/`ULine` field — only used by
 *   `createTBRDrawableLegacy`, dead under `LinkStrategy.SIMPLEST`.
 * - `drawLineIfTransparent(ug)` — only called from `SvekEdge
 *   #drawRainbow`'s `headColor.isTransparent()` branch, which requires
 *   a skinparam `arrowHeadColor` distinct from the line color (this
 *   port's simplified `SvekEdgeInput` carries one `color` for both, so
 *   that branch never triggers).
 */
export class ExtremityArrow extends Extremity {
  private readonly polygon: UPolygon;

  constructor(p0: Point2D, angleIn: number) {
    super();
    const angle = this.manageround(angleIn);
    const xWing = 9;
    const yAperture = 4;
    const xContact = 5;
    const local: Point2D[] = [
      { x: 0, y: 0 },
      { x: -xWing, y: -yAperture },
      { x: -xContact, y: 0 },
      { x: -xWing, y: yAperture },
      { x: 0, y: 0 },
    ];
    this.polygon = new UPolygon(local.map((pt) => rotateAndTranslate(pt, angle, p0)));
  }

  drawU(ug: UGraphic): void {
    const color = ug.getParam().getColor();
    ug.apply(new Back(color)).draw(this.polygon);
  }

  override getDecorationLength(): number {
    return 5;
  }

  /** `SvekEdge#drawRainbow` draws this instead of the polygon when the head colour is
   *  transparent: the line from the tip to the contact point.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/extremity/ExtremityArrow.java:106-112 */
  drawLineIfTransparent(ug: UGraphic): void {
    const pt1 = this.polygon.getPoint(0);
    const pt2 = this.polygon.getPoint(2);
    const line = ULine.create(pt1, pt2);
    ug.apply(new UTranslate(pt1.x, pt1.y)).draw(line);
  }
}

/** Upstream: svek/extremity/ExtremityFactoryArrow.java. */
export class ExtremityFactoryArrow implements ExtremityFactory {
  createUDrawable(p0: Point2D, angle: number, _side: Side | null): ExtremityArrow {
    return new ExtremityArrow(p0, angle);
  }
}
