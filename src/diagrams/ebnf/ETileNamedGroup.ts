/**
 * `ETileNamedGroup`: a regex named group `(?<name>x)` — a #E8E8FF panel behind `x`, with the name on a tab above.
 *
 * Unreachable from EBNF (eep D4): only `regexdiagram/PSystemRegex.java:211` constructs it, for #126.
 * `skinParam` is stored and never read, and the note members are commented out upstream (not ported).
 * `HColorSet#getColor` throws `NoSuchColorException` only for an unknown name; Java catches and prints it, so the
 * panel is skipped then, as here.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileNamedGroup.java:50-143
 */
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { NoSuchColorException } from '../../core/klimt/color/NoSuchColorException.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { back, fore } from './ebnf-klimt.js';
import { ETile } from './ETile.js';

/** @see ETileNamedGroup.java:57 */
const DELTAX = 10;
/** @see ETileNamedGroup.java:58 */
const DELTAY1 = 10;
/** @see ETileNamedGroup.java:59 */
const DELTAY2 = 10;
/** The panel colour. @see ETileNamedGroup.java:96 */
const GROUP_BACKGROUND = '#E8E8FF';

export class ETileNamedGroup extends ETile {
  private readonly orig: ETile;
  private readonly colorSet: HColorSet;
  private readonly groupName: UText;
  private readonly fc: FontConfiguration;

  /** @see ETileNamedGroup.java:64-71 */
  constructor(orig: ETile, fc: FontConfiguration, colorSet: HColorSet, _skinParam: SkinParam, name: string) {
    super();
    this.orig = orig;
    this.fc = fc;
    this.colorSet = colorSet;
    this.groupName = UText.build(name, fc);
  }

  /** @see ETileNamedGroup.java:73-77 */
  getH1(stringBounder: StringBounder): number {
    return DELTAY1 + this.orig.getH1(stringBounder);
  }

  /** @see ETileNamedGroup.java:79-83 */
  getH2(stringBounder: StringBounder): number {
    return this.orig.getH2(stringBounder) + DELTAY2;
  }

  /** @see ETileNamedGroup.java:85-88 */
  getWidth(stringBounder: StringBounder): number {
    return this.orig.getWidth(stringBounder) + 2 * DELTAX;
  }

  /** @see ETileNamedGroup.java:90-112 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dim = this.calculateDimension(stringBounder);

    try {
      const background = this.colorSet.getColor(GROUP_BACKGROUND);
      const ugBack = ug.apply(fore(background)).apply(back(background));
      ugBack.draw(URectangle.build(dim.getWidth(), dim.getHeight()));
      const dimText = stringBounder.calculateDimension(this.fc, this.groupName.getText()).delta(10, 0);
      ugBack.apply(UTranslate.dy(-dimText.getHeight())).draw(URectangle.build(dimText.getWidth(), dimText.getHeight()));
    } catch (e) {
      // Java: `catch (NoSuchColorException e) { e.printStackTrace(); }` — stderr is not output.
      if (!(e instanceof NoSuchColorException)) throw e;
    }
    const linePos = this.getH1(stringBounder);
    this.drawHline(ug, linePos, 0, DELTAX);
    this.drawHline(ug, linePos, dim.getWidth() - DELTAX, dim.getWidth());

    this.orig.drawU(ug.apply(new UTranslate(DELTAX, DELTAY1)));
    ug.apply(UTranslate.dx(5)).draw(this.groupName);
  }

  /** @see ETileNamedGroup.java:114-117 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
