/**
 * `ETileWithCircles`: a rule's body between its start circle (open, stroke 2) and end circle (filled, stroke 1),
 * 30 px of directed track each side.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileWithCircles.java:47-98
 */
import { CopyForegroundColorToBackgroundColor } from '../../core/klimt/CopyForegroundColorToBackgroundColor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { UEllipse } from '../../core/klimt/shape/UEllipse.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { fore } from './ebnf-klimt.js';
import { ETile } from './ETile.js';

/** @see ETileWithCircles.java:49 */
const SIZE = 8;
/** @see ETileWithCircles.java:51 */
const DELTAX = 30;
/** `drawHlineDirected(…, 0.5, 25)`. @see ETileWithCircles.java:89-90 */
const LEAD_ARROW = { coef: 0.5, minimunSizeForArrow: 25 } as const;

export class ETileWithCircles extends ETile {
  private readonly orig: ETile;
  private readonly lineColor: HColor;

  /** @see ETileWithCircles.java:55-58 */
  constructor(orig: ETile, lineColor: HColor) {
    super();
    this.orig = orig;
    this.lineColor = lineColor;
  }

  /** @see ETileWithCircles.java:60-63 */
  getWidth(stringBounder: StringBounder): number {
    return this.orig.getWidth(stringBounder) + 2 * DELTAX;
  }

  /** @see ETileWithCircles.java:65-68 */
  getH1(stringBounder: StringBounder): number {
    return this.orig.getH1(stringBounder);
  }

  /** @see ETileWithCircles.java:70-73 */
  getH2(stringBounder: StringBounder): number {
    return this.orig.getH2(stringBounder);
  }

  /** @see ETileWithCircles.java:75-91 */
  drawU(ugIn: UGraphic): void {
    const linePos = this.getH1(ugIn.getStringBounder());
    const fullDim = this.calculateDimension(ugIn.getStringBounder());
    let ug = ugIn.apply(fore(this.lineColor)).apply(UStroke.withThickness(1.5));
    this.orig.drawU(ug.apply(UTranslate.dx(DELTAX)));

    const circle = UEllipse.build(SIZE, SIZE);

    ug.apply(UStroke.withThickness(2))
      .apply(new UTranslate(0, linePos - SIZE / 2))
      .draw(circle);
    ug.apply(UStroke.withThickness(1))
      .apply(new CopyForegroundColorToBackgroundColor())
      .apply(new UTranslate(fullDim.getWidth() - SIZE / 2, linePos - SIZE / 2))
      .draw(circle);

    ug = ug.apply(UStroke.withThickness(1.5));
    this.drawHlineDirected(ug, linePos, SIZE, DELTAX, LEAD_ARROW);
    this.drawHlineDirected(ug, linePos, fullDim.getWidth() - DELTAX, fullDim.getWidth() - SIZE / 2, LEAD_ARROW);
  }

  /** @see ETileWithCircles.java:93-96 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
