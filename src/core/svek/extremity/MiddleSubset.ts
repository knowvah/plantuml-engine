import type { UGraphic } from '../../klimt/UGraphic.js';
import { UEllipse } from '../../klimt/shape/UEllipse.js';
import { ULine } from '../../klimt/shape/ULine.js';
import { UStroke } from '../../klimt/UStroke.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import { Extremity } from './Extremity.js';

/** `radius`. @see MiddleSubset.java:47 */
const RADIUS = 6;
/** `length`. @see MiddleSubset.java:48 */
const LENGTH = 10;
/** `UStroke.withThickness(1.5)`. @see MiddleSubset.java:64 */
const STROKE_THICKNESS = 1.5;
/** `reverse ? -45 : 135`. @see MiddleSubset.java:66 */
const ROTATE_REVERSE = -45;
const ROTATE_FORWARD = 135;
/** The `extend` of the arc: a half circle. @see MiddleSubset.java:68 */
const ARC_EXTEND = 180;

/**
 * MiddleSubset — the half circle with two parallel bars Chen EER draws on a subclass link: `SUBSET` is
 * `reverse = false`, `SUPERSET` is `reverse = true` (`LinkMiddleDecor.java:63-66`). `somePoint()` is not ported
 * (`Extremity.ts`'s reachable-set note).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/extremity/MiddleSubset.java:45-82
 */
export class MiddleSubset extends Extremity {
  private readonly angle: number;
  private readonly reverse: boolean;

  /** @see MiddleSubset.java:53-56 */
  constructor(angle: number, reverse: boolean) {
    super();
    this.angle = angle;
    this.reverse = reverse;
  }

  /** @see MiddleSubset.java:63-75 */
  drawU(ug0: UGraphic): void {
    const ug = ug0.apply(UStroke.withThickness(STROKE_THICKNESS));

    const rotate = this.reverse ? ROTATE_REVERSE : ROTATE_FORWARD;

    ug.apply(new UTranslate(-RADIUS, -RADIUS)).draw(
      new UEllipse(2 * RADIUS, 2 * RADIUS, this.angle + rotate, ARC_EXTEND),
    );

    const sin = Math.sin(((this.angle + rotate) * Math.PI) / 180);
    const cos = Math.cos(((this.angle + rotate) * Math.PI) / 180);

    ug.apply(new UTranslate(RADIUS * cos, RADIUS * -sin)).draw(new ULine(LENGTH * sin, LENGTH * cos));
    ug.apply(new UTranslate(RADIUS * -cos, RADIUS * sin)).draw(new ULine(LENGTH * sin, LENGTH * cos));
  }

  /** @see MiddleSubset.java:77-80 */
  override getDecorationLength(): number {
    return RADIUS;
  }
}
