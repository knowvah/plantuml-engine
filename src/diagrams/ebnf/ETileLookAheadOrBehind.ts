/**
 * `ETileLookAheadOrBehind`: a regex lookaround `(?=x)`, `(?!x)`, `(?<=x)`, `(?<!x)` — `x` inside a dotted rounded
 * frame, the lookaround's sign (`type`) at its left.
 *
 * Unreachable from EBNF (eep D4): only `regexdiagram/PSystemRegex.java:206` constructs it, for #126.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileLookAheadOrBehind.java:51-110
 */
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { fore } from './ebnf-klimt.js';
import { ETile } from './ETile.js';

/** @see ETileLookAheadOrBehind.java:55 */
const DELTAX1 = 4;
/** @see ETileLookAheadOrBehind.java:56 */
const DELTAX2 = 8;
/** @see ETileLookAheadOrBehind.java:57 */
const DELTAY = 6;
/** `rounded(30)`. @see ETileLookAheadOrBehind.java:94 */
const FRAME_ROUND = 30;
/** `new UStroke(2, 3, 1)`. @see ETileLookAheadOrBehind.java:96 */
const FRAME_STROKE = new UStroke(2, 3, 1);

export class ETileLookAheadOrBehind extends ETile {
  private readonly orig: ETile;
  private readonly colorSet: HColorSet;
  private readonly style: Style;
  private readonly supText: UText;

  /** `fc` is stored and never read upstream; not kept. @see ETileLookAheadOrBehind.java:63-70 */
  constructor(orig: ETile, fc: FontConfiguration, style: Style, colorSet: HColorSet, type: string) {
    super();
    this.style = style;
    this.orig = orig;
    this.colorSet = colorSet;
    this.supText = UText.build(type, fc);
  }

  /** @see ETileLookAheadOrBehind.java:72-75 */
  getH1(stringBounder: StringBounder): number {
    return DELTAY + this.orig.getH1(stringBounder);
  }

  /** @see ETileLookAheadOrBehind.java:77-80 */
  getH2(stringBounder: StringBounder): number {
    return this.orig.getH2(stringBounder) + DELTAY;
  }

  /** @see ETileLookAheadOrBehind.java:82-85 */
  getWidth(stringBounder: StringBounder): number {
    return (
      this.orig.getWidth(stringBounder) + DELTAX1 + DELTAX2 + this.supText.calculateDimension(stringBounder).getWidth()
    );
  }

  /** @see ETileLookAheadOrBehind.java:87-103 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dim = this.calculateDimension(stringBounder);

    const lineColor = this.style.value('LineColor').asColor(this.colorSet);

    const rect = URectangle.build(dim.getWidth(), dim.getHeight()).rounded(FRAME_ROUND);

    ug.apply(fore(lineColor)).apply(FRAME_STROKE).draw(rect);
    const posText = this.getH1(stringBounder) + this.supText.getDescent(stringBounder);

    ug.apply(new UTranslate(4, 2 + posText)).draw(this.supText);

    this.orig.drawU(
      ug.apply(new UTranslate(DELTAX1 + this.supText.calculateDimension(stringBounder).getWidth(), DELTAY)),
    );
  }

  /** @see ETileLookAheadOrBehind.java:105-108 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
