/**
 * `ETileNot`: `- x`, the text `NOT` before the tile, on its track.
 *
 * `style`, `colorSet` and `skinParam` are stored and never read, as upstream.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileNot.java:48-101
 */
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { ETile } from './ETile.js';

/** @see ETileNot.java:50 */
const MARGIN_X1 = 3;
/** @see ETileNot.java:51 */
const MARGIN_X2 = 8;

export class ETileNot extends ETile {
  private readonly orig: ETile;
  private readonly utext: UText;

  /** @see ETileNot.java:59-66 */
  constructor(orig: ETile, fc: FontConfiguration, _style: Style, _colorSet: HColorSet, _skinParam: SkinParam) {
    super();
    this.orig = orig;
    this.utext = UText.build('NOT', fc);
  }

  /** @see ETileNot.java:68-71 */
  getH1(stringBounder: StringBounder): number {
    return this.orig.getH1(stringBounder);
  }

  /** @see ETileNot.java:73-76 */
  getH2(stringBounder: StringBounder): number {
    return this.orig.getH2(stringBounder);
  }

  /** @see ETileNot.java:78-82 */
  getWidth(stringBounder: StringBounder): number {
    const dimText = this.utext.calculateDimension(stringBounder);
    return this.orig.getWidth(stringBounder) + dimText.getWidth() + MARGIN_X2;
  }

  /** @see ETileNot.java:84-94 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dimText = this.utext.calculateDimension(stringBounder);

    ug.apply(new UTranslate(MARGIN_X1, this.getH1(stringBounder) + this.utext.getDescent(stringBounder) + 1)).draw(
      this.utext,
    );

    this.orig.drawU(ug.apply(UTranslate.dx(dimText.getWidth() + MARGIN_X2)));
  }

  /** @see ETileNot.java:96-99 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
