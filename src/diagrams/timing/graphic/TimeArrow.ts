import type { Display } from '../../../core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../../core/klimt/geom/HorizontalAlignment.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import type { UDrawable } from '../../../core/klimt/shape/UDrawable.js';
import { UPolygon } from '../../../core/klimt/shape/UPolygon.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { WithLinkType } from '../../../core/decoration/WithLinkType.js';
import type { Style } from '../../../core/style/Style.js';
import type { StyleBuilder } from '../../../core/style/StyleBuilder.js';
import { back, createDisplay, fore, specificColorOf, timingStyleFrom, type TimingSkinParam } from '../timing-klimt.js';
import type { IntricatedPoint } from './IntricatedPoint.js';

/** `onCircle`'s radius (TimeArrow.java:107). */
const RADIUS = 8;
/** The head's half opening, 20 degrees (TimeArrow.java:127). */
const HEAD_DELTA = (20.0 * Math.PI) / 180.0;

/**
 * The arrow of a `TimeMessage`, from one player's state to another's, with the label at its head.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/TimeArrow.java:55-158
 */
export class TimeArrow implements UDrawable {
  readonly #start: XPoint2D;
  readonly #end: XPoint2D;
  readonly #label: Display;
  readonly #skinParam: TimingSkinParam;
  readonly #styleBuilder: StyleBuilder;
  readonly #type: WithLinkType;

  /** java:64-71: the shortest of the four start/end combinations of the two intricated points. */
  public static create(
    pt1: IntricatedPoint,
    pt2: IntricatedPoint,
    label: Display,
    spriteContainer: TimingSkinParam,
    type: WithLinkType,
  ): TimeArrow {
    const arrow1 = new TimeArrow(pt1.getPointA(), pt2.getPointA(), label, spriteContainer, type);
    const arrow2 = new TimeArrow(pt1.getPointA(), pt2.getPointB(), label, spriteContainer, type);
    const arrow3 = new TimeArrow(pt1.getPointB(), pt2.getPointA(), label, spriteContainer, type);
    const arrow4 = new TimeArrow(pt1.getPointB(), pt2.getPointB(), label, spriteContainer, type);
    return TimeArrow.#shorter4(arrow1, arrow2, arrow3, arrow4);
  }

  /** java:73-80 */
  private constructor(start: XPoint2D, end: XPoint2D, label: Display, skinParam: TimingSkinParam, type: WithLinkType) {
    this.#start = start;
    this.#type = type;
    this.#end = end;
    this.#label = label;
    this.#skinParam = skinParam;
    this.#styleBuilder = skinParam.getCurrentStyleBuilder();
  }

  /** java:82-84: `atan2(dx, dy)`, x first. */
  #getAngle(): number {
    return Math.atan2(this.#end.getX() - this.#start.getX(), this.#end.getY() - this.#start.getY());
  }

  /** java:86-91: the first arrow unless it is not strictly shorter. */
  static #shorter2(arrow1: TimeArrow, arrow2: TimeArrow): TimeArrow {
    if (arrow1.#len() < arrow2.#len()) return arrow1;
    return arrow2;
  }

  /** java:93-95 */
  static #shorter4(arrow1: TimeArrow, arrow2: TimeArrow, arrow3: TimeArrow, arrow4: TimeArrow): TimeArrow {
    return TimeArrow.#shorter2(TimeArrow.#shorter2(arrow1, arrow2), TimeArrow.#shorter2(arrow3, arrow4));
  }

  /** java:97-99 */
  #len(): number {
    return this.#start.distance(this.#end);
  }

  /** java:101-104 */
  public translate(translate: UTranslate): TimeArrow {
    return new TimeArrow(
      moved(translate, this.#start),
      moved(translate, this.#end),
      this.#label,
      this.#skinParam,
      this.#type,
    );
  }

  /** java:106-111 */
  public static onCircle(pt: XPoint2D, alpha: number): XPoint2D {
    const x = pt.getX() - Math.sin(alpha) * RADIUS;
    const y = pt.getY() - Math.cos(alpha) * RADIUS;
    return new XPoint2D(x, y);
  }

  /** java:117-145 */
  public drawU(ug: UGraphic): void {
    const angle = this.#getAngle();
    const color = specificColorOf(this.#type.getSpecificColor());
    // `type.getSpecificColor().bg()` (java:132) throws on `null`.
    if (color === undefined) throw new Error('java.lang.NullPointerException');

    ug = ug.apply(fore(color)).apply(this.#type.getUStroke());
    const line = new ULine(this.#end.getX() - this.#start.getX(), this.#end.getY() - this.#start.getY());
    ug.apply(UTranslate.point(this.#start)).draw(line);

    const pt1 = TimeArrow.onCircle(this.#end, angle + HEAD_DELTA);
    const pt2 = TimeArrow.onCircle(this.#end, angle - HEAD_DELTA);

    const polygon = new UPolygon();
    polygon.addPoint(pt1.getX(), pt1.getY());
    polygon.addPoint(pt2.getX(), pt2.getY());
    polygon.addPoint(this.#end.getX(), this.#end.getY());

    ug = ug.apply(back(color));
    ug.draw(polygon);

    const textLabel = this.#getTextBlock(this.#label);
    const xText = (pt1.getX() + pt2.getX()) / 2;
    let yText = (pt1.getY() + pt2.getY()) / 2;
    if (this.#start.getY() < this.#end.getY()) {
      const dimLabel = textLabel.calculateDimension(ug.getStringBounder());
      yText -= dimLabel.getHeight();
    }
    textLabel.drawU(ug.apply(new UTranslate(xText, yText)));
  }

  /** java:113-115 and 147-149: the label in the `arrow` font, left aligned. */
  #getTextBlock(display: Display): TextBlock {
    return createDisplay(display, this.#getStyle(), this.#skinParam, HorizontalAlignment.LEFT);
  }

  /** java:151-158: `root, element, timingDiagram, arrow` against the builder kept at construction. */
  #getStyle(): Style {
    return timingStyleFrom(this.#styleBuilder, 'arrow');
  }
}

/** `UTranslate#getTranslated(XPoint2D)` answering an `XPoint2D`. */
function moved(translate: UTranslate, p: XPoint2D): XPoint2D {
  return new XPoint2D(p.getX() + translate.getDx(), p.getY() + translate.getDy());
}
