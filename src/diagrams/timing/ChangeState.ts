import { ColorType } from '../../core/abel/ColorType.js';
import type { Colors } from '../../core/abel/Colors.js';
import { Fashion } from '../../core/klimt/Fashion.js';
import type { UStroke } from '../../core/klimt/UStroke.js';
import type { Style } from '../../core/style/Style.js';
import type { HColor } from '../../core/style/Value.js';
import type { TimeTick } from './TimeTick.js';
import type { TimingSkinParam } from './timing-klimt.js';

/** `{...}` (ChangeState.java:98). */
const BLANK = '{...}';
/** `{hidden}` (ChangeState.java:102). */
const COMPLETELY_HIDDEN = '{hidden}';
/** `{-}` (ChangeState.java:110). */
const FLAT = '{-}';

/**
 * One `X is state` at a tick. A `TreeSet<ChangeState>` orders and dedupes these by `compareTo` (D6).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/ChangeState.java:55-120
 */
export class ChangeState {
  readonly #when: TimeTick;
  readonly #states: readonly string[];
  readonly #comment: string | undefined;
  readonly #colors: Colors | undefined;

  /** `states` is varargs: an empty list throws `IllegalArgumentException` (java:63-64). */
  public constructor(when: TimeTick, comment: string | undefined, colors: Colors | undefined, ...states: string[]) {
    if (states.length === 0) throw new Error('java.lang.IllegalArgumentException');
    this.#when = when;
    this.#states = states;
    this.#comment = comment;
    this.#colors = colors;
  }

  /** java:69-71: the order is the tick's, nothing else. */
  public compareTo(other: ChangeState): number {
    return this.#when.compareTo(other.#when);
  }

  public getWhen(): TimeTick {
    return this.#when;
  }

  public getState(): string {
    return this.#first();
  }

  public getStates(): readonly string[] {
    return this.#states;
  }

  public getComment(): string | undefined {
    return this.#comment;
  }

  /** java:89-94 */
  public getBackColor(skinParam: TimingSkinParam, style: Style): HColor {
    const back = this.#colors?.getColor(ColorType.BACK);
    if (back === undefined) return style.value('BackGroundColor').asColor(skinParam.getIHtmlColorSet());
    // abel's `HColor` is a structural placeholder (`object`) for the style layer's `HColor`.
    return back as HColor;
  }

  /** java:96-101 */
  #getLineColor(skinParam: TimingSkinParam, style: Style): HColor {
    const line = this.#colors?.getColor(ColorType.LINE);
    if (line === undefined) return style.value('LineColor').asColor(skinParam.getIHtmlColorSet());
    return line as HColor;
  }

  /** java:103-105 */
  #getStroke(style: Style): UStroke {
    return style.getStroke();
  }

  /** java:107-109 */
  public getContext(skinParam: TimingSkinParam, style: Style): Fashion {
    return new Fashion(this.getBackColor(skinParam, style), this.#getLineColor(skinParam, style)).withStroke(
      this.#getStroke(style),
    );
  }

  public isBlank(): boolean {
    return this.#first() === BLANK;
  }

  public isCompletelyHidden(): boolean {
    return this.#first() === COMPLETELY_HIDDEN;
  }

  public isFlat(): boolean {
    return ChangeState.isFlat(this.#first());
  }

  public static isFlat(state: string): boolean {
    return state === FLAT;
  }

  // `isUnknown` stays commented out upstream (ChangeState.java:127-129): `// return states[0].equals("{?}");`

  #first(): string {
    // `states.length > 0` is the constructor's guarantee (java:63-64), so `states[0]` always exists.
    return this.#states[0] as string;
  }
}
