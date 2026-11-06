/**
 * The mid-link decoration (`-0)-` and its three siblings), for every engine that draws one (D5 of
 * description-divergence-drive): `LinkMiddleDecor#getMiddleFactory`'s `MiddleCircle` and `MiddleCircleCircled`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/extremity/MiddleCircle.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/extremity/MiddleCircleCircled.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/decoration/LinkMiddleDecor.java:49-60
 */
import type { UGraphic } from '../../klimt/UGraphic.js';
import { Back } from '../../klimt/Back.js';
import { Fore } from '../../klimt/Fore.js';
import { UStroke } from '../../klimt/UStroke.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import { UEllipse } from '../../klimt/shape/UEllipse.js';
import type { Paint } from '../../paint.js';

/** `decoration/LinkMiddleDecor.java`'s four INSIDE-reachable members; `NONE` is `undefined` (`CommandLinkElement.java:149-157`). */
export type MiddleDecor = 'circle' | 'circleCircled' | 'circleCircled1' | 'circleCircled2';

/** `SvekEdge.java:353-356`: `labelShield` when the link has a middle decor. */
export const LABEL_SHIELD = 7;

/** `MiddleCircle`/`MiddleCircleCircled`'s two hardcoded radii: `radius1 = 6`, `radius2 = 10`. */
const MIDDLE_RADIUS_INNER = 6;
const MIDDLE_RADIUS_OUTER = 10;
/** Their own `UStroke.withThickness(1.5)`, independent of the edge's stroke. */
const MIDDLE_STROKE_WIDTH = 1.5;

/**
 * `MiddleCircleCircled#drawU`/`MiddleCircle#drawU`: the arc(s) for the three `CIRCLE_CIRCLED*` members, then the
 * always-drawn filled inner circle. `base` carries the line colour and the translate to the path's middle; `angle` is
 * upstream's `angleDeg - 45` (`SvekEdge.java:984-987`).
 */
export function drawMiddleDecor(
  base0: UGraphic,
  middleDecor: MiddleDecor,
  angle: number,
  colors: { readonly backColor: Paint; readonly diagramBackColor: Paint },
): void {
  const base = base0.apply(UStroke.withThickness(MIDDLE_STROKE_WIDTH)).apply(new Back(colors.backColor));
  const outer = new UTranslate(-MIDDLE_RADIUS_OUTER, -MIDDLE_RADIUS_OUTER);
  if (middleDecor === 'circleCircled') {
    const bigCircle = UEllipse.build(2 * MIDDLE_RADIUS_OUTER, 2 * MIDDLE_RADIUS_OUTER);
    // `MiddleCircleCircled.java:71-73`: drawn BEFORE `:76-77` applies the back colour and the 1.5 stroke.
    base0
      .apply(new Fore(colors.diagramBackColor))
      .apply(new Back(colors.diagramBackColor))
      .apply(outer)
      .draw(bigCircle);
  }
  if (middleDecor === 'circleCircled' || middleDecor === 'circleCircled1') {
    const arc1 = new UEllipse(2 * MIDDLE_RADIUS_OUTER, 2 * MIDDLE_RADIUS_OUTER, angle, 90);
    base.apply(new Back('none')).apply(outer).draw(arc1);
  }
  if (middleDecor === 'circleCircled' || middleDecor === 'circleCircled2') {
    const arc2 = new UEllipse(2 * MIDDLE_RADIUS_OUTER, 2 * MIDDLE_RADIUS_OUTER, angle + 180, 90);
    base.apply(new Back('none')).apply(outer).draw(arc2);
  }
  base
    .apply(new UTranslate(-MIDDLE_RADIUS_INNER, -MIDDLE_RADIUS_INNER))
    .draw(UEllipse.build(2 * MIDDLE_RADIUS_INNER, 2 * MIDDLE_RADIUS_INNER));
}
