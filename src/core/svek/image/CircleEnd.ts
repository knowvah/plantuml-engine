/**
 * `CircleEnd` — the end circle of a legacy activity diagram: an empty ring and a filled 12×12 core.
 *
 * `HColors.middle(lineColor, backColor)` (`HColorMiddle`, a lazy mean of the two mapped colours) is not ported:
 * it is only reached when the two colours are equal, where the mean of a colour with itself is that colour, so
 * {@link middleOfEqual} answers the colour itself. The one input that differs is a fully transparent pair:
 * upstream's `new XColor(r, g, b)` makes the mean opaque (black); the port keeps the colour. Dark-mode
 * mapping of that pair belongs to T3b.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/CircleEnd.java:49-105
 */
import type { Colors } from '../../abel/Colors.js';
import type { ISkinParamWithSimple } from '../../abel/ISkinParam.js';
import { HColorSimple } from '../../klimt/color/HColorSimple.js';
import { HColors } from '../../klimt/color/HColors.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { UEllipse } from '../../klimt/shape/UEllipse.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import type { Style } from '../../style/Style.js';
import { applyBack, applyFore, colorsGetColor, type PaintColor } from './leaf-image-support.js';

/** @see CircleEnd.java:51 */
const SIZE = 22;
/** The inset of the filled core. @see CircleEnd.java:81 */
const DELTA = 5;

/** `lineColor.equals(backColor)`; `HColor#equals` is structural on a simple colour. @see CircleEnd.java:87 */
function sameColor(a: PaintColor, b: PaintColor): boolean {
  return a instanceof HColorSimple ? a.equals(b) : a === b; // HColorGradient has no equals: identity
}

/** `HColors.middle(c, c)`, see the module comment. @see CircleEnd.java:88 */
function middleOfEqual(color: PaintColor): PaintColor {
  return color;
}

/** @see CircleEnd.java:49 */
export class CircleEnd implements TextBlock {
  private readonly skinParam: Pick<ISkinParamWithSimple, 'getIHtmlColorSet'>;
  private readonly style: Style;
  private readonly colors: Colors;

  /** @see CircleEnd.java:57-61 */
  constructor(skinParam: Pick<ISkinParamWithSimple, 'getIHtmlColorSet'>, style: Style, colors: Colors) {
    this.style = style;
    this.colors = colors;
    this.skinParam = skinParam;
  }

  /** @see CircleEnd.java:63-66 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(SIZE, SIZE);
  }

  /** @see CircleEnd.java:68-102 */
  drawU(ug: UGraphic): void {
    const circle = UEllipse.build(SIZE, SIZE);

    const set = this.skinParam.getIHtmlColorSet();
    const backColor = colorsGetColor(this.colors, this.style, 'BackGroundColor', set);
    const lineColor = colorsGetColor(this.colors, this.style, 'LineColor', set);

    const shadowing = this.style.getShadowing();

    circle.setDeltaShadow(shadowing);
    applyFore(applyBack(ug, HColors.none()), lineColor).apply(this.style.getStroke()).draw(circle);

    const circleSmall = UEllipse.build(SIZE - DELTA * 2, SIZE - DELTA * 2);

    // "This is *really* weird, but because of anti-aliasing we have to use middle color when lineColor and
    // backColor are the same (!)" (CircleEnd.java:84-85)
    let small = applyBack(ug, backColor);
    small = applyFore(small, sameColor(lineColor, backColor) ? middleOfEqual(lineColor) : lineColor);
    small.apply(new UTranslate(DELTA, DELTA)).draw(circleSmall);
  }
}
