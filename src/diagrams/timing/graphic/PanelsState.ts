import { ColorType } from '../../../core/abel/ColorType.js';
import type { Colors } from '../../../core/abel/Colors.js';
import { Position } from '../../../core/abel/Position.js';
import { Fashion } from '../../../core/klimt/Fashion.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import { XPoint2D } from '../../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import { TextBlockUtils } from '../../../core/klimt/shape/TextBlockUtils.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { HColor } from '../../../core/style/Value.js';
import { ChangeState } from '../ChangeState.js';
import type { TimeTick } from '../TimeTick.js';
import { fore } from '../timing-klimt.js';
import { IntricatedPoint } from './IntricatedPoint.js';
import { Panels, type PanelsArgs } from './Panels.js';

/** The ribbon height when the player has no `is N pixels height` (PanelsState.java:66). */
const DEFAULT_RIBBON_HEIGHT = 24;

/**
 * The shared drawing of a state player (`concise` and `rectangle`): one shape per interval between two changes,
 * the state before the first change, the states' labels, and the comments above them. The subclasses only choose
 * the shapes.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsState.java:64-300
 */
export abstract class PanelsState extends Panels {
  readonly #changes: ChangeState[] = [];
  #initialState: string | undefined;
  #initialColors: Colors | undefined;

  /** java:73-77: a height of 0 is the default ribbon. */
  protected constructor(args: PanelsArgs) {
    super({ ...args, suggestedHeight: args.suggestedHeight === 0 ? DEFAULT_RIBBON_HEIGHT : args.suggestedHeight });
  }

  /** java:79-91: both points are the change's when the tick is one, else the top and bottom of the ribbon. */
  public override getTimeProjection(
    stringBounder: StringBounder,
    tick: TimeTick | undefined,
  ): IntricatedPoint | undefined {
    if (tick === undefined) return undefined;
    const x = this.ruler.getPosInPixel(tick);
    const y =
      this.getHeightForConstraints(stringBounder) +
      this.getHeightForNotes(stringBounder, Position.TOP) +
      this.getHeightForTopComment(stringBounder) +
      this.getRibbonHeight() / 2;
    for (const change of this.#changes)
      if (change.getWhen().compareTo(tick) === 0) return new IntricatedPoint(new XPoint2D(x, y), new XPoint2D(x, y));

    return new IntricatedPoint(
      new XPoint2D(x, y - this.getRibbonHeight() / 2),
      new XPoint2D(x, y + this.getRibbonHeight() / 2),
    );
  }

  /** java:93-95: the player hands its changes over already sorted (a `TreeSet`), so this only appends. */
  public addChange(change: ChangeState): void {
    this.#changes.push(change);
  }

  /** java:97-99 */
  protected getPosInPixel(change: ChangeState): number {
    return this.ruler.getPosInPixel(change.getWhen());
  }

  /** java:101-104 */
  public override drawLeftPanel(_ug: UGraphic, _fullAvailableWidth: number): void {
    // nothing: the states are drawn on the right panel
  }

  /** java:106-109 */
  public override getLeftPanelWidth(stringBounder: StringBounder): number {
    return this.#getInitialWidth(stringBounder);
  }

  /** java:111-127 */
  public override drawRightPanel(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();

    const ugRibbon = ug.apply(
      UTranslate.dy(
        this.getHeightForConstraints(stringBounder) +
          this.getHeightForTopComment(stringBounder) +
          this.getHeightForNotes(stringBounder, Position.TOP),
      ),
    );

    this.#drawBeforeZeroState(ugRibbon);
    this.#drawBeforeZeroStateLabel(ugRibbon.apply(UTranslate.dy(this.getRibbonHeight() / 2)));
    this.#drawStates(ugRibbon);
    this.#drawStatesLabels(ugRibbon.apply(UTranslate.dy(this.getRibbonHeight() / 2)));

    this.drawConstraints(ug.apply(UTranslate.dy(this.getHeightForConstraints(stringBounder) / 2)));

    this.drawNotes(ug, Position.TOP);
    this.drawNotes(
      ug.apply(
        UTranslate.dy(
          this.getHeightForConstraints(stringBounder) +
            this.getRibbonHeight() +
            this.getHeightForNotes(stringBounder, Position.TOP),
        ),
      ),
      Position.BOTTOM,
    );
  }

  /** java:129-134: the width of the initial state's label plus a margin on both sides. */
  #getInitialWidth(stringBounder: StringBounder): number {
    if (this.#initialState === undefined) return 0;

    return this.createTextBlock(this.#initialState).calculateDimension(stringBounder).getWidth() + 2 * Panels.MARGIN_X;
  }

  protected abstract drawHexa(ug: UGraphic, len: number, change: ChangeState): void;

  protected abstract drawPentaA(ug: UGraphic, len: number, change: ChangeState): void;

  protected abstract drawPentaB(ug: UGraphic, len: number, change: ChangeState): void;

  /** java:142-145: `{-}` is a line through the middle of the ribbon, in the change's line colour. */
  protected drawFlat(ug: UGraphic, len: number, change: ChangeState): void {
    const line = ULine.hline(len);
    change
      .getContext(this.skinParam, this.style)
      .apply(ug)
      .apply(UTranslate.dy(this.getRibbonHeight() / 2))
      .draw(line);
  }

  /** java:147-149 */
  protected getRibbonHeight(): number {
    return this.suggestedHeight;
  }

  /** java:151-154 */
  public setInitialState(initialState: string | undefined, initialColors: Colors | undefined): void {
    this.#initialState = initialState;
    this.#initialColors = initialColors;
  }

  protected getInitialState(): string | undefined {
    return this.#initialState;
  }

  protected getInitialColors(): Colors | undefined {
    return this.#initialColors;
  }

  protected getChanges(): readonly ChangeState[] {
    return this.#changes;
  }

  /** java:168-184 */
  #drawBeforeZeroState(ug: UGraphic): void {
    const initialState = this.#initialState;
    if (initialState === undefined) return;
    const stringBounder = ug.getStringBounder();
    const initialWidth = this.#getInitialWidth(stringBounder);
    const first = this.#changes[0];
    if (first === undefined) {
      this.#drawSingle(ug.apply(UTranslate.dx(-initialWidth)), initialWidth + this.ruler.getWidth());
    } else {
      const a = this.getPosInPixel(first);
      if (ChangeState.isFlat(initialState))
        this.drawFlat(ug.apply(UTranslate.dx(-initialWidth)), initialWidth + a, first);
      else this.drawPentaA(ug.apply(UTranslate.dx(-initialWidth)), initialWidth + a, first);
    }
  }

  /** java:186-193 */
  #drawBeforeZeroStateLabel(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const initialState = this.#initialState;
    if (initialState !== undefined && !ChangeState.isFlat(initialState)) {
      const initial = this.createTextBlock(initialState);
      const dimInital = initial.calculateDimension(stringBounder);
      initial.drawU(ug.apply(new UTranslate(-Panels.MARGIN_X - dimInital.getWidth(), -dimInital.getHeight() / 2)));
    }
  }

  /** java:195-216: the initial state with no change after it, over the whole panel. */
  #drawSingle(ug: UGraphic, len: number): void {
    const colorSet = this.skinParam.getIHtmlColorSet();
    const back = this.style.value('BackGroundColor').asColor(colorSet);
    const line = this.style.value('LineColor').asColor(colorSet);
    const context = new Fashion(back, back).withStroke(this.style.getStroke());
    ug = context.apply(ug);

    const border = ULine.hline(len);
    const height = this.getRibbonHeight();

    if (ChangeState.isFlat(this.#initialState as string)) {
      ug = ug.apply(fore(line));
      ug.apply(UTranslate.dy(height / 2)).draw(border);
      return;
    }

    const rect = URectangle.build(len, height);
    ug.draw(rect);

    ug = ug.apply(fore(line));
    ug.draw(border);
    ug.apply(UTranslate.dy(height)).draw(border);
  }

  /**
   * java:218-236. `{-}` is a line, `{hidden}` nothing, anything else a hexagon; the last change is a flat line,
   * nothing or a pentagon opening to the right. (`if (TeaVM.a()) assert b > a;` is a TeaVM-only check.)
   */
  #drawStates(ug: UGraphic): void {
    for (let i = 0; i < this.#changes.length - 1; i++) {
      const change = this.#changes[i] as ChangeState;
      const a = this.getPosInPixel(change);
      const b = this.getPosInPixel(this.#changes[i + 1] as ChangeState);
      if (change.isFlat()) this.drawFlat(ug.apply(UTranslate.dx(a)), b - a, change);
      else if (!change.isCompletelyHidden()) this.drawHexa(ug.apply(UTranslate.dx(a)), b - a, change);
    }
    const last = this.#changes[this.#changes.length - 1];
    if (last !== undefined) {
      const a = this.getPosInPixel(last);
      if (last.isFlat()) this.drawFlat(ug.apply(UTranslate.dx(a)), this.ruler.getWidth() - a, last);
      else if (!last.isCompletelyHidden()) this.drawPentaB(ug.apply(UTranslate.dx(a)), this.ruler.getWidth() - a, last);
    }
  }

  /** java:238-260 */
  #drawStatesLabels(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    for (let i = 0; i < this.#changes.length; i++) {
      const change = this.#changes[i] as ChangeState;
      const x = this.ruler.getPosInPixel(change.getWhen());
      if (!change.isBlank() && !change.isCompletelyHidden() && !change.isFlat())
        this.#drawStateLabel(ug, i, x, stringBounder);
      const commentTopBlock = this.#getCommentTopBlock(change);
      const dimComment = commentTopBlock.calculateDimension(stringBounder);
      commentTopBlock.drawU(
        ug.apply(new UTranslate(x + Panels.MARGIN_X, -this.getRibbonHeight() / 2 - dimComment.getHeight())),
      );
    }
  }

  /** java:243-254: the label of change `i`, centred in its interval, or at the left of the last one. */
  #drawStateLabel(ug: UGraphic, i: number, x: number, stringBounder: StringBounder): void {
    const change = this.#changes[i] as ChangeState;
    const state = this.createTextBlock(change.getState());
    const dim = state.calculateDimension(stringBounder);
    let xtext: number;
    if (i === this.#changes.length - 1) {
      xtext = x + Panels.MARGIN_X;
    } else {
      const x2 = this.ruler.getPosInPixel((this.#changes[i + 1] as ChangeState).getWhen());
      xtext = (x + x2) / 2 - dim.getWidth() / 2;
    }
    state.drawU(ug.apply(new UTranslate(xtext, -dim.getHeight() / 2)));
  }

  /** java:262-267 */
  #getCommentTopBlock(change: ChangeState): TextBlock {
    const comment = change.getComment();
    if (comment === undefined) return TextBlockUtils.empty(0, 0);

    return this.createTextBlock(comment);
  }

  /** java:269-275 */
  protected getHeightForTopComment(stringBounder: StringBounder): number {
    let result = 0;
    for (const change of this.#changes)
      result = Math.max(result, this.#getCommentTopBlock(change).calculateDimension(stringBounder).getHeight());

    return result;
  }

  /** java:277-287: the initial state's colours override the change's. `initialColors` is dereferenced unguarded. */
  protected getContextWithInitialColors(change: ChangeState): Fashion {
    let context = change.getContext(this.skinParam, this.style);
    const initialColors = this.#initialColors;
    if (initialColors === undefined) throw new Error('java.lang.NullPointerException');
    const back = initialColors.getColor(ColorType.BACK);
    const line = initialColors.getColor(ColorType.LINE);
    if (back !== undefined) context = context.withBackColor(back as HColor);
    if (line !== undefined) context = context.withForeColor(line as HColor);
    return context;
  }

  /** java:289-292: at least 5. */
  protected override getHeightForConstraints(stringBounder: StringBounder): number {
    return Math.max(5, super.getHeightForConstraints(stringBounder));
  }

  /** java:294-298 */
  public override getFullHeight(stringBounder: StringBounder): number {
    return (
      this.getHeightForConstraints(stringBounder) +
      this.getHeightForTopComment(stringBounder) +
      this.getHeightForNotes(stringBounder, Position.TOP) +
      this.getRibbonHeight() +
      this.getHeightForNotes(stringBounder, Position.BOTTOM) +
      Panels.BOTTOM_MARGIN
    );
  }
}
