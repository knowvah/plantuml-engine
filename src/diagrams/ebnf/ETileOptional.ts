/**
 * `ETileOptional` (`@Deprecated` upstream): an optional bypass drawn *above* the tile with corners, superseded by
 * `ETileOptional2`. Over an `ETileAlternation` its corners widen to 12 and it adds no side margin
 * (`specialForAlternate`).
 *
 * Unreachable from EBNF and from the jar (eep D4): no class in `src/main/java/net/` constructs it
 * (`grep -rn "new ETileOptional("` finds none); `regexdiagram/PSystemRegex.java` imports it. Ported for
 * completeness of the package. `TRACE` and its blue rectangle are not ported; `EMPTY_TEXT_BLOCK` (`empty(0, 0)`
 * upstream) is `undefined` here, its zero height read through {@link heightOf}.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileOptional.java:52-168
 */
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../core/klimt/shape/TextBlockUtils.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { FloatingNote } from '../activity/ftile/vcompact/FloatingNote.js';
import { CornerCurved } from './CornerCurved.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { ETile } from './ETile.js';
import { ETileAlternation } from './ETileAlternation.js';

/** @see ETileOptional.java:56 */
const DELTAY = 16;
/** `deltax`: 0 over an alternation, else 15. @see ETileOptional.java:68 */
const DELTAX_DEFAULT = 15;
/** `posA` and `corner`: 12 over an alternation, else 8. @see ETileOptional.java:102-103 */
const CORNER_ALTERNATE = 12;
const CORNER_DEFAULT = 8;
/** `getDeltaY(…) - 11`, the bypass line's y. @see ETileOptional.java:106 */
const OPTIONAL_LINE_OFFSET = 11;
/** `drawHlineDirected(…, 0.4, 0)`. @see ETileOptional.java:112 */
const BYPASS_ARROW = { coef: 0.4, minimunSizeForArrow: 0 } as const;
/** `withMargin(note, 0, 0, 0, 10)` / `(note, 0, 0, 10, 0)`. @see ETileOptional.java:158, :165 */
const NOTE_MARGIN = 10;

/** `EMPTY_TEXT_BLOCK.calculateDimension(…)` is `(0, 0)`. */
function heightOf(note: TextBlock | undefined, stringBounder: StringBounder): number {
  return note === undefined ? 0 : note.calculateDimension(stringBounder).getHeight();
}

export class ETileOptional extends ETile {
  private readonly deltax: number;
  private readonly orig: ETile;
  private readonly skinParam: SkinParam;
  private commentAbove: string | undefined;
  private commentBelow: string | undefined;
  private readonly specialForAlternate: boolean;

  /** @see ETileOptional.java:64-69 */
  constructor(orig: ETile, skinParam: SkinParam) {
    super();
    this.skinParam = skinParam;
    this.orig = orig;
    this.specialForAlternate = orig instanceof ETileAlternation;
    this.deltax = this.specialForAlternate ? 0 : DELTAX_DEFAULT;
  }

  /** @see ETileOptional.java:71-75 */
  getH1(stringBounder: StringBounder): number {
    return DELTAY + this.orig.getH1(stringBounder) + heightOf(this.getNoteAbove(), stringBounder);
  }

  /** @see ETileOptional.java:77-80 */
  private getDeltaY(stringBounder: StringBounder): number {
    return DELTAY + heightOf(this.getNoteAbove(), stringBounder);
  }

  /** @see ETileOptional.java:82-86 */
  getH2(stringBounder: StringBounder): number {
    return this.orig.getH2(stringBounder) + heightOf(this.getNoteBelow(), stringBounder);
  }

  /** @see ETileOptional.java:88-91 */
  getWidth(stringBounder: StringBounder): number {
    return this.orig.getWidth(stringBounder) + 2 * this.deltax;
  }

  /** @see ETileOptional.java:93-136 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dim = this.calculateDimension(stringBounder);

    const linePos = this.getH1(stringBounder);

    const posA = this.specialForAlternate ? CORNER_ALTERNATE : CORNER_DEFAULT;
    const corner = this.specialForAlternate ? CORNER_ALTERNATE : CORNER_DEFAULT;
    const posB = dim.getWidth() - posA;

    const posYoptionalLine = this.getDeltaY(stringBounder) - OPTIONAL_LINE_OFFSET;

    CornerCurved.createSE(corner).drawU(ug.apply(new UTranslate(posA, linePos)));
    this.drawVline(ug, posA, corner + posYoptionalLine, linePos - corner);
    CornerCurved.createNW(corner).drawU(ug.apply(new UTranslate(posA, posYoptionalLine)));

    this.drawHlineDirected(ug, posYoptionalLine, posA + corner, posB - corner, BYPASS_ARROW);

    CornerCurved.createSW(corner).drawU(ug.apply(new UTranslate(posB, linePos)));
    this.drawVline(ug, posB, corner + posYoptionalLine, linePos - corner);
    CornerCurved.createNE(corner).drawU(ug.apply(new UTranslate(posB, posYoptionalLine)));

    this.drawHline(ug, linePos, 0, this.deltax);
    this.drawHline(ug, linePos, dim.getWidth() - this.deltax, dim.getWidth());

    this.orig.drawU(ug.apply(new UTranslate(this.deltax, this.getDeltaY(stringBounder))));
    this.drawNotes(ug, dim.getWidth(), dim.getHeight());
  }

  /** `drawU`'s two note blocks. @see ETileOptional.java:123-134 */
  private drawNotes(ug: UGraphic, width: number, height: number): void {
    const stringBounder = ug.getStringBounder();
    const noteAbove = this.getNoteAbove();
    if (noteAbove !== undefined) {
      const pos2 = (width - noteAbove.calculateDimension(stringBounder).getWidth()) / 2;
      noteAbove.drawU(ug.apply(UTranslate.dx(pos2)));
    }

    const noteBelow = this.getNoteBelow();
    if (noteBelow !== undefined) {
      const dimBelow = noteBelow.calculateDimension(stringBounder);
      const pos2 = (width - dimBelow.getWidth()) / 2;
      noteBelow.drawU(ug.apply(new UTranslate(pos2, height - dimBelow.getHeight())));
    }
  }

  /** @see ETileOptional.java:138-141 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }

  /** @see ETileOptional.java:143-146 */
  override addCommentAbove(comment: string): void {
    this.commentAbove = comment;
  }

  /** @see ETileOptional.java:148-151 */
  override addCommentBelow(comment: string): void {
    this.commentBelow = comment;
  }

  /** Java's unused `stringBounder` parameter is dropped. @see ETileOptional.java:153-159 */
  private getNoteAbove(): TextBlock | undefined {
    if (this.commentAbove === undefined) return undefined;
    const note = FloatingNote.create(
      Display.getWithNewlines(this.skinParam.getPragma(), this.commentAbove),
      this.skinParam,
      'ebnf',
    );
    return TextBlockUtils.withMargin(note, 0, 0, 0, NOTE_MARGIN);
  }

  /** @see ETileOptional.java:161-166 */
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
