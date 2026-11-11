import { Position } from '../../../core/abel/Position.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { ChangeState } from '../ChangeState.js';
import type { TimeConstraint } from '../TimeConstraint.js';
import type { TimeTick } from '../TimeTick.js';
import type { TimingNote } from '../TimingNote.js';
import type { TreeMapEntry } from '../tree-set.js';
import { IntricatedPoint } from './IntricatedPoint.js';
import { Panels, type PanelsArgs } from './Panels.js';
import { PanelsNoLeft } from './PanelsNoLeft.js';

/** `LOW_STRING` (PanelsBinary.java:59). */
const LOW_STRING = '0';
/** `HIGH_STRING` (PanelsBinary.java:60). */
const HIGH_STRING = '1';
/** The step of the hatching of a two-state change (PanelsBinary.java:122). */
const HATCH_STEP = 5;

/**
 * The eight `PanelsBinary` constructor arguments (D16). `values` is Java's `SortedMap<TimeTick, ChangeState>`: the
 * entries in key order.
 */
export interface PanelsBinaryArgs extends Omit<PanelsArgs, 'notes' | 'constraints'> {
  readonly values: readonly TreeMapEntry<TimeTick, ChangeState>[];
  readonly constraints: readonly TimeConstraint[] | undefined;
  readonly initialState: ChangeState | undefined;
  readonly notes: readonly TimingNote[] | undefined;
}

/** What `drawRightPanel` threads through its helpers: the graphic, the two levels and the vertical stroke. */
interface BinaryDrawing {
  readonly ug: UGraphic;
  readonly stringBounder: StringBounder;
  readonly yhigh: number;
  readonly vline: ULine;
}

/** `List.equals` on two lists of strings. */
function sameStates(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((s, i) => s === b[i]);
}

/**
 * The panels of a `binary` player: a line at the high or the low level, with a vertical edge at each change.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsBinary.java:57-148
 */
export class PanelsBinary extends PanelsNoLeft {
  readonly #values: readonly TreeMapEntry<TimeTick, ChangeState>[];
  readonly #initialState: ChangeState | undefined;

  /** java:65-73 */
  public constructor(args: PanelsBinaryArgs) {
    super(args);
    this.#values = args.values;
    this.#initialState = args.initialState;
  }

  /** java:75-79 */
  public override getFullHeight(stringBounder: StringBounder): number {
    return (
      this.getHeightForConstraints(stringBounder) +
      this.getHeightForNotes(stringBounder, Position.TOP) +
      this.suggestedHeight +
      this.getHeightForNotes(stringBounder, Position.BOTTOM)
    );
  }

  /** java:81-87: both points are at the HIGH level whatever the value (`getYpos(stringBounder, HIGH_STRING)` twice). */
  public override getTimeProjection(
    stringBounder: StringBounder,
    tick: TimeTick | undefined,
  ): IntricatedPoint | undefined {
    if (tick === undefined) return undefined;
    const x = this.ruler.getPosInPixel(tick);
    return new IntricatedPoint(
      new XPoint2D(x, this.#getYpos(stringBounder, HIGH_STRING)),
      new XPoint2D(x, this.#getYpos(stringBounder, HIGH_STRING)),
    );
  }

  /** java:89-93: `equalsIgnoreCase("0")` is exact for a digit. */
  #getYpos(stringBounder: StringBounder, state: string): number {
    if (state === LOW_STRING) return this.#getYlow(stringBounder);
    return this.#getYhigh(stringBounder);
  }

  /** java:95-97 */
  #getYhigh(stringBounder: StringBounder): number {
    return (
      Panels.MARGIN_Y +
      this.getHeightForConstraints(stringBounder) +
      this.getHeightForNotes(stringBounder, Position.TOP)
    );
  }

  /** java:99-102 */
  #getYlow(stringBounder: StringBounder): number {
    return (
      this.getHeightForConstraints(stringBounder) +
      this.getHeightForNotes(stringBounder, Position.TOP) +
      this.suggestedHeight -
      Panels.MARGIN_Y
    );
  }

  /** java:105-146 */
  public override drawRightPanel(ug: UGraphic): void {
    ug = this.getContext().apply(ug);
    let lastx = 0;
    let lastValues: readonly string[] =
      this.#initialState === undefined ? [LOW_STRING] : this.#initialState.getStates();
    const stringBounder = ug.getStringBounder();
    const yhigh = this.#getYhigh(stringBounder);
    const ylow = this.#getYlow(stringBounder);
    const drawing: BinaryDrawing = { ug, stringBounder, yhigh, vline: ULine.vline(ylow - yhigh) };
    for (const ent of this.#values) {
      const value = ent.value;
      const x = this.ruler.getPosInPixel(ent.key);

      this.#drawSince(drawing, lastx, x, lastValues);
      this.#drawChange(drawing, x, lastValues, value);

      lastx = x;
      lastValues = value.getStates();
    }
    ug.apply(new UTranslate(lastx, this.#getYpos(stringBounder, lastValues[0] as string))).draw(
      ULine.hline(this.ruler.getWidth() - lastx),
    );

    this.#drawConstraintsAndNotes(ug, stringBounder);
  }

  /** java:139-146: the constraints under the band, the top note at the margin, the bottom one under the ribbon. */
  #drawConstraintsAndNotes(ug: UGraphic, stringBounder: StringBounder): void {
    this.drawConstraints(ug.apply(UTranslate.dy(this.getHeightForConstraints(ug.getStringBounder()))));

    this.drawNotes(ug.apply(UTranslate.dy(Panels.MARGIN_Y)), Position.TOP);
    this.drawNotes(
      ug.apply(
        UTranslate.dy(
          this.getHeightForConstraints(stringBounder) +
            this.getHeightForNotes(stringBounder, Position.TOP) +
            this.suggestedHeight -
            Panels.MARGIN_Y / 2,
        ),
      ),
      Position.BOTTOM,
    );
  }

  /** java:119-124: from the last change to this one, a line at the level, or hatching for a two-state value. */
  #drawSince(d: BinaryDrawing, lastx: number, x: number, lastValues: readonly string[]): void {
    if (lastValues.length === 1)
      d.ug
        .apply(new UTranslate(lastx, this.#getYpos(d.stringBounder, lastValues[0] as string)))
        .draw(ULine.hline(x - lastx));
    else for (let tmpx = lastx; tmpx < x; tmpx += HATCH_STEP) d.ug.apply(new UTranslate(tmpx, d.yhigh)).draw(d.vline);
  }

  /** java:125-132: the edge when the states differ, and the comment at the high level. */
  #drawChange(d: BinaryDrawing, x: number, lastValues: readonly string[], value: ChangeState): void {
    if (!sameStates(lastValues, value.getStates())) d.ug.apply(new UTranslate(x, d.yhigh)).draw(d.vline);

    const comment = value.getComment();
    if (comment !== undefined) this.getTextBlock(comment).drawU(d.ug.apply(new UTranslate(x + 2, d.yhigh)));
  }
}
