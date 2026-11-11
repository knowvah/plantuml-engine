import type { Colors } from '../../core/abel/Colors.js';
import { parseDouble } from '../../core/java-number-format.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import type { Panels } from './graphic/Panels.js';
import { PanelsAnalog } from './graphic/PanelsAnalog.js';
import { Player, type PlayerBaseArgs } from './Player.js';
import { TimeConstraint } from './TimeConstraint.js';
import type { TimeTick } from './TimeTick.js';
import { TimeSeries } from './TimeSeries.js';

/** The five `PlayerAnalog` constructor arguments: the base six without the background (java:58-60 passes `null`). */
export type PlayerAnalogArgs = Omit<PlayerBaseArgs, 'generalBackgroundColor'>;

/** The suggested height of an analog player (PlayerAnalog.java:59). */
const SUGGESTED_HEIGHT = 100;
/** The constraint offset of an analog player (PlayerAnalog.java:98). */
const CONSTRAINT_OFFSET = 1;

/**
 * `analog "Vcore" between -4.5 and 6.5 as VCC`: a polyline over numeric values.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerAnalog.java:49-109
 */
export class PlayerAnalog extends Player {
  readonly #timeSeries = new TimeSeries();
  readonly #constraints: TimeConstraint[] = [];
  #initialState: number | undefined;
  #ticksEvery: number | undefined;

  /** java:58-60: `SName.analog`, height 100, no general background. */
  public constructor(args: PlayerAnalogArgs) {
    super({ ...args, generalBackgroundColor: undefined, sname: 'analog', suggestedHeight: SUGGESTED_HEIGHT });
  }

  /** java:62-67 */
  protected override buildPlayerPanels(): Panels {
    return new PanelsAnalog({
      ruler: this.getRuler(),
      skinParam: this.getSkinParam(),
      suggestedHeight: this.getSuggestedHeight(),
      style: this.getStyle(),
      timeSeries: this.#timeSeries,
      constraints: this.#constraints,
      initialState: this.#initialState,
      ticksEvery: this.#ticksEvery,
    });
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
    const value = this.#getState(valueString[0] as string);
    if (now === undefined) this.#initialState = value;
    else this.#timeSeries.put(now, value);

    if (this.#initialState === undefined) this.#initialState = value;
  }

  /** java:86-93: an unparsable value is logged (`Logme.error`, not ported: the library logs nothing) and is 0. */
  #getState(value: string): number {
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

  /** java:101-103 */
  public setBounds(min: string, max: string): void {
    this.#timeSeries.setBounds(min, max);
  }

  /** java:105-107 */
  public setTicks(ticksEvery: number): void {
    this.#ticksEvery = ticksEvery;
  }
}
