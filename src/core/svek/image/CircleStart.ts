/**
 * `CircleStart` — the filled start circle of a legacy activity diagram.
 *
 * Reads `BackGroundColor` and `LineColor` (the entity's own colours win), the shadowing and the stroke of the
 * style it is given. The commented-out `ColorType.BACK` override upstream is not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/CircleStart.java:49-85
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

/** @see CircleStart.java:51 */
const SIZE = 20;

/** @see CircleStart.java:49 */
export class CircleStart implements TextBlock {
  private readonly skinParam: Pick<ISkinParamWithSimple, 'getIHtmlColorSet'>;
  private readonly style: Style;
  private readonly colors: Colors;

  /** Only `getIHtmlColorSet()` is read off the skin param. @see CircleStart.java:57-61 */
  constructor(skinParam: Pick<ISkinParamWithSimple, 'getIHtmlColorSet'>, style: Style, colors: Colors) {
    this.style = style;
    this.colors = colors;
    this.skinParam = skinParam;
  }

  /** @see CircleStart.java:63-66 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(SIZE, SIZE);
  }

  /** @see CircleStart.java:68-82 */
  drawU(ug: UGraphic): void {
    const circle = UEllipse.build(SIZE, SIZE);

    const backColor = colorsGetColor(this.colors, this.style, 'BackGroundColor', this.skinParam.getIHtmlColorSet());
    const lineColor = colorsGetColor(this.colors, this.style, 'LineColor', this.skinParam.getIHtmlColorSet());

    const shadowing = this.style.getShadowing();

    circle.setDeltaShadow(shadowing);
    applyBack(applyFore(ug, lineColor), backColor).apply(this.style.getStroke()).draw(circle);
  }
}
