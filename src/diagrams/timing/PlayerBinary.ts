import type { Colors } from '../../core/abel/Colors.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import { ChangeState } from './ChangeState.js';
import { PanelsBinary } from './graphic/PanelsBinary.js';
import type { Panels } from './graphic/Panels.js';
import { Player, type PlayerBaseArgs } from './Player.js';
import { TimeConstraint } from './TimeConstraint.js';
import type { TimeTick } from './TimeTick.js';
import { treeMapPut, type TreeMapEntry } from './tree-set.js';

/** The five `PlayerBinary` constructor arguments: the base six without the background (java:60-62 passes `null`). */
export type PlayerBinaryArgs = Omit<PlayerBaseArgs, 'generalBackgroundColor'>;

/** `LOW_STRING` (PlayerBinary.java:53). */
const LOW_STRING = '0';
/** `HIGH_STRING` (PlayerBinary.java:54). */
const HIGH_STRING = '1';
/** The suggested height of a binary player (PlayerBinary.java:61). */
const SUGGESTED_HEIGHT = 30;
/** The constraint offset of a binary player (PlayerBinary.java:100). */
const CONSTRAINT_OFFSET = 2.5;

/**
 * `binary "Enable" as EN`: a line that is high (`1`, `high`) or low (anything else).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/PlayerBinary.java:51-103
 */
export class PlayerBinary extends Player {
  readonly #constraints: TimeConstraint[] = [];
  /** `TreeMap<TimeTick, ChangeState>` (java:57): a second value at an equal tick replaces the first (D6). */
  readonly #values: TreeMapEntry<TimeTick, ChangeState>[] = [];
  #initialState: ChangeState | undefined;

  /** java:60-62: `SName.binary`, height 30, no general background. */
  public constructor(args: PlayerBinaryArgs) {
    super({ ...args, generalBackgroundColor: undefined, sname: 'binary', suggestedHeight: SUGGESTED_HEIGHT });
  }

  /** java:64-69 */
  protected override buildPlayerPanels(): Panels {
    return new PanelsBinary({
      ruler: this.getRuler(),
      skinParam: this.getSkinParam(),
      suggestedHeight: this.getSuggestedHeight(),
      style: this.getStyle(),
      values: this.#values,
      constraints: this.#constraints,
      initialState: this.#initialState,
      notes: this.getNotes(),
    });
  }

  /** java:71-74 */
  public override defineState(_stateCode: string, _label: string): void {
    throw new Error('java.lang.UnsupportedOperationException');
  }

  /**
   * java:76-84. For the initial state Java passes `now == null` to `ChangeState`, which only keeps it; only
   * `getStates()` is read from that one.
   */
  public override setState(
    now: TimeTick | undefined,
    comment: string | undefined,
    color: Colors,
    ...states: string[]
  ): void {
    const cs = new ChangeState(now as TimeTick, comment, color, ...this.#convertStates(states));
    if (now === undefined) this.#initialState = cs;
    else treeMapPut(this.#values, now, cs);
  }

  /** java:86-90: one state or two; a third is dropped, and an empty list is `ArrayIndexOutOfBoundsException`. */
  #convertStates(states: readonly string[]): string[] {
    if (states.length === 1) return [this.#convert(states[0] as string)];
    if (states.length === 0) throw new Error('java.lang.ArrayIndexOutOfBoundsException');
    return [this.#convert(states[0] as string), this.#convert(states[1] as string)];
  }

  /** java:92-96: `1` and `high` in any case are high; everything else is low. */
  #convert(value: string): string {
    if (value === '1' || value.toLowerCase() === 'high') return HIGH_STRING;
    return LOW_STRING;
  }

  /** java:98-101 */
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
}
