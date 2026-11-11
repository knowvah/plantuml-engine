import type { Colors } from '../../core/abel/Colors.js';
import type { ArrowConfiguration } from '../sequence/sequence-arrowhead.js';
import { ChangeState } from './ChangeState.js';
import { Player, type PlayerArgs } from './Player.js';
import { TimeConstraint } from './TimeConstraint.js';
import type { TimeTick } from './TimeTick.js';
import { treeSetAdd } from './tree-set.js';

/** The eight arguments of `AbstractStatePlayer`'s constructor (java:62-67): `Player`'s, less the height, plus the offset. */
export interface AbstractStatePlayerArgs extends Omit<PlayerArgs, 'suggestedHeight'> {
  readonly constraintOffset: number;
}

/**
 * A player whose value is a named state over time (`concise` and `rectangle`; `robust` too).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/AbstractStatePlayer.java:51-140
 */
export abstract class AbstractStatePlayer extends Player {
  /** `TreeSet<ChangeState>` (java:53): sorted on the tick, an equal tick is not added (D6). */
  readonly #changes: ChangeState[] = [];
  readonly #constraints: TimeConstraint[] = [];
  /** `LinkedHashMap<String, String>`. */
  readonly #statesLabel = new Map<string, string>();
  #initialState: string | undefined;
  #initialColors: Colors | undefined;
  readonly #constraintOffset: number;

  /** java:62-68: `super(..., sname, 0)`. */
  protected constructor(args: AbstractStatePlayerArgs) {
    super({ ...args, suggestedHeight: 0 });
    this.#constraintOffset = args.constraintOffset;
  }

  /** java:70-73 */
  public override createConstraint(
    tick1: TimeTick,
    tick2: TimeTick,
    message: string | null,
    config: ArrowConfiguration,
  ): void {
    this.#constraints.push(
      new TimeConstraint({
        marginx: this.#constraintOffset,
        tick1,
        tick2,
        label: message,
        skinParam: this.getSkinParam(),
        config,
      }),
    );
  }

  /**
   * java:75-86. Java rewrites `states[i]` in place; a `null` `now` is the initial state. `states[0]` is read
   * for the initial state, so an empty list throws (`ArrayIndexOutOfBoundsException`).
   */
  public override setState(
    now: TimeTick | undefined,
    comment: string | undefined,
    color: Colors,
    ...states: string[]
  ): void {
    const decoded = states.map((s) => this.#decodeState(s));
    if (now === undefined) {
      if (decoded.length === 0) throw new Error('java.lang.ArrayIndexOutOfBoundsException');
      this.#initialState = decoded[0];
      this.#initialColors = color;
    } else {
      // `this.changes.add(...)`: a second change at an equal tick is dropped (D6).
      treeSetAdd(this.#changes, new ChangeState(now, comment, color, ...decoded));
    }
  }

  /** java:88-94 */
  #decodeState(code: string): string {
    const label = this.#statesLabel.get(code);
    if (label === undefined) return code;
    return label;
  }

  /** java:96-99 */
  public override defineState(stateCode: string, label: string): void {
    this.#statesLabel.set(stateCode, label);
  }

  protected getChanges(): readonly ChangeState[] {
    return this.#changes;
  }

  protected getConstraints(): readonly TimeConstraint[] {
    return this.#constraints;
  }

  protected getStatesLabel(): ReadonlyMap<string, string> {
    return this.#statesLabel;
  }

  protected getInitialState(): string | undefined {
    return this.#initialState;
  }

  protected getInitialColors(): Colors | undefined {
    return this.#initialColors;
  }
}
