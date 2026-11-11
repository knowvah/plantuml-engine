import type { Colors } from '../../../core/abel/Colors.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { ChangeState } from '../ChangeState.js';
import { TimeConstraint } from '../TimeConstraint.js';
import type { TimeTick } from '../TimeTick.js';
import { back } from '../timing-klimt.js';
import { IntricatedPoint } from './IntricatedPoint.js';
import { Panels, type PanelsArgs } from './Panels.js';

/** `HISTOGRAM_BOTTOM_MARGIN` (PanelsRobust.java:62). */
const HISTOGRAM_BOTTOM_MARGIN = 12;
/** `HISTOGRAM_INITIAL_WIDTH` (PanelsRobust.java:63). */
const HISTOGRAM_INITIAL_WIDTH = 40;
/** The step height with no suggested height or fewer than two rows (PanelsRobust.java:333). */
const DEFAULT_STEP_HEIGHT = 20;
/** The least height of the band above the rows (PanelsRobust.java:304). */
const MIN_CONSTRAINTS_HEIGHT = 10;
/** The 5 px gap `drawLeftPanel` keeps between the labels and the ruler when there is room (java:181). */
const LEFT_PANEL_GAP = 5;
/** The step of the hatching in a two-state block (java:256). */
const HATCH_STEP = 5;
/** Added to the full height after the bottom margin (java:315). */
const FULL_HEIGHT_EXTRA = 6;

/**
 * The six `PanelsRobust` constructor arguments (D16). `someStates` is Java's `Collection<String>`: the values of the
 * player's label map, in insertion order.
 */
export interface PanelsRobustArgs extends Omit<PanelsArgs, 'notes' | 'constraints'> {
  readonly someStates: Iterable<string>;
  readonly constraints: PanelsArgs['constraints'];
}

/**
 * The panels of a `robust` player: one row per state, listed on the left, and a step waveform on the right.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsRobust.java:60-344
 */
export class PanelsRobust extends Panels {
  readonly #changes: ChangeState[] = [];
  /** `allStates` is reversed once on construction (java:75), so the declared states sit at the top. */
  readonly #allStates: string[];
  #initialState: string | undefined;

  /** java:72-76: no notes (`super(..., null, constraints)`). */
  public constructor(args: PanelsRobustArgs) {
    super({ ...args, notes: undefined });
    this.#allStates = [...args.someStates].reverse();
  }

  /** java:78-96: both points are the same when only one state is in force at the tick. */
  public override getTimeProjection(
    stringBounder: StringBounder,
    tick: TimeTick | undefined,
  ): IntricatedPoint | undefined {
    if (tick === undefined) return undefined;
    const x = this.ruler.getPosInPixel(tick);
    const states = this.#getStatesAt(tick);
    if (states.length === 0) return undefined;

    const heightForConstraints = this.getHeightForConstraints(stringBounder);
    if (states.length === 1) {
      const y = this.#yOfStateName(states[0] as string) + heightForConstraints;
      return new IntricatedPoint(new XPoint2D(x, y), new XPoint2D(x, y));
    }
    // `if (TeaVM.a()) assert states.size() == 2;` and `assert y1 != y2;` (java:90, 94) are TeaVM-only checks.
    const y1 = this.#yOfStateName(states[0] as string) + heightForConstraints;
    const y2 = this.#yOfStateName(states[1] as string) + heightForConstraints;
    return new IntricatedPoint(new XPoint2D(x, y1), new XPoint2D(x, y2));
  }

  /** java:98-127 */
  #getStatesAt(tick: TimeTick): readonly string[] {
    if (this.#changes.length === 0) return [];

    for (let i = 0; i < this.#changes.length; i++) {
      const change = this.#changes[i] as ChangeState;
      const comparison = change.getWhen().compareTo(tick);
      if (comparison === 0) return this.#statesOnChange(i);
      if (comparison > 0) {
        // `if (i == 0)`: a tick before the first change is taken as the leftmost (java:117-124).
        const changeIndex = i === 0 ? 0 : i - 1;
        return [(this.#changes[changeIndex] as ChangeState).getState()];
      }
    }
    return [(this.#changes[this.#changes.length - 1] as ChangeState).getState()];
  }

  /** java:103-114: the state before the change (or the initial one) and the change's. */
  #statesOnChange(i: number): readonly string[] {
    const state = (this.#changes[i] as ChangeState).getState();
    if (i === 0 && this.#initialState === undefined) return [state];
    if (i === 0) return [this.#initialState as string, state];

    return [(this.#changes[i - 1] as ChangeState).getState(), state];
  }

  /** java:129-138: a hidden change lists no state. */
  public addChange(change: ChangeState): void {
    this.#changes.push(change);
    if (change.isCompletelyHidden()) return;

    for (const state of change.getStates()) if (!this.#allStates.includes(state)) this.#allStates.push(state);
  }

  /** java:140-149 */
  #getPoints(n: number): XPoint2D[] {
    const change = this.#changes[n] as ChangeState;
    const x = this.ruler.getPosInPixel(change.getWhen());
    const states = change.getStates();
    if (states.length === 2)
      return [
        new XPoint2D(x, this.#yOfStateName(states[0] as string)),
        new XPoint2D(x, this.#yOfStateName(states[1] as string)),
      ];

    return [new XPoint2D(x, this.#yOfStateName(states[0] as string))];
  }

  /** java:151-154 */
  #getPointx(n: number): number {
    return this.ruler.getPosInPixel((this.#changes[n] as ChangeState).getWhen());
  }

  /** java:156-162 */
  #getPointMinY(n: number): number {
    const states = (this.#changes[n] as ChangeState).getStates();
    if (states.length === 2)
      return Math.min(this.#yOfStateName(states[0] as string), this.#yOfStateName(states[1] as string));

    return this.#yOfStateName(states[0] as string);
  }

  /** java:164-170 */
  #getPointMaxY(n: number): number {
    const states = (this.#changes[n] as ChangeState).getStates();
    if (states.length === 2)
      return Math.max(this.#yOfStateName(states[0] as string), this.#yOfStateName(states[1] as string));

    return this.#yOfStateName(states[0] as string);
  }

  /** java:172-191: the labels are right-aligned to the ruler, five pixels short of it when there is room. */
  public override drawLeftPanel(ug: UGraphic, fullAvailableWidth: number): void {
    const stringBounder = ug.getStringBounder();
    ug = ug.apply(UTranslate.dy(this.getHeightForConstraints(stringBounder)));

    let width = this.#getStatesWidth(stringBounder);
    if (this.#initialState !== undefined) width += HISTOGRAM_INITIAL_WIDTH;

    if (fullAvailableWidth > width + LEFT_PANEL_GAP)
      ug = ug.apply(UTranslate.dx(fullAvailableWidth - width - LEFT_PANEL_GAP));
    else ug = ug.apply(UTranslate.dx(fullAvailableWidth - width));
    for (const state of this.#allStates) {
      const label = this.getTextBlock(state);
      const dim = label.calculateDimension(stringBounder);
      label.drawU(ug.apply(UTranslate.dy(this.#yOfStateName(state) - dim.getHeight() / 2 + 1)));
    }
  }

  /** java:193-203 */
  public override drawRightPanel(ug: UGraphic): void {
    if (this.#changes.length === 0) return;

    ug = this.getContext().apply(ug);
    ug = ug.apply(UTranslate.dy(this.getHeightForConstraints(ug.getStringBounder())));
    this.#drawHlines(ug);
    this.#drawVlines(ug);
    this.#drawLabels(ug);
    this.drawConstraints(ug.apply(UTranslate.dy(-TimeConstraint.getTopMargin())));
  }

  /** java:205-214 */
  #getStatesWidth(stringBounder: StringBounder): number {
    let result = 0;
    for (const state of this.#allStates) {
      const label = this.getTextBlock(state);
      const dim = label.calculateDimension(stringBounder);
      result = Math.max(result, dim.getWidth());
    }
    return result;
  }

  /** java:216-220 */
  public override getLeftPanelWidth(stringBounder: StringBounder): number {
    if (this.#initialState === undefined) return this.#getStatesWidth(stringBounder);
    return this.#getStatesWidth(stringBounder) + HISTOGRAM_INITIAL_WIDTH;
  }

  /** java:222-248: the line from before the first change, each change's lines, and the last change's to the end. */
  #drawHlines(ug: UGraphic): void {
    if (this.#initialState !== undefined)
      for (const pt of this.#getPoints(0))
        this.drawHLineFromPoint(ug, this.#getInitialPoint(), HISTOGRAM_INITIAL_WIDTH + pt.getX());

    for (let i = 0; i < this.#changes.length; i++) this.#drawHlinesOfChange(ug, i);

    const last = this.#changes.length - 1;
    if (!(this.#changes[last] as ChangeState).isCompletelyHidden())
      for (const pt of this.#getPoints(last)) this.drawHLineFromPoint(ug, pt, this.ruler.getWidth() - pt.getX());
  }

  /** java:227-243: the body of `drawHlines`' loop. */
  #drawHlinesOfChange(ug: UGraphic, i: number): void {
    const change = this.#changes[i] as ChangeState;
    if (change.isCompletelyHidden()) return;

    const x2 = i < this.#changes.length - 1 ? this.#getPointx(i + 1) : this.ruler.getWidth();
    const len = x2 - this.#getPointx(i);
    const points = this.#getPoints(i);
    const [first, second] = points as [XPoint2D, XPoint2D?];
    if (second !== undefined)
      this.#drawHBlock(ug.apply(back(change.getBackColor(this.skinParam, this.style))), first, second, len);

    if (i < this.#changes.length - 1) for (const pt of points) this.drawHLineFromPoint(ug, pt, len);
  }

  /** java:250-258: a box between the two rows, hatched every 5 px. */
  #drawHBlock(ug: UGraphic, pt1: XPoint2D, pt2: XPoint2D, len: number): void {
    const minY = Math.min(pt1.getY(), pt2.getY());
    const maxY = Math.max(pt1.getY(), pt2.getY());
    const pt = new XPoint2D(pt1.getX(), minY);
    ug = ug.apply(UTranslate.point(pt));
    ug.draw(URectangle.build(len, maxY - minY));
    for (let x = 0; x < len; x += HATCH_STEP) ug.apply(UTranslate.dx(x)).draw(ULine.vline(maxY - minY));
  }

  /** java:260-274 */
  #drawVlines(ug: UGraphic): void {
    if (this.#initialState !== undefined) {
      const before = this.#getInitialPoint();
      const current = this.#getPoints(0)[0] as XPoint2D;
      this.drawVline(ug, current.getX(), current.getY(), ULine.vline(before.getY() - current.getY()));
    }
    for (let i = 1; i < this.#changes.length; i++) {
      if (
        (this.#changes[i - 1] as ChangeState).isCompletelyHidden() ||
        (this.#changes[i] as ChangeState).isCompletelyHidden()
      )
        continue;

      const minY = Math.min(this.#getPointMinY(i), this.#getPointMinY(i - 1));
      const maxY = Math.max(this.#getPointMaxY(i), this.#getPointMaxY(i - 1));
      this.drawVline(ug, this.#getPointx(i), minY, ULine.vline(maxY - minY));
    }
  }

  /**
   * java:276-288. `getPoints(i)[0]` is read before the comment test, so a hidden change with no listed state
   * is still resolved (`yOfState` of an unlisted state is a full step below the last row).
   */
  #drawLabels(ug: UGraphic): void {
    for (let i = 0; i < this.#changes.length; i++) {
      const ptLabel = this.#getPoints(i)[0] as XPoint2D;
      const comment = (this.#changes[i] as ChangeState).getComment();
      if (comment === undefined) continue;

      const label = this.getTextBlock(comment);
      const dim = label.calculateDimension(ug.getStringBounder());
      label.drawU(ug.apply(UTranslate.point(ptLabel).compose(new UTranslate(2, -dim.getHeight()))));
    }
  }

  /** java:290-296: the constraint is lifted to the highest row it spans. */
  protected override getConstraintDeltaY(constraint: TimeConstraint): number {
    let y = this.#yOfStateAt(constraint.getTick1());
    for (const change of this.#changes)
      if (constraint.containsStrict(change.getWhen())) y = Math.min(y, this.#yOfStateAt(change.getWhen()));
    return y;
  }

  /** java:298-300 */
  #getInitialPoint(): XPoint2D {
    return new XPoint2D(-HISTOGRAM_INITIAL_WIDTH, this.#yOfStateName(this.#initialState as string));
  }

  /** java:302-305 */
  protected override getHeightForConstraints(stringBounder: StringBounder): number {
    return Math.max(MIN_CONSTRAINTS_HEIGHT, super.getHeightForConstraints(stringBounder));
  }

  /** java:307-316 */
  public override getFullHeight(stringBounder: StringBounder): number {
    let height = this.getHeightForConstraints(stringBounder);

    if (this.#allStates.length > 0) height += this.#stepHeight() * (this.#allStates.length - 1);

    height += HISTOGRAM_BOTTOM_MARGIN;
    return height + FULL_HEIGHT_EXTRA;
  }

  /** java:318-321: `indexOf` is -1 for an unlisted state, as in Java. */
  #yOfStateName(state: string): number {
    const nb = this.#allStates.length - 1 - this.#allStates.indexOf(state);
    return this.#stepHeight() * nb;
  }

  /** java:323-329: `last` of an empty list is `IndexOutOfBoundsException`. */
  #yOfStateAt(when: TimeTick): number {
    const states = this.#getStatesAt(when);
    if (states.length === 0) throw new Error('java.lang.IndexOutOfBoundsException');
    return this.#yOfStateName(states[states.length - 1] as string);
  }

  /** java:331-336 */
  #stepHeight(): number {
    if (this.suggestedHeight === 0 || this.#allStates.length <= 1) return DEFAULT_STEP_HEIGHT;

    return this.suggestedHeight / (this.#allStates.length - 1);
  }

  /** java:338-342 */
  public setInitialState(initialState: string | undefined, _initialColors: Colors | undefined): void {
    this.#initialState = initialState;
    if (initialState !== undefined && !this.#allStates.includes(initialState)) this.#allStates.push(initialState);
  }
}
