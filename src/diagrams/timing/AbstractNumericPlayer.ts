import type { Colors } from '../../core/abel/Colors.js';
import { parseDouble } from '../../core/java-number-format.js';
import type { SName } from '../../core/style/SName.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import { Player, type PlayerBaseArgs } from './Player.js';
import { TimeConstraint } from './TimeConstraint.js';
import type { TimeTick } from './TimeTick.js';
import { TimeSeries } from './TimeSeries.js';

/**
 * The five constructor arguments of a numeric player (`PlayerAnalog`, `PlayerDigital`): the base six without the
 * background (AbstractNumericPlayer.java:66 passes `null`).
 */
export type NumericPlayerArgs = Omit<PlayerBaseArgs, 'generalBackgroundColor'>;

/** The suggested height of a numeric player (AbstractNumericPlayer.java:66). */
const SUGGESTED_HEIGHT = 100;
/** The constraint offset of a numeric player (AbstractNumericPlayer.java:97). */
const CONSTRAINT_OFFSET = 1;

/**
 * A player whose states are numbers (a time series), as opposed to `AbstractStatePlayer` whose states are labels.
 * Subclasses only choose how two consecutive samples are joined, through the `PanelsNumeric` they build.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/AbstractNumericPlayer.java:48-124
 */
export abstract class AbstractNumericPlayer extends Player {
  readonly #timeSeries = new TimeSeries();
  readonly #constraints: TimeConstraint[] = [];
  #initialState: number | undefined;
  #ticksEvery: number | undefined;

  /** java:64-67: height 100, no general background. */
  protected constructor(args: NumericPlayerArgs, sname: SName) {
    super({ ...args, generalBackgroundColor: undefined, sname, suggestedHeight: SUGGESTED_HEIGHT });
  }

  /** java:69-72 */
  public override defineState(_stateCode: string, _label: string): void {
    throw new Error('java.lang.UnsupportedOperationException');
  }

  /**
   * java:74-84: the first value ever set is also the initial state, whatever its tick (`if (initialState == null)`).
   * Only `valueString[0]` is read (an empty list is `ArrayIndexOutOfBoundsException`).
   */
  public override setState(
    now: TimeTick | undefined,
    _comment: string | undefined,
    _color: Colors,
    ...valueString: string[]
  ): void {
    if (valueString.length === 0) throw new Error('java.lang.ArrayIndexOutOfBoundsException');
    const value = AbstractNumericPlayer.#parseValue(valueString[0] as string);
    if (now === undefined) this.#initialState = value;
    else this.#timeSeries.put(now, value);

    if (this.#initialState === undefined) this.#initialState = value;
  }

  /** java:86-93: an unparsable value is logged (`Logme.error`, not ported: the library logs nothing) and is 0. */
  static #parseValue(value: string): number {
    return parseDouble(value) ?? 0;
  }

  /** java:95-98 */
  public override createConstraint(
    tick1: TimeTick,
    tick2: TimeTick,
    message: string | null,
    config: ArrowConfiguration,
  ): void {
    this.#constraints.push(
      new TimeConstraint({
        marginx: CONSTRAINT_OFFSET,
        tick1,
        tick2,
        label: message,
        skinParam: this.getSkinParam(),
        config,
      }),
    );
  }

  /** java:100-102 */
  public setBounds(min: string, max: string): void {
    this.#timeSeries.setBounds(min, max);
  }

  /** java:104-106 */
  public setTicks(ticksEvery: number): void {
    this.#ticksEvery = ticksEvery;
  }

  /** java:108-110 */
  protected getTimeSeries(): TimeSeries {
    return this.#timeSeries;
  }

  /** java:112-114 */
  protected getConstraints(): TimeConstraint[] {
    return this.#constraints;
  }

  /** java:116-118 */
  protected getInitialState(): number | undefined {
    return this.#initialState;
  }

  /** java:120-122 */
  protected getTicksEvery(): number | undefined {
    return this.#ticksEvery;
  }
}
