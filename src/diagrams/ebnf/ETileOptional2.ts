/**
 * `ETileOptional2`: `[ x ]`, the straight track above with `x` below it, joined by two zigzags; comments above and
 * below sit as unlinked notes. `ETileZeroOrMore` extends it.
 *
 * `TRACE` (a `false` debug flag) and its green rectangle are not ported. `TextBlockUtils.EMPTY_TEXT_BLOCK` (an
 * `empty(0, 0)` block upstream) is `undefined` here, so its zero height is read through {@link heightOf}.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileOptional2.java:52-155
 */
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { FloatingNote } from '../activity/ftile/vcompact/FloatingNote.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { ETile } from './ETile.js';
import { Zigzag } from './Zigzag.js';

/** @see ETileOptional2.java:54 */
const DELTAX = 24;
/** @see ETileOptional2.java:55 */
const DELTAY = 20;
/** `final double corner = 12; // deltax/2`. @see ETileOptional2.java:99 */
const CORNER = 12;
/** `new Zigzag(9, …)`. @see ETileOptional2.java:101 */
const ZIGZAG_CTRL = 9;
/** `10 + …` in `getH1`/`getH2`. @see ETileOptional2.java:69, :80 */
const TRACK_GAP = 10;
/** `drawHlineDirected(…, 0.4, 25)`. @see ETileOptional2.java:98 */
const BYPASS_ARROW = { coef: 0.4, minimunSizeForArrow: 25 } as const;
/** `withMargin(note, 0, 0, 0, 10)` / `(note, 0, 0, 10, 0)`. @see ETileOptional2.java:144, :152 */
const NOTE_MARGIN = 10;

/** `EMPTY_TEXT_BLOCK.calculateDimension(…)` is `(0, 0)`. */
function heightOf(note: TextBlock | undefined, stringBounder: StringBounder): number {
  return note === undefined ? 0 : note.calculateDimension(stringBounder).getHeight();
}

export class ETileOptional2 extends ETile {
  private readonly orig: ETile;
  private readonly skinParam: SkinParam;
  private commentAbove: string | undefined;
  private commentBelow: string | undefined;

  /** @see ETileOptional2.java:61-64 */
  constructor(orig: ETile, skinParam: SkinParam) {
    super();
    this.skinParam = skinParam;
    this.orig = orig;
  }

  /** @see ETileOptional2.java:66-70 */
  getH1(stringBounder: StringBounder): number {
    return TRACK_GAP + heightOf(this.getNoteAbove(), stringBounder);
  }

  /** @see ETileOptional2.java:72-75 */
  private getDeltaY(stringBounder: StringBounder): number {
    return DELTAY + heightOf(this.getNoteAbove(), stringBounder);
  }

  /** @see ETileOptional2.java:77-82 */
  getH2(stringBounder: StringBounder): number {
    return (
      TRACK_GAP +
      this.orig.getH1(stringBounder) +
      this.orig.getH2(stringBounder) +
      heightOf(this.getNoteBelow(), stringBounder)
    );
  }

  /** @see ETileOptional2.java:84-87 */
  getWidth(stringBounder: StringBounder): number {
    return this.orig.getWidth(stringBounder) + 2 * DELTAX;
  }

  /** @see ETileOptional2.java:89-121 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dim = this.calculateDimension(stringBounder);

    const linePos = this.getH1(stringBounder);

    this.drawHlineDirected(ug, linePos, 0, dim.getWidth(), BYPASS_ARROW);
    const zigzag = new Zigzag(
      ZIGZAG_CTRL,
      2 * CORNER,
      this.getDeltaY(stringBounder) + this.orig.getH1(stringBounder) - linePos,
    );

    ug.apply(new UTranslate(0, linePos)).draw(zigzag.pathDown());
    ug.apply(new UTranslate(dim.getWidth() - 2 * CORNER, linePos)).draw(zigzag.pathUp());

    this.orig.drawU(ug.apply(new UTranslate(DELTAX, this.getDeltaY(stringBounder))));

    const noteAbove = this.getNoteAbove();
    if (noteAbove !== undefined) {
      const pos2 = (dim.getWidth() - noteAbove.calculateDimension(stringBounder).getWidth()) / 2;
      noteAbove.drawU(ug.apply(UTranslate.dx(pos2)));
    }

    const noteBelow = this.getNoteBelow();
    if (noteBelow !== undefined) {
      const dimBelow = noteBelow.calculateDimension(stringBounder);
      const pos2 = (dim.getWidth() - dimBelow.getWidth()) / 2;
      noteBelow.drawU(ug.apply(new UTranslate(pos2, dim.getHeight() - dimBelow.getHeight())));
    }
  }

  /** @see ETileOptional2.java:123-126 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }

  /** @see ETileOptional2.java:128-131 */
  override addCommentAbove(comment: string): void {
    this.commentAbove = comment;
  }

  /** @see ETileOptional2.java:133-136 */
  override addCommentBelow(comment: string): void {
    this.commentBelow = comment;
  }

  /** `EMPTY_TEXT_BLOCK` is `undefined`; Java's unused `stringBounder` parameter is dropped. @see ETileOptional2.java:138-145 */
  private getNoteAbove(): TextBlock | undefined {
    if (this.commentAbove === undefined) return undefined;
    const note = FloatingNote.create(
      Display.getWithNewlines(this.skinParam.getPragma(), this.commentAbove),
      this.skinParam,
      'ebnf',
    );
    return TextBlockUtils.withMargin(note, 0, 0, 0, NOTE_MARGIN);
  }

  /** @see ETileOptional2.java:147-153 */
  private getNoteBelow(): TextBlock | undefined {
    if (this.commentBelow === undefined) return undefined;
    const note = FloatingNote.create(
      Display.getWithNewlines(this.skinParam.getPragma(), this.commentBelow),
      this.skinParam,
      'ebnf',
    );
    return TextBlockUtils.withMargin(note, 0, 0, NOTE_MARGIN, 0);
  }
}
