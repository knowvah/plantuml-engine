/**
 * `ETileOneOrMore`: a loop — `x` on the track with a return path above it, arrowed right to left. With a loop label
 * (`n * x` → `n×`) a `Brace` and the label sit above the return path.
 *
 * `TRACE` (a `false` debug flag), its red rectangle, and the commented-out `OpenIcon` are not ported. The two Java
 * constructors are one with optional trailing parameters; `skinParam` is accepted and unread, as upstream.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileOneOrMore.java:48-129
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { Brace } from './Brace.js';
import { CornerCurved } from './CornerCurved.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { ETile } from './ETile.js';

/** @see ETileOneOrMore.java:50 */
const DELTAX = 15;
/** @see ETileOneOrMore.java:51 */
const DELTAY = 12;
/** `getBraceHeight` with a label. @see ETileOneOrMore.java:77 */
const BRACE_HEIGHT = 15;
/** The corners' size, `createSW(8)` and friends. @see ETileOneOrMore.java:99-107 */
const CORNER = 8;
/** The return path's y below the brace. @see ETileOneOrMore.java:100-107 */
const RETURN_Y = 5;
/** `drawHlineAntiDirected(…, 0.6)`. @see ETileOneOrMore.java:103 */
const RETURN_ARROW_COEF = 0.6;
/** `new Brace(width, 10)` drawn at `y = 10`. @see ETileOneOrMore.java:115 */
const BRACE_SIZE = 10;

export class ETileOneOrMore extends ETile {
  private readonly orig: ETile;
  private readonly loop: UText | undefined;
  private readonly fc: FontConfiguration | undefined;

  /** `ETileOneOrMore(orig)` is `this(orig, null, null, null)`. @see ETileOneOrMore.java:56-64 */
  constructor(orig: ETile, loop?: string, fc?: FontConfiguration, _skinParam?: SkinParam) {
    super();
    this.orig = orig;
    this.fc = fc;
    this.loop = loop === undefined || fc === undefined ? undefined : UText.build(loop, fc);
  }

  /** @see ETileOneOrMore.java:66-72 */
  getH1(stringBounder: StringBounder): number {
    let h1 = DELTAY + this.orig.getH1(stringBounder);
    if (this.loop !== undefined) h1 += this.getBraceHeight();
    return h1;
  }

  /** @see ETileOneOrMore.java:74-78 */
  private getBraceHeight(): number {
    if (this.loop === undefined) return 0;
    return BRACE_HEIGHT;
  }

  /** @see ETileOneOrMore.java:80-83 */
  getH2(stringBounder: StringBounder): number {
    return this.orig.getH2(stringBounder);
  }

  /** @see ETileOneOrMore.java:85-88 */
  getWidth(stringBounder: StringBounder): number {
    return this.orig.getWidth(stringBounder) + 2 * DELTAX;
  }

  /** @see ETileOneOrMore.java:90-122 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const fullDim = this.calculateDimension(stringBounder);
    const width = fullDim.getWidth();

    const h1 = this.getH1(stringBounder);
    const top = RETURN_Y + this.getBraceHeight();

    CornerCurved.createSW(CORNER).drawU(ug.apply(new UTranslate(CORNER, h1)));
    this.drawVline(ug, CORNER, CORNER + top, h1 - CORNER);
    CornerCurved.createNW(CORNER).drawU(ug.apply(new UTranslate(CORNER, top)));

    this.drawHlineAntiDirected(ug, top, DELTAX, width - DELTAX, RETURN_ARROW_COEF);

    CornerCurved.createSE(CORNER).drawU(ug.apply(new UTranslate(width - CORNER, h1)));
    this.drawVline(ug, width - CORNER, CORNER + top, h1 - CORNER);
    CornerCurved.createNE(CORNER).drawU(ug.apply(new UTranslate(width - CORNER, top)));

    this.drawHline(ug, h1, 0, DELTAX);
    this.drawHline(ug, h1, width - DELTAX, width);

    this.orig.drawU(ug.apply(new UTranslate(DELTAX, DELTAY + this.getBraceHeight())));

    if (this.loop !== undefined) this.drawLoop(ug, width, this.loop);
  }

  /** The `loop != null` block: the brace, then the label centred on its descent. @see ETileOneOrMore.java:114-121 */
  private drawLoop(ug: UGraphic, width: number, loop: UText): void {
    const stringBounder = ug.getStringBounder();
    new Brace(width, BRACE_SIZE).drawU(ug.apply(new UTranslate(0, BRACE_SIZE)));
    // `fc` is set whenever `loop` is (the constructor builds `loop` from it).
    const dimText = stringBounder.calculateDimension(this.fc!, loop.getText());
    const descent = loop.getDescent(stringBounder);
    ug.apply(new UTranslate((width - dimText.getWidth()) / 2, descent)).draw(loop);
  }

  /** @see ETileOneOrMore.java:124-127 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }
}
