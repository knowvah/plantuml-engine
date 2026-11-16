/**
 * `BoxedCharacter` — a `2r x 2r` square with one letter centred in it: the corner tag of a Problem Frames domain.
 *
 * The letter is a `UCenteredCharacter`, which `DriverCenteredCharacterSvg` writes as the glyph's captured outline
 * (`boxed-glyph-data.ts`, decisions D4).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/BoxedCharacter.java:51-96
 */
import { Back } from '../klimt/Back.js';
import type { HColorOrPaint } from '../klimt/color/ColorMapper.js';
import { HColors } from '../klimt/color/HColors.js';
import type { UFont } from '../klimt/font/UFont.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { UCenteredCharacter } from '../klimt/shape/UCenteredCharacter.js';
import { URectangle } from '../klimt/shape/URectangle.js';
import { Fore } from '../klimt/Fore.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { UTranslate } from '../klimt/UTranslate.js';

/** @see BoxedCharacter.java:51 */
export class BoxedCharacter implements TextBlock {
  private readonly c: string;

  /** `size` is the half-side (`radius`). @see BoxedCharacter.java:60-67 */
  constructor(
    c: string,
    private readonly radius: number,
    private readonly font: UFont,
    private readonly innerCircle: HColorOrPaint | undefined,
    private readonly circle: HColorOrPaint | undefined,
    private readonly fontColor: HColorOrPaint,
  ) {
    this.c = c.charAt(0);
  }

  /** @see BoxedCharacter.java:69-82 */
  drawU(ug0: UGraphic): void {
    let ug = ug0;
    if (this.circle !== undefined) ug = ug.apply(new Fore(this.circle));
    ug = ug.apply(new Back(this.innerCircle ?? HColors.none()));
    ug.draw(URectangle.build(2 * this.radius, 2 * this.radius));
    ug = ug.apply(new Fore(this.fontColor));
    ug = ug.apply(new UTranslate(this.radius, this.radius));
    ug.draw(new UCenteredCharacter(this.c, this.font));
  }

  /** @see BoxedCharacter.java:84-95 */
  calculateDimension(): XDimension2D {
    return new XDimension2D(2 * this.radius, 2 * this.radius);
  }
}
