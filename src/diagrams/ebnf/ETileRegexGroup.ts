/**
 * `ETileRegexGroup`: a regex character class `[abc]` — its elements stacked in one dashed box, a 0.3 rule between
 * two, centred in the tile.
 *
 * Unreachable from EBNF (eep D4): only `regexdiagram/PSystemRegex.java:201` constructs it, for #126.
 * `skinParam` is stored and never read; `backgroundColor` is computed and unused, as upstream.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileRegexGroup.java:54-144
 */
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { fore } from './ebnf-klimt.js';
import { ETile } from './ETile.js';

/** The box is the text plus 5 left and right. @see ETileRegexGroup.java:88, :103 */
const BOX_MARGIN = 10;
/** `new UStroke(5, 5, 1)`. @see ETileRegexGroup.java:118 */
const DASHED = new UStroke(5, 5, 1);
/** `UStroke.withThickness(0.3)`, the rule between two elements. @see ETileRegexGroup.java:128 */
const RULE_THICKNESS = 0.3;
/** `drawHlineDirected(…, .5, 25)`. @see ETileRegexGroup.java:133-134 */
const SIDE_ARROW = { coef: 0.5, minimunSizeForArrow: 25 } as const;

/** Widest element by summed height. @see ETileRegexGroup.java:91-100 (and `ETileRegexGroupAllBut.java:92-101`) */
export function getTextDim(
  elements: readonly string[],
  fc: FontConfiguration,
  stringBounder: StringBounder,
): XDimension2D {
  let width = 0;
  let height = 0;
  for (const element of elements) {
    const dim = stringBounder.calculateDimension(fc, element);
    width = Math.max(width, dim.getWidth());
    height += dim.getHeight();
  }
  return new XDimension2D(width, height);
}

export class ETileRegexGroup extends ETile {
  private readonly elements: readonly string[];
  private readonly fc: FontConfiguration;
  private readonly style: Style;
  private readonly colorSet: HColorSet;

  /** @see ETileRegexGroup.java:62-69 */
  constructor(
    elements: readonly string[],
    fc: FontConfiguration,
    style: Style,
    colorSet: HColorSet,
    _skinParam: SkinParam,
  ) {
    super();
    this.elements = elements;
    this.fc = fc;
    this.style = style;
    this.colorSet = colorSet;
  }

  /** @see ETileRegexGroup.java:71-74 */
  private getPureH1(stringBounder: StringBounder): number {
    const height = this.getTextDim(stringBounder).getHeight();
    return height / 2;
  }

  /** @see ETileRegexGroup.java:76-79 */
  getH1(stringBounder: StringBounder): number {
    return this.getPureH1(stringBounder);
  }

  /** @see ETileRegexGroup.java:81-84 */
  getH2(stringBounder: StringBounder): number {
    return this.getPureH1(stringBounder);
  }

  /** @see ETileRegexGroup.java:86-89 */
  getWidth(stringBounder: StringBounder): number {
    return this.getTextDim(stringBounder).getWidth() + BOX_MARGIN;
  }

  /** @see ETileRegexGroup.java:91-100 */
  private getTextDim(stringBounder: StringBounder): XDimension2D {
    return getTextDim(this.elements, this.fc, stringBounder);
  }

  /** @see ETileRegexGroup.java:102-104 */
  private getBoxDim(stringBounder: StringBounder): XDimension2D {
    return this.getTextDim(stringBounder).delta(BOX_MARGIN, 0);
  }

  /** @see ETileRegexGroup.java:106-137 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dim = this.calculateDimension(stringBounder);
    const dimBox = this.getBoxDim(stringBounder);
    const lineColor = this.style.value('LineColor').asColor(this.colorSet);

    const posxBox = (dim.getWidth() - dimBox.getWidth()) / 2;

    const rect = URectangle.build(dimBox.getWidth(), dimBox.getHeight());
    ug.apply(new UTranslate(posxBox, 0)).apply(fore(lineColor)).apply(DASHED).draw(rect);

    let y = 0;
    for (const element of this.elements) {
      const utext = UText.build(element, this.fc);
      const dimElement = utext.calculateDimension(stringBounder);

      ug.apply(new UTranslate(5 + posxBox, y + dimElement.getHeight() - utext.getDescent(stringBounder))).draw(utext);
      if (y > 0) this.drawHline(ug.apply(UStroke.withThickness(RULE_THICKNESS)), y, 0, dimBox.getWidth());
      y += dimElement.getHeight();
    }

    if (posxBox > 0) {
      this.drawHlineDirected(ug, this.getH1(stringBounder), 0, posxBox, SIDE_ARROW);
      this.drawHlineDirected(ug, this.getH1(stringBounder), posxBox + dimBox.getWidth(), dim.getWidth(), SIDE_ARROW);
    }
  }

  /** @see ETileRegexGroup.java:139-142 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
