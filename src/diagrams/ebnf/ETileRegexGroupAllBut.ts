/**
 * `ETileRegexGroupAllBut`: a negated character class `[^abc]` — the first element (the `^` marker the regex engine
 * puts first) in an open bracket at the left, the rest stacked in a dashed box at the right.
 *
 * Unreachable from EBNF (eep D4): only `regexdiagram/PSystemRegex.java:199` constructs it, for #126.
 * `skinParam` is accepted and unread; the commented-out side arrows are not ported.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileRegexGroupAllBut.java:54-156
 */
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { UPath } from '../../core/klimt/shape/UPath.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { fore } from './ebnf-klimt.js';
import { ETile } from './ETile.js';
import { getTextDim } from './ETileRegexGroup.js';

/** The two lists' padding. @see ETileRegexGroupAllBut.java:89, :110, :113, :138 */
const LIST_MARGIN = 10;
/** `new UStroke(5, 5, 1)`. @see ETileRegexGroupAllBut.java:123 */
const DASHED = new UStroke(5, 5, 1);
/** `UStroke.withThickness(0.3)`. @see ETileRegexGroupAllBut.java:146 */
const RULE_THICKNESS = 0.3;

export class ETileRegexGroupAllBut extends ETile {
  private readonly elements1: readonly string[];
  private readonly elements2: readonly string[];
  private readonly fc: FontConfiguration;
  private readonly style: Style;
  private readonly colorSet: HColorSet;

  /** `elements.subList(0, 1)` and `subList(1, size)`. @see ETileRegexGroupAllBut.java:62-69 */
  constructor(
    elements: readonly string[],
    fc: FontConfiguration,
    style: Style,
    colorSet: HColorSet,
    _skinParam: SkinParam,
  ) {
    super();
    if (elements.length < 1) throw new Error('IndexOutOfBoundsException');
    this.elements1 = elements.slice(0, 1);
    this.elements2 = elements.slice(1, elements.length);
    this.fc = fc;
    this.style = style;
    this.colorSet = colorSet;
  }

  /** @see ETileRegexGroupAllBut.java:71-75 */
  private getHalfHeight(stringBounder: StringBounder): number {
    const height1 = getTextDim(this.elements1, this.fc, stringBounder).getHeight();
    const height2 = getTextDim(this.elements2, this.fc, stringBounder).getHeight();
    return Math.max(height1, height2) / 2;
  }

  /** @see ETileRegexGroupAllBut.java:77-80 */
  getH1(stringBounder: StringBounder): number {
    return this.getHalfHeight(stringBounder);
  }

  /** @see ETileRegexGroupAllBut.java:82-85 */
  getH2(stringBounder: StringBounder): number {
    return this.getHalfHeight(stringBounder);
  }

  /** @see ETileRegexGroupAllBut.java:87-90 */
  getWidth(stringBounder: StringBounder): number {
    return (
      getTextDim(this.elements1, this.fc, stringBounder).getWidth() +
      getTextDim(this.elements2, this.fc, stringBounder).getWidth() +
      2 * LIST_MARGIN
    );
  }

  /** @see ETileRegexGroupAllBut.java:103-120 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dimTotal = this.calculateDimension(stringBounder);
    const dim1 = getTextDim(this.elements1, this.fc, stringBounder);
    const dim2 = getTextDim(this.elements2, this.fc, stringBounder);

    const lineColor = this.style.value('LineColor').asColor(this.colorSet);
    this.box(ug.apply(fore(lineColor)), dimTotal, dim1.delta(LIST_MARGIN, 0), dim2.delta(LIST_MARGIN, 0));

    this.drawList(ug.apply(UTranslate.dy((dimTotal.getHeight() - dim1.getHeight()) / 2)), this.elements1);
    this.drawList(ug.apply(UTranslate.dx(LIST_MARGIN + dim1.getWidth())), this.elements2);
  }

  /** @see ETileRegexGroupAllBut.java:122-134 */
  private box(ugIn: UGraphic, dimTotal: XDimension2D, dim1: XDimension2D, dim2: XDimension2D): void {
    const ug = ugIn.apply(DASHED);

    ug.apply(UTranslate.dx(dim1.getWidth())).draw(URectangle.build(dim2.getWidth(), dim2.getHeight()));

    const path = UPath.none();
    path.moveTo(dim1.getWidth(), 0);
    path.lineTo(0, 0);
    path.lineTo(0, dim1.getHeight());
    path.lineTo(dim1.getWidth(), dim1.getHeight());

    ug.apply(UTranslate.dy((dimTotal.getHeight() - dim1.getHeight()) / 2)).draw(path);
  }

  /** `totalWidth` reads `elements1` whichever list is drawn, as upstream. @see ETileRegexGroupAllBut.java:136-149 */
  private drawList(ug: UGraphic, elements: readonly string[]): void {
    const stringBounder = ug.getStringBounder();
    const totalWidth = LIST_MARGIN + getTextDim(this.elements1, this.fc, stringBounder).getWidth();
    let y = 0;
    for (const element of elements) {
      const utext = UText.build(element, this.fc);
      const dimElement = utext.calculateDimension(stringBounder);

      ug.apply(new UTranslate(5, y + dimElement.getHeight() - utext.getDescent(stringBounder))).draw(utext);
      if (y > 0) this.drawHline(ug.apply(UStroke.withThickness(RULE_THICKNESS)), y, 0, totalWidth);
      y += dimElement.getHeight();
    }
  }

  /** @see ETileRegexGroupAllBut.java:151-154 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
