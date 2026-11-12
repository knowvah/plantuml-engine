import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import { Stereotype } from '../../../core/stereo/Stereotype.js';

/**
 * BoxStyle — the outline an activity/mindmap/wbs box is drawn with
 * (`PLAIN` rounded rectangle, the SDL/UML shapes).
 *
 * Ported slice (what `FtileBoxOld` and `FtileBox` reach): the abstract base
 * (`values` registry, `stereotype`, `shield`, `getShield`, `name`, abstract
 * `drawMe`, `getStereotype`, `drawMeDebug`) and `PLAIN` (`BoxStylePlain`).
 * The thirteen SDL/UML styles (`SDL_INPUT` ... `UML_TIME_EVENT`,
 * java:61-97) and `fromString` serve the activity `:label<<stereo>>`
 * shapes, which the port's activity engine draws through its own `tiles/`
 * renderer; BPM's `FtileBox` passes only `PLAIN`.
 *
 * `PLAIN` is a static getter over a module constant declared after
 * `BoxStylePlain`: a TS class field cannot construct a subclass declared
 * later in the module (temporal dead zone).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/BoxStyle.java:53-151
 */
export abstract class BoxStyle {
  /** @see BoxStyle.java:55 */
  private static readonly values: BoxStyle[] = [];

  /** Shape: (=) @see BoxStyle.java:57-58 */
  static get PLAIN(): BoxStyle {
    return PLAIN;
  }

  /** `null` for PLAIN. @see BoxStyle.java:99-103 */
  protected readonly stereotype: string | null;

  /** @see BoxStyle.java:105-108 */
  protected readonly shield: number;

  /** @see BoxStyle.java:114 */
  abstract drawMe(ug: UGraphic, width: number, height: number, shadowing: number, roundCorner: number): void;

  /** @see BoxStyle.java:116-120 */
  protected constructor(stereotype: string | null, shield: number) {
    this.stereotype = stereotype;
    this.shield = shield;
    BoxStyle.values.push(this);
  }

  /** @see BoxStyle.java:122-124 */
  getShield(): number {
    return this.shield;
  }

  /** `null` -> `undefined`. @see BoxStyle.java:135-139 */
  getStereotype(): Stereotype | undefined {
    if (this.stereotype === null) return undefined;
    return Stereotype.build('<<' + this.stereotype + '>>');
  }

  /** @see BoxStyle.java:141-145 */
  drawMeDebug(ug: UGraphic, width: number, height: number, shadowing: number, _roundCorner: number): void {
    const s = URectangle.build(width, height);
    s.setDeltaShadow(shadowing);
    ug.draw(s);
  }

  /** @see BoxStyle.java:146-148 */
  name(): string | null {
    return this.stereotype;
  }
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/BoxStyle.java:153-170 */
class BoxStylePlain extends BoxStyle {
  /** @see BoxStyle.java:155-157 */
  constructor(stereotype: string | null, shield: number) {
    super(stereotype, shield);
  }

  /** @see BoxStyle.java:159-165 */
  drawMe(ug: UGraphic, width: number, height: number, shadowing: number, roundCorner: number): void {
    width -= this.getShield();
    const s = this.getShape(width, height, roundCorner);
    s.setDeltaShadow(shadowing);
    ug.draw(s);
  }

  /** @see BoxStyle.java:167-169 */
  protected getShape(width: number, height: number, roundCorner: number): URectangle {
    return URectangle.build(width, height).rounded(roundCorner);
  }
}

/** `new BoxStylePlain(null, 0)`. @see BoxStyle.java:58 */
const PLAIN: BoxStyle = new BoxStylePlain(null, 0);
