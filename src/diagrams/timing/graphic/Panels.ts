import type { Position } from '../../../core/abel/Position.js';
import { Display } from '../../../core/klimt/creole/Display.js';
import { BigDecimal } from '../../../core/decimal/BigDecimal.js';
import { Fashion } from '../../../core/klimt/Fashion.js';
import type { FontConfiguration } from '../../../core/klimt/shape/UText.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../../core/klimt/geom/HorizontalAlignment.js';
import type { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import type { UStroke } from '../../../core/klimt/UStroke.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { Style } from '../../../core/style/Style.js';
import type { TimeConstraint } from '../TimeConstraint.js';
import type { TimeProjected } from '../TimeProjected.js';
import { TimeTick } from '../TimeTick.js';
import { TimingFormat } from '../TimingFormat.js';
import type { TimingNote } from '../TimingNote.js';
import type { TimingRuler } from '../TimingRuler.js';
import { createDisplayWith, fontConfigurationOf, type TimingSkinParam } from '../timing-klimt.js';
import type { IntricatedPoint } from './IntricatedPoint.js';

/** The six `Panels` constructor arguments (D16); `PanelsState`, `PanelsConcise` and the other subclasses take the same. */
export interface PanelsArgs {
  readonly ruler: TimingRuler;
  readonly skinParam: TimingSkinParam;
  readonly suggestedHeight: number;
  readonly style: Style;
  /** Java's nullable list: `notes != null ? notes : new ArrayList<>()`. */
  readonly notes: readonly TimingNote[] | undefined;
  readonly constraints: readonly TimeConstraint[] | undefined;
}

/**
 * What a player draws to the left of the time axis (its states) and on it, plus the layout constants shared by
 * every kind of panel.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/Panels.java:65-192
 */
export abstract class Panels implements TimeProjected {
  // ========== Common layout constants (Panels.java:68-71) ==========
  protected static readonly MARGIN_Y = 8;
  protected static readonly MARGIN_X = 12;
  protected static readonly BOTTOM_MARGIN = 10;
  protected static readonly LEFT_PANEL_MIN_WIDTH = 5;

  protected readonly skinParam: TimingSkinParam;
  protected readonly ruler: TimingRuler;
  protected readonly suggestedHeight: number;
  protected readonly style: Style;

  readonly #constraints: readonly TimeConstraint[];
  readonly #notes: readonly TimingNote[];

  /** java:81-91 */
  protected constructor(args: PanelsArgs) {
    this.ruler = args.ruler;
    this.skinParam = args.skinParam;
    this.suggestedHeight = args.suggestedHeight;
    this.style = args.style;
    this.#notes = args.notes ?? [];
    this.#constraints = args.constraints ?? [];
  }

  // ========== Constraints management ==========

  public abstract drawLeftPanel(ug: UGraphic, fullAvailableWidth: number): void;

  public abstract drawRightPanel(ug: UGraphic): void;

  public abstract getFullHeight(stringBounder: StringBounder): number;

  public abstract getLeftPanelWidth(stringBounder: StringBounder): number;

  public abstract getTimeProjection(
    stringBounder: StringBounder,
    tick: TimeTick | undefined,
  ): IntricatedPoint | undefined;

  /** java:101-103 */
  protected getConstraints(): readonly TimeConstraint[] {
    return this.#constraints;
  }

  /** java:105-107 */
  protected getConstraintDeltaY(_constraint: TimeConstraint): number {
    return 0;
  }

  /** java:109-113 */
  protected drawConstraints(ug: UGraphic): void {
    for (const constraint of this.getConstraints())
      constraint.drawU(ug.apply(UTranslate.dy(this.getConstraintDeltaY(constraint))), this.ruler);
  }

  /** java:115-124 */
  protected getHeightForConstraints(stringBounder: StringBounder): number {
    if (this.#constraints.length === 0) return 0;

    let result = 0;
    for (const constraint of this.#constraints)
      result = Math.max(result, constraint.getConstraintHeight(stringBounder) - this.getConstraintDeltaY(constraint));

    return result;
  }

  /** java:126-128 */
  protected getNotes(): readonly TimingNote[] {
    return this.#notes;
  }

  /** java:130-137: a note with no tick sits at x = 0. */
  protected drawNotes(ug: UGraphic, position: Position): void {
    for (const note of this.#notes)
      if (note.getPosition() === position) {
        const when = note.getWhen();
        const x = when === undefined ? 0 : this.ruler.getPosInPixel(when);
        note.drawU(ug.apply(UTranslate.dx(x)));
      }
  }

  /** java:139-146 */
  protected getHeightForNotes(stringBounder: StringBounder, position: Position): number {
    let height = 0;
    for (const note of this.#notes)
      if (note.getPosition() === position) height = Math.max(height, note.getHeight(stringBounder));

    return height;
  }

  /** java:148-153 */
  protected getContext(): Fashion {
    const colorSet = this.skinParam.getIHtmlColorSet();
    const lineColor = this.style.value('LineColor').asColor(colorSet);
    const backgroundColor = this.style.value('BackGroundColor').asColor(colorSet);

    return new Fashion(backgroundColor, lineColor).withStroke(this.getStroke());
  }

  /** java:155-157 */
  protected getStroke(): UStroke {
    return this.style.getStroke();
  }

  /** java:159-161 */
  protected getFontConfiguration(): FontConfiguration {
    return fontConfigurationOf(this.skinParam, this.style);
  }

  /** java:163-166 */
  protected createTextBlock(value: string): TextBlock {
    const display = Display.getWithNewlines(this.skinParam.getPragma(), value);
    return createDisplayWith(display, this.getFontConfiguration(), this.skinParam, HorizontalAlignment.LEFT);
  }

  /** java:168-170 */
  protected getTextBlock(value: string): TextBlock {
    return this.createTextBlock(value);
  }

  /** java:172-174 */
  protected drawHLineFromPoint(ug: UGraphic, start: XPoint2D, length: number): void {
    ug.apply(UTranslate.point(start)).draw(ULine.hline(length));
  }

  /** java:176-182: the line stops at the right end of the ruler. */
  protected drawHorizontalBetweenTimes(ug: UGraphic, startTime: number, endTime: number): void {
    const x1 = this.xOfTime(startTime);
    const x2 = Math.min(this.ruler.getWidth(), this.xOfTime(endTime));

    const hline = ULine.hline(x2 - x1);
    ug.apply(UTranslate.dx(x1)).draw(hline);
  }

  /** java:184-186: `new BigDecimal(time)` is exact; `getPosInPixel` reads only its `doubleValue()`, which is `time`. */
  protected xOfTime(time: number): number {
    return this.ruler.getPosInPixel(new TimeTick(BigDecimal.valueOfDouble(time), TimingFormat.DECIMAL));
  }

  /** java:188-190 */
  protected drawVline(ug: UGraphic, x: number, y: number, vline: ULine): void {
    ug.apply(new UTranslate(x, y)).draw(vline);
  }
}
