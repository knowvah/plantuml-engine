import type { BigDecimal } from '../../../core/decimal/BigDecimal.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { TimeTick } from '../TimeTick.js';
import { IntricatedPoint } from './IntricatedPoint.js';
import { Panels, type PanelsArgs } from './Panels.js';
import { PanelsNoLeft } from './PanelsNoLeft.js';

/** `for (int i = 0; i < 1000; i++)` (PanelsClock.java:131): at most 1000 periods are drawn. */
const MAX_PERIODS = 1000;

/**
 * The eight `PanelsClock` constructor arguments (D16). `period`, `pulse` and `offset` are `BigDecimal` (D3);
 * the player passes no constraints (`PlayerClock.java:63-64`).
 */
export interface PanelsClockArgs extends Omit<PanelsArgs, 'notes' | 'constraints'> {
  readonly period: BigDecimal;
  readonly pulse: BigDecimal;
  readonly offset: BigDecimal;
  readonly constraints: PanelsArgs['constraints'];
}

/**
 * The panels of a `clock` player: a square wave of `period`, high for `pulse` (half a period when 0), after `offset`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsClock.java:51-145
 */
export class PanelsClock extends PanelsNoLeft {
  readonly #period: BigDecimal;
  readonly #pulse: BigDecimal;
  readonly #offset: BigDecimal;

  /** java:57-65: no notes. */
  public constructor(args: PanelsClockArgs) {
    super({ ...args, notes: undefined });
    this.#period = args.period;
    this.#pulse = args.pulse;
    this.#offset = args.offset;
  }

  /** java:67-69 */
  public override getFullHeight(_stringBounder: StringBounder): number {
    return this.suggestedHeight;
  }

  /** java:71-73 */
  #getLineHeight(_stringBounder: StringBounder): number {
    return this.suggestedHeight - 2 * Panels.MARGIN_Y;
  }

  /** java:75-77 */
  #getYhigh(): number {
    return Panels.MARGIN_Y;
  }

  /** java:79-81 */
  #getYlow(stringBounder: StringBounder): number {
    return Panels.MARGIN_Y + this.#getLineHeight(stringBounder);
  }

  /**
   * java:83-103: whether the waveform is high at the absolute time: low before the offset, then a high pulse and a low
   * remainder per period. `%` keeps the dividend's sign in both languages, hence the normalisation.
   */
  #isHighAt(time: number): boolean {
    const periodValue = this.#period.doubleValue();
    if (periodValue <= 0) return false;

    const offsetValue = this.#offset.doubleValue();
    if (time < offsetValue) return false;

    const vpulse = this.#pulse.doubleValue() === 0 ? periodValue / 2.0 : this.#pulse.doubleValue();
    const phase = (time - offsetValue) % periodValue;
    // Java's % can be negative for negative dividends; normalize.
    const normalized = phase < 0 ? phase + periodValue : phase;
    return normalized < vpulse;
  }

  /** java:105-112 */
  public override getTimeProjection(
    stringBounder: StringBounder,
    tick: TimeTick | undefined,
  ): IntricatedPoint | undefined {
    if (tick === undefined) return undefined;
    const x = this.ruler.getPosInPixel(tick);
    const y = this.#isHighAt(tick.getTime().doubleValue()) ? this.#getYhigh() : this.#getYlow(stringBounder);
    const point = new XPoint2D(x, y);
    return new IntricatedPoint(point, point);
  }

  /** java:114-143: stops at the first edge past the right end of the ruler. */
  public override drawRightPanel(ug: UGraphic): void {
    ug = this.getContext().apply(ug);

    const vline = ULine.vline(this.#getLineHeight(ug.getStringBounder()));
    ug = ug.apply(UTranslate.dy(Panels.MARGIN_Y));
    let value = 0;
    if (this.#offset.doubleValue() !== 0) {
      this.drawHorizontalBetweenTimes(ug.apply(UTranslate.dy(vline.getDY())), value, this.#offset.doubleValue());
      value += this.#offset.doubleValue();
    }
    if (this.xOfTime(value) > this.ruler.getWidth()) return;
    this.drawVline(ug, this.xOfTime(value), 0, vline);

    this.#drawPeriods(ug, vline, value);
  }

  /** java:129-142: a high pulse, an edge down, the low remainder, an edge up. */
  #drawPeriods(ug: UGraphic, vline: ULine, start: number): void {
    let value = start;
    const vpulse = this.#pulse.doubleValue() === 0 ? this.#period.doubleValue() / 2.0 : this.#pulse.doubleValue();
    const remain = this.#period.doubleValue() - vpulse;
    for (let i = 0; i < MAX_PERIODS; i++) {
      this.drawHorizontalBetweenTimes(ug, value, value + vpulse);
      value += vpulse;
      if (this.xOfTime(value) > this.ruler.getWidth()) return;
      this.drawVline(ug, this.xOfTime(value), 0, vline);
      this.drawHorizontalBetweenTimes(ug.apply(UTranslate.dy(vline.getDY())), value, value + remain);
      value += remain;
      if (this.xOfTime(value) > this.ruler.getWidth()) return;
      this.drawVline(ug, this.xOfTime(value), 0, vline);
    }
  }
}
