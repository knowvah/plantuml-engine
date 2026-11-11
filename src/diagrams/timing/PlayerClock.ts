import type { Colors } from '../../core/abel/Colors.js';
import type { BigDecimal } from '../../core/decimal/BigDecimal.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import type { Panels } from './graphic/Panels.js';
import { PanelsClock } from './graphic/PanelsClock.js';
import { Player, type PlayerBaseArgs } from './Player.js';
import type { TimeTick } from './TimeTick.js';

/**
 * The eight `PlayerClock` constructor arguments (D16): the base six without the background (java:55 passes
 * `null`), plus `period`, `pulse` and `offset` as `BigDecimal` (D3).
 */
export interface PlayerClockArgs extends Omit<PlayerBaseArgs, 'generalBackgroundColor'> {
  readonly period: BigDecimal;
  readonly pulse: BigDecimal;
  readonly offset: BigDecimal;
}

/** The suggested height of a clock player (PlayerClock.java:55). */
const SUGGESTED_HEIGHT = 30;

/**
 * `clock clk with period 50 pulse 15 offset 10`: a square wave. It has no states: every state method throws.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerClock.java:47-87
 */
export class PlayerClock extends Player {
  readonly #period: BigDecimal;
  readonly #pulse: BigDecimal;
  readonly #offset: BigDecimal;

  /** java:53-60: `SName.clock`, height 30, no general background. */
  public constructor(args: PlayerClockArgs) {
    super({ ...args, generalBackgroundColor: undefined, sname: 'clock', suggestedHeight: SUGGESTED_HEIGHT });
    this.#period = args.period;
    this.#pulse = args.pulse;
    this.#offset = args.offset;
  }

  /** java:62-66: no constraints. */
  protected override buildPlayerPanels(): Panels {
    return new PanelsClock({
      ruler: this.getRuler(),
      skinParam: this.getSkinParam(),
      suggestedHeight: this.getSuggestedHeight(),
      style: this.getStyle(),
      period: this.#period,
      pulse: this.#pulse,
      offset: this.#offset,
      constraints: undefined,
    });
  }

  /** java:68-71 */
  public override defineState(_stateCode: string, _label: string): void {
    throw new Error('java.lang.UnsupportedOperationException');
  }

  /** java:73-76 */
  public override setState(
    _now: TimeTick | undefined,
    _comment: string | undefined,
    _color: Colors,
    ..._states: string[]
  ): void {
    throw new Error('java.lang.UnsupportedOperationException');
  }

  /** java:78-81 */
  public override createConstraint(
    _tick1: TimeTick,
    _tick2: TimeTick,
    _message: string | null,
    _config: ArrowConfiguration,
  ): void {
    throw new Error('java.lang.UnsupportedOperationException');
  }

  /** java:83-85 */
  public getPeriod(): BigDecimal {
    return this.#period;
  }
}
