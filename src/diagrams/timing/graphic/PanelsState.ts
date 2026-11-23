import { ColorType } from '../../../core/abel/ColorType.js';
import type { Colors } from '../../../core/abel/Colors.js';
import { Position } from '../../../core/abel/Position.js';
import { Fashion } from '../../../core/klimt/Fashion.js';
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../../core/klimt/geom/XDimension2D.js';
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
/** Minimal horizontal space between a state label overflowing its band and its neighbours (PanelsState.java:67-68,
 *  upstream b066ee08c). */
const LABEL_GAP = 4;

/**
 * A state label at its x, and whether it fits its band.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsState.java:282-304 (upstream b066ee08c)
 */
class StateLabel {
  public readonly width: number;
  public readonly height: number;

  /** java:290-296 */
  public constructor(
    public readonly text: TextBlock,
    public readonly x: number,
    dim: XDimension2D,
    public readonly fits: boolean,
  ) {
    this.width = dim.getWidth();
    this.height = dim.getHeight();
  }

  /** java:298-303: closer than `LABEL_GAP` to another label (by identity, as Java's `other != this`). */
  public overlapsAny(others: readonly StateLabel[]): boolean {
    for (const other of others)
      if (other !== this && this.x < other.x + other.width + LABEL_GAP && other.x < this.x + this.width + LABEL_GAP)
        return true;
    return false;
  }
}

/**
 * The shared drawing of a state player (`concise` and `rectangle`): one shape per interval between two changes,
 * the state before the first change, the states' labels, and the comments above them. The subclasses only choose
 * the shapes.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/timingdiagram/graphic/PanelsState.java:64-344 (upstream b066ee08c)
 */
export abstract class PanelsState extends Panels {
  readonly #changes: ChangeState[] = [];
  #initialState: string | undefined;
  #initialColors: Colors | undefined;

  /** java:75-79: a height of 0 is the default ribbon. */
  protected constructor(args: PanelsArgs) {
    super({ ...args, suggestedHeight: args.suggestedHeight === 0 ? DEFAULT_RIBBON_HEIGHT : args.suggestedHeight });
  }

  /** java:81-93: both points are the change's when the tick is one, else the top and bottom of the ribbon. */
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

  /** java:95-97: the player hands its changes over already sorted (a `TreeSet`), so this only appends. */
  public addChange(change: ChangeState): void {
    this.#changes.push(change);
  }

  /** java:99-101 */
  protected getPosInPixel(change: ChangeState): number {
    return this.ruler.getPosInPixel(change.getWhen());
  }

  /** java:103-106 */
  public override drawLeftPanel(_ug: UGraphic, _fullAvailableWidth: number): void {
    // nothing: the states are drawn on the right panel
  }

  /** java:108-111 */
  public override getLeftPanelWidth(stringBounder: StringBounder): number {
    return this.#getInitialWidth(stringBounder);
  }

  /** java:113-129 */
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

  /** java:131-136: the width of the initial state's label plus a margin on both sides. */
  #getInitialWidth(stringBounder: StringBounder): number {
    if (this.#initialState === undefined) return 0;

    return this.createTextBlock(this.#initialState).calculateDimension(stringBounder).getWidth() + 2 * Panels.MARGIN_X;
  }

  protected abstract drawHexa(ug: UGraphic, len: number, change: ChangeState): void;

  protected abstract drawPentaA(ug: UGraphic, len: number, change: ChangeState): void;

  protected abstract drawPentaB(ug: UGraphic, len: number, change: ChangeState): void;

  /** java:144-147: `{-}` is a line through the middle of the ribbon, in the change's line colour. */
  protected drawFlat(ug: UGraphic, len: number, change: ChangeState): void {
    const line = ULine.hline(len);
    change
      .getContext(this.skinParam, this.style)
      .apply(ug)
      .apply(UTranslate.dy(this.getRibbonHeight() / 2))
      .draw(line);
  }

  /** java:149-151 */
  protected getRibbonHeight(): number {
    return this.suggestedHeight;
  }

  /** java:153-156 */
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

  /** java:170-186 */
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

  /** java:188-195 */
  #drawBeforeZeroStateLabel(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const initialState = this.#initialState;
    if (initialState !== undefined && !ChangeState.isFlat(initialState)) {
      const initial = this.createTextBlock(initialState);
      const dimInital = initial.calculateDimension(stringBounder);
      initial.drawU(ug.apply(new UTranslate(-Panels.MARGIN_X - dimInital.getWidth(), -dimInital.getHeight() / 2)));
    }
  }

  /** java:197-218: the initial state with no change after it, over the whole panel. */
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
   * java:220-238. `{-}` is a line, `{hidden}` nothing, anything else a hexagon; the last change is a flat line,
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

  /** java:240-254 (upstream b066ee08c): every state label first, then every comment. */
  #drawStatesLabels(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const labels = this.#getStatesLabels(stringBounder);
    for (const label of labels)
      if (label.fits || !label.overlapsAny(labels))
        label.text.drawU(ug.apply(new UTranslate(label.x, -label.height / 2)));

    for (const change of this.#changes) {
      const x = this.ruler.getPosInPixel(change.getWhen());
      const commentTopBlock = this.#getCommentTopBlock(change);
      const dimComment = commentTopBlock.calculateDimension(stringBounder);
      commentTopBlock.drawU(
        ug.apply(new UTranslate(x + Panels.MARGIN_X, -this.getRibbonHeight() / 2 - dimComment.getHeight())),
      );
    }
  }

  /**
   * The label of a state is centred on its band. When the band is too short for it (events close in time, #3028), the
   * label overflows on its neighbours: it is then drawn only if it stays at least LABEL_GAP away from the label of
   * another state, otherwise both would be unreadable. A label that fits its band is always drawn.
   * java:256-280 (upstream b066ee08c)
   */
  #getStatesLabels(stringBounder: StringBounder): StateLabel[] {
    const result: StateLabel[] = [];
    for (let i = 0; i < this.#changes.length; i++) {
      const change = this.#changes[i] as ChangeState;
      if (change.isBlank() || change.isCompletelyHidden() || change.isFlat()) continue;
      const x = this.ruler.getPosInPixel(change.getWhen());
      const state = this.createTextBlock(change.getState());
      const dim = state.calculateDimension(stringBounder);
      if (i === this.#changes.length - 1) {
        result.push(new StateLabel(state, x + Panels.MARGIN_X, dim, true));
      } else {
        const x2 = this.ruler.getPosInPixel((this.#changes[i + 1] as ChangeState).getWhen());
        result.push(new StateLabel(state, (x + x2) / 2 - dim.getWidth() / 2, dim, dim.getWidth() <= x2 - x));
      }
    }
    return result;
  }

  /** java:306-311 (upstream b066ee08c) */
  #getCommentTopBlock(change: ChangeState): TextBlock {
    const comment = change.getComment();
    if (comment === undefined) return TextBlockUtils.empty(0, 0);

    return this.createTextBlock(comment);
  }

  /** java:313-319 (upstream b066ee08c) */
  protected getHeightForTopComment(stringBounder: StringBounder): number {
    let result = 0;
    for (const change of this.#changes)
      result = Math.max(result, this.#getCommentTopBlock(change).calculateDimension(stringBounder).getHeight());

    return result;
  }

  /** java:321-331 (upstream b066ee08c): the initial state's colours override the change's. `initialColors` is dereferenced unguarded. */
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

  /** java:333-336 (upstream b066ee08c): at least 5. */
  protected override getHeightForConstraints(stringBounder: StringBounder): number {
    return Math.max(5, super.getHeightForConstraints(stringBounder));
  }

  /** java:338-342 (upstream b066ee08c) */
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
