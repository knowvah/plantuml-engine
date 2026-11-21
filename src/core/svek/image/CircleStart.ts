/**
 * `CircleStart` — the filled start circle of a legacy activity diagram.
 *
 * Reads `BackGroundColor` and `LineColor` (the entity's own colours win), the shadowing and the stroke of the
 * style it is given. The commented-out `ColorType.BACK` override upstream is not ported. A state `<<junction>>`
 * (upstream `a0a410773aa`, #2905) draws the same circle at {@link JUNCTION_SIZE}.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/CircleStart.java:49-96
 */
import type { Colors } from '../../abel/Colors.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { UEllipse } from '../../klimt/shape/UEllipse.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import type { ISkinParamWithSimple } from '../../abel/ISkinParam.js';
import type { Style } from '../../style/Style.js';
import { applyBack, applyFore, colorsGetColor } from './leaf-image-support.js';

/** @see CircleStart.java:52 */
const SIZE = 20;

/** UML 2.5.1 draws the junction pseudostate smaller than the initial one. @see CircleStart.java:54-57 */
export const JUNCTION_SIZE = 12;

/** @see CircleStart.java:49 */
export class CircleStart implements TextBlock {
  private readonly skinParam: Pick<ISkinParamWithSimple, 'getIHtmlColorSet'>;
  private readonly style: Style;
  private readonly colors: Colors;
  private readonly size: number;

  /** Only `getIHtmlColorSet()` is read off the skin param. Upstream's 3-arg constructor is the
   *  `junction = false` default. @see CircleStart.java:64-73 */
  constructor(
    skinParam: Pick<ISkinParamWithSimple, 'getIHtmlColorSet'>,
    style: Style,
    colors: Colors,
    junction = false,
  ) {
    this.style = style;
    this.colors = colors;
    this.skinParam = skinParam;
    this.size = junction ? JUNCTION_SIZE : SIZE;
  }

  /** @see CircleStart.java:75-78 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(this.size, this.size);
  }

  /** @see CircleStart.java:80-94 */
  drawU(ug: UGraphic): void {
    const circle = UEllipse.build(this.size, this.size);

    const backColor = colorsGetColor(this.colors, this.style, 'BackGroundColor', this.skinParam.getIHtmlColorSet());
    const lineColor = colorsGetColor(this.colors, this.style, 'LineColor', this.skinParam.getIHtmlColorSet());

    const shadowing = this.style.getShadowing();

    circle.setDeltaShadow(shadowing);
    applyBack(applyFore(ug, lineColor), backColor).apply(this.style.getStroke()).draw(circle);
  }
}
