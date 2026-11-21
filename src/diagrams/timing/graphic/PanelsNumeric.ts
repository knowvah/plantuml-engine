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

/** The gap between a scale label and the ruler (PanelsNumeric.java:140). */
const SCALE_LABEL_GAP = 2;
/** The range of a Java `int` (`(int) Math.ceil(...)` saturates). */
const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

/**
 * The eight `PanelsNumeric` constructor arguments (D16), shared by `PanelsAnalog` and `PanelsDigital`. `initialState`
 * is Java's `Double`, `ticksEvery` its `Integer`; the player passes no notes (java:67-69).
 */
export interface PanelsNumericArgs extends Omit<PanelsArgs, 'notes'> {
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
 * Draws a numeric time series: the left panel holds the scale, the right panel the curve. Subclasses only decide how
 * two consecutive samples are joined.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsNumeric.java:57-187
 */
export abstract class PanelsNumeric extends Panels {
  readonly #timeSeries: TimeSeries;
  readonly #initialState: number | undefined;
  readonly #ticksEvery: number | undefined;

  /** java:67-74 */
  protected constructor(args: PanelsNumericArgs) {
    super({ ...args, notes: undefined });
    this.#timeSeries = args.timeSeries;
    this.#initialState = args.initialState;
    this.#ticksEvery = args.ticksEvery;
  }

  /** java:76-79 */
  public override getFullHeight(stringBounder: StringBounder): number {
    return this.getHeightForConstraints(stringBounder) + this.suggestedHeight;
  }

  /** java:81-89 */
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

  /** java:91-95: a range of 0 divides by zero, as in Java (Infinity or NaN). */
  #getYpos(stringBounder: StringBounder, value: number): number {
    const y =
      ((value - this.#timeSeries.getMin()) * (this.suggestedHeight - 2 * Panels.MARGIN_Y)) /
      (this.#timeSeries.getMax() - this.#timeSeries.getMin());
    return this.getHeightForConstraints(stringBounder) + this.suggestedHeight - Panels.MARGIN_Y - y;
  }

  /**
   * The integers from `ceil(min)` to `floor(max)` that are a multiple of `ticksEvery`: the loop
   * `for (int i = first; i <= last; i++) if (i % ticksEvery == 0)` of java:103-107, 122-126 and 152-157.
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

  /** java:97-109: the bounds, or the multiples of `ticksEvery` between them. */
  public override drawLeftPanel(ug: UGraphic, fullAvailableWidth: number): void {
    const ticksEvery = this.#ticksEvery;
    if (ticksEvery === undefined) {
      this.#drawScaleLabel(ug, this.#timeSeries.getMin(), fullAvailableWidth);
      this.#drawScaleLabel(ug, this.#timeSeries.getMax(), fullAvailableWidth);
    } else {
      for (const i of this.#tickValues(ticksEvery)) this.#drawScaleLabel(ug, i, fullAvailableWidth);
    }
  }

  /** java:111-114 */
  public override getLeftPanelWidth(stringBounder: StringBounder): number {
    return Panels.LEFT_PANEL_MIN_WIDTH + this.#getMaxWidthForTicks(stringBounder);
  }

  /** java:116-129 */
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

  /** java:131-135 */
  #getWidthLabel(stringBounder: StringBounder, value: number): number {
    return this.#getTextBlock(value).calculateDimension(stringBounder).getWidth();
  }

  /** java:137-142 */
  #drawScaleLabel(ug: UGraphic, value: number, fullAvailableWidth: number): void {
    const label = this.#getTextBlock(value);
    const dim = label.calculateDimension(ug.getStringBounder());
    ug = ug.apply(UTranslate.dx(fullAvailableWidth - dim.getWidth() - SCALE_LABEL_GAP));
    label.drawU(ug.apply(UTranslate.dy(this.#getYpos(ug.getStringBounder(), value) - dim.getHeight() / 2)));
  }

  /**
   * java:144-148: `getTextBlock(double)`, the overload that formats the value through the series. It builds the same
   * block as `Panels#createTextBlock(String)` (a `Display` of the text, left aligned, in the panel's font).
   */
  #getTextBlock(value: number): TextBlock {
    return this.createTextBlock(this.#timeSeries.getDisplayValue(value));
  }

  /** java:150-158: only called when `ticksEvery` is set. */
  #drawTickHlines(ug: UGraphic, ticksEvery: number): void {
    ug = TimingRuler.applyForVLines(ug, this.style, this.skinParam);
    const hline = ULine.hline(this.ruler.getWidth());
    for (const i of this.#tickValues(ticksEvery))
      ug.apply(UTranslate.dy(this.#getYpos(ug.getStringBounder(), i))).draw(hline);
  }

  /** java:160-180 */
  public override drawRightPanel(ug: UGraphic): void {
    if (this.#ticksEvery !== undefined) this.#drawTickHlines(ug, this.#ticksEvery);

    ug = this.getContext().apply(ug);
    let lastx = 0;
    let lastValue = this.#initialState === undefined ? 0 : this.#initialState;
    for (const ent of this.#timeSeries.entrySet()) {
      const y1 = this.#getYpos(ug.getStringBounder(), lastValue);
      const y2 = this.#getYpos(ug.getStringBounder(), ent.value);
      const x = this.ruler.getPosInPixel(ent.key);
      this.drawSegment(ug, lastx, y1, x, y2);
      lastx = x;
      lastValue = ent.value;
    }
    ug.apply(new UTranslate(lastx, this.#getYpos(ug.getStringBounder(), lastValue))).draw(
      ULine.hline(this.ruler.getWidth() - lastx),
    );

    this.drawConstraints(ug.apply(UTranslate.dy(this.getHeightForConstraints(ug.getStringBounder()))));
  }

  /** java:182-185: joins the sample (x1, y1) to the next one (x2, y2), in pixels. */
  protected abstract drawSegment(ug: UGraphic, x1: number, y1: number, x2: number, y2: number): void;
}
