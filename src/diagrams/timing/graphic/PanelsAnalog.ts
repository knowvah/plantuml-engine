import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { TimeSeries } from '../TimeSeries.js';
import type { TimeTick } from '../TimeTick.js';
import { TimingRuler } from '../TimingRuler.js';
import { IntricatedPoint } from './IntricatedPoint.js';
import { Panels, type PanelsArgs } from './Panels.js';

/** The gap between a scale label and the ruler (PanelsAnalog.java:135). */
const SCALE_LABEL_GAP = 2;
/** The range of a Java `int` (`(int) Math.ceil(...)` saturates). */
const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

/**
 * The eight `PanelsAnalog` constructor arguments (D16). `initialState` is Java's `Double`, `ticksEvery` its `Integer`;
 * the player passes no notes (java:62-69).
 */
export interface PanelsAnalogArgs extends Omit<PanelsArgs, 'notes'> {
  readonly timeSeries: TimeSeries;
  readonly initialState: number | undefined;
  readonly ticksEvery: number | undefined;
}

/** `(int) value` on a double: NaN is 0, and the result saturates (JLS 5.1.3). */
function toInt(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(INT_MAX, Math.max(INT_MIN, Math.trunc(value)));
}

/**
 * The panels of an `analog` player: a polyline over the values, with the scale on the left.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsAnalog.java:56-181
 */
export class PanelsAnalog extends Panels {
  readonly #timeSeries: TimeSeries;
  readonly #initialState: number | undefined;
  readonly #ticksEvery: number | undefined;

  /** java:62-70 */
  public constructor(args: PanelsAnalogArgs) {
    super({ ...args, notes: undefined });
    this.#timeSeries = args.timeSeries;
    this.#initialState = args.initialState;
    this.#ticksEvery = args.ticksEvery;
  }

  /** java:72-75 */
  public override getFullHeight(stringBounder: StringBounder): number {
    return this.getHeightForConstraints(stringBounder) + this.suggestedHeight;
  }

  /** java:77-84 */
  public override getTimeProjection(
    stringBounder: StringBounder,
    tick: TimeTick | undefined,
  ): IntricatedPoint | undefined {
    if (tick === undefined) return undefined;
    const x = this.ruler.getPosInPixel(tick);
    const value = this.#timeSeries.getValueAt(tick);
    return new IntricatedPoint(
      new XPoint2D(x, this.#getYpos(stringBounder, value)),
      new XPoint2D(x, this.#getYpos(stringBounder, value)),
    );
  }

  /** java:86-91: a range of 0 divides by zero, as in Java (Infinity or NaN). */
  #getYpos(stringBounder: StringBounder, value: number): number {
    const y =
      ((value - this.#timeSeries.getMin()) * (this.suggestedHeight - 2 * Panels.MARGIN_Y)) /
      (this.#timeSeries.getMax() - this.#timeSeries.getMin());
    return this.getHeightForConstraints(stringBounder) + this.suggestedHeight - Panels.MARGIN_Y - y;
  }

  /**
   * The integers from `ceil(min)` to `floor(max)` that are a multiple of `ticksEvery`: the loop
   * `for (int i = first; i <= last; i++) if (i % ticksEvery == 0)` of java:98-102, 117-122 and 148-152.
   * `ticksEvery` is an `Integer` unboxed there: `% 0` is `ArithmeticException`.
   */
  *#tickValues(ticksEvery: number): Generator<number> {
    const first = toInt(Math.ceil(this.#timeSeries.getMin()));
    const last = toInt(Math.floor(this.#timeSeries.getMax()));
    for (let i = first; i <= last; i++) {
      if (ticksEvery === 0) throw new Error('java.lang.ArithmeticException: / by zero');
      if (i % ticksEvery === 0) yield i;
    }
  }

  /** java:92-105: the bounds, or the multiples of `ticksEvery` between them. */
  public override drawLeftPanel(ug: UGraphic, fullAvailableWidth: number): void {
    const ticksEvery = this.#ticksEvery;
    if (ticksEvery === undefined) {
      this.#drawScaleLabel(ug, this.#timeSeries.getMin(), fullAvailableWidth);
      this.#drawScaleLabel(ug, this.#timeSeries.getMax(), fullAvailableWidth);
    } else {
      for (const i of this.#tickValues(ticksEvery)) this.#drawScaleLabel(ug, i, fullAvailableWidth);
    }
  }

  /** java:107-109 */
  public override getLeftPanelWidth(stringBounder: StringBounder): number {
    return Panels.LEFT_PANEL_MIN_WIDTH + this.#getMaxWidthForTicks(stringBounder);
  }

  /** java:111-124 */
  #getMaxWidthForTicks(stringBounder: StringBounder): number {
    const ticksEvery = this.#ticksEvery;
    if (ticksEvery === undefined)
      return Math.max(
        this.#getWidthLabel(stringBounder, this.#timeSeries.getMin()),
        this.#getWidthLabel(stringBounder, this.#timeSeries.getMax()),
      );

    let result = 0;
    for (const i of this.#tickValues(ticksEvery)) result = Math.max(result, this.#getWidthLabel(stringBounder, i));

    return result;
  }

  /** java:126-130 */
  #getWidthLabel(stringBounder: StringBounder, value: number): number {
    return this.#getTextBlock(value).calculateDimension(stringBounder).getWidth();
  }

  /** java:132-137 */
  #drawScaleLabel(ug: UGraphic, value: number, fullAvailableWidth: number): void {
    const label = this.#getTextBlock(value);
    const dim = label.calculateDimension(ug.getStringBounder());
    ug = ug.apply(UTranslate.dx(fullAvailableWidth - dim.getWidth() - SCALE_LABEL_GAP));
    label.drawU(ug.apply(UTranslate.dy(this.#getYpos(ug.getStringBounder(), value) - dim.getHeight() / 2)));
  }

  /**
   * java:139-143: `getTextBlock(double)`, the overload that formats the value through the series. It builds the same
   * block as `Panels#createTextBlock(String)` (a `Display` of the text, left aligned, in the panel's font).
   */
  #getTextBlock(value: number): TextBlock {
    return this.createTextBlock(this.#timeSeries.getDisplayValue(value));
  }

  /** java:145-154: only called when `ticksEvery` is set. */
  #drawTickHlines(ug: UGraphic, ticksEvery: number): void {
    ug = TimingRuler.applyForVLines(ug, this.style, this.skinParam);
    const hline = ULine.hline(this.ruler.getWidth());
    for (const i of this.#tickValues(ticksEvery))
      ug.apply(UTranslate.dy(this.#getYpos(ug.getStringBounder(), i))).draw(hline);
  }

  /** java:156-175 */
  public override drawRightPanel(ug: UGraphic): void {
    if (this.#ticksEvery !== undefined) this.#drawTickHlines(ug, this.#ticksEvery);

    ug = this.getContext().apply(ug);
    let lastx = 0;
    let lastValue = this.#initialState === undefined ? 0 : this.#initialState;
    for (const ent of this.#timeSeries.entrySet()) {
      const y1 = this.#getYpos(ug.getStringBounder(), lastValue);
      const y2 = this.#getYpos(ug.getStringBounder(), ent.value);
      const x = this.ruler.getPosInPixel(ent.key);
      ug.apply(new UTranslate(lastx, y1)).draw(new ULine(x - lastx, y2 - y1));
      lastx = x;
      lastValue = ent.value;
    }
    ug.apply(new UTranslate(lastx, this.#getYpos(ug.getStringBounder(), lastValue))).draw(
      ULine.hline(this.ruler.getWidth() - lastx),
    );

    this.drawConstraints(ug.apply(UTranslate.dy(this.getHeightForConstraints(ug.getStringBounder()))));
  }

  /** java:177-179 */
  public setBounds(min: string, max: string): void {
    this.#timeSeries.setBounds(min, max);
  }
}
