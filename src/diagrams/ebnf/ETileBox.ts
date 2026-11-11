/**
 * `ETileBox`: one box on the track — a terminal (square, stroke 0.5, no fill), a special sequence (dashed), or a
 * non-terminal (rounded 10, filled, stroke 1.5) — with an optional linked note above and below, centred in its
 * width. The commented-out double rectangle of the special sequence is not ported (eep D10).
 *
 * Adaptations: the seven-argument constructor takes {@link ETileBoxArgs} (the 5-parameter cap, eep D12); the
 * `ConfigurationStore<OptionKey>` is the preprocessor's option map (`PreprocessingArtifact#getOptions`, keyed by
 * `OptionKey`'s name). `VALUE_MAP` is a `HashMap` read only through `containsKey`/`get` (eep D5).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileBox.java:65-266
 */
import type { Direction } from '../../core/abel/Direction.js';
import type { HColorSet } from '../../core/klimt/color/HColorSet.js';
import { Display } from '../../core/klimt/creole/Display.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { XPoint2D } from '../../core/klimt/geom/XPoint2D.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import { type FontConfiguration, UText } from '../../core/klimt/shape/UText.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { Style } from '../../core/style/Style.js';
import { OptionKey } from '../../core/tim/EaterOption.js';
import { getLocalizedValue } from '../../core/utils/I18n.js';
import { FloatingNote } from '../activity/ftile/vcompact/FloatingNote.js';
import type { SkinParam } from './ebnf-skin-param.js';
import { back, fore } from './ebnf-klimt.js';
import { ETile } from './ETile.js';
import { Symbol } from './Symbol.js';

/** `ETileBox`'s constructor arguments, in Java's order. @see ETileBox.java:96-97 */
export interface ETileBoxArgs {
  readonly value: string;
  readonly symbol: Symbol;
  readonly fc: FontConfiguration;
  readonly style: Style;
  readonly colorSet: HColorSet;
  readonly skinParam: SkinParam;
  readonly option: ReadonlyMap<string, string>;
}

/** @see ETileBox.java:78-90 */
const VALUE_MAP: ReadonlyMap<string, string> = new Map([
  ['\\b', 'wordBoundary'],
  ['\\B', 'nonWordBoundary'],
  ['\\d', 'digit'],
  ['\\D', 'nonDigit'],
  ['\\w', 'word'],
  ['\\W', 'nonWord'],
  ['\\s', 'whitespace'],
  ['\\S', 'nonWhitespace'],
  ['.', 'anyChar'],
]);

/** The box is the text plus 5 on every side. @see ETileBox.java:109, :133, :150 */
const BOX_MARGIN = 10;
/** A note's gap to the box. @see ETileBox.java:118, :127, :175 */
const NOTE_GAP = 20;
/** `UStroke.withThickness(0.5)`, a terminal's border. @see ETileBox.java:181 */
const TERMINAL_THICKNESS = 0.5;
/** `new UStroke(5, 5, 1)`, a special sequence's border. @see ETileBox.java:184 */
const SPECIAL_SEQUENCE_STROKE = new UStroke(5, 5, 1);
/** `rounded(10)`, a non-terminal's corners. @see ETileBox.java:190 */
const NON_TERMINAL_ROUND = 10;
/** `UStroke.withThickness(1.5)`, a non-terminal's border. @see ETileBox.java:192 */
const NON_TERMINAL_THICKNESS = 1.5;
/** `drawHlineDirected(…, .5, 25)`. @see ETileBox.java:210-211 */
const SIDE_ARROW = { coef: 0.5, minimunSizeForArrow: 25 } as const;

/** `Boolean.parseBoolean`: `"true"`, any case. */
function parseBoolean(s: string | undefined): boolean {
  return s !== undefined && s.toLowerCase() === 'true';
}

export class ETileBox extends ETile {
  private readonly value: string;
  private readonly fc: FontConfiguration;
  private readonly style: Style;
  private readonly utext: UText;
  private readonly colorSet: HColorSet;
  private readonly symbol: Symbol;
  private readonly skinParam: SkinParam;
  private readonly option: ReadonlyMap<string, string>;
  private commentAbove: string | undefined;
  private commentBelow: string | undefined;

  /** @see ETileBox.java:92-94 */
  mergeWith(other: ETileBox): ETileBox {
    return new ETileBox({ ...this.args(), value: this.value + other.value });
  }

  private args(): ETileBoxArgs {
    const { symbol, fc, style, colorSet, skinParam, option } = this;
    return { value: this.value, symbol, fc, style, colorSet, skinParam, option };
  }

  /** @see ETileBox.java:96-106 */
  constructor(args: ETileBoxArgs) {
    super();
    this.symbol = args.symbol;
    this.skinParam = args.skinParam;
    this.option = args.option;
    this.value = this.getDrawValue(args.value);
    this.fc = args.fc;
    this.utext = UText.build(this.value, args.fc);
    this.style = args.style;
    this.colorSet = args.colorSet;
  }

  /** @see ETileBox.java:108-111 */
  private getPureH1(stringBounder: StringBounder): number {
    const height = this.getTextDim(stringBounder).getHeight() + BOX_MARGIN;
    return height / 2;
  }

  /** @see ETileBox.java:113-120 */
  getH1(stringBounder: StringBounder): number {
    let h1 = this.getPureH1(stringBounder);
    const note = this.getNoteAbove(stringBounder);
    if (note !== undefined) h1 += note.calculateDimension(stringBounder).getHeight() + NOTE_GAP;
    return h1;
  }

  /** @see ETileBox.java:122-129 */
  getH2(stringBounder: StringBounder): number {
    let h2 = this.getPureH1(stringBounder);
    const note = this.getNoteBelow(stringBounder);
    if (note !== undefined) h2 += note.calculateDimension(stringBounder).getHeight() + NOTE_GAP;
    return h2;
  }

  /** @see ETileBox.java:131-143 */
  getWidth(stringBounder: StringBounder): number {
    let width = this.getTextDim(stringBounder).getWidth() + BOX_MARGIN;
    const noteAbove = this.getNoteAbove(stringBounder);
    if (noteAbove !== undefined) width = Math.max(width, noteAbove.calculateDimension(stringBounder).getWidth());

    const noteBelow = this.getNoteBelow(stringBounder);
    if (noteBelow !== undefined) width = Math.max(width, noteBelow.calculateDimension(stringBounder).getWidth());

    return width;
  }

  /** `stringBounder.calculateDimension(fc.getFont(), value)`. @see ETileBox.java:145-147 */
  private getTextDim(stringBounder: StringBounder): XDimension2D {
    return stringBounder.calculateDimension(this.fc, this.value);
  }

  /** @see ETileBox.java:149-151 */
  private getBoxDim(stringBounder: StringBounder): XDimension2D {
    return this.getTextDim(stringBounder).delta(BOX_MARGIN);
  }

  /** @see ETileBox.java:153-156 */
  override addCommentAbove(comment: string): void {
    this.commentAbove = comment;
  }

  /** @see ETileBox.java:158-161 */
  override addCommentBelow(comment: string): void {
    this.commentBelow = comment;
  }

  /** @see ETileBox.java:163-214 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const dim = this.calculateDimension(stringBounder);
    const dimText = this.getTextDim(stringBounder);
    const dimBox = this.getBoxDim(stringBounder);

    const noteAbove = this.getNoteAbove(stringBounder);
    const noteBelow = this.getNoteBelow(stringBounder);
    const posy = noteAbove === undefined ? 0 : noteAbove.calculateDimension(stringBounder).getHeight() + NOTE_GAP;

    const posxBox = (dim.getWidth() - dimBox.getWidth()) / 2;

    this.drawBox(ug.apply(new UTranslate(posxBox, posy)), dimBox);

    ug.apply(new UTranslate(5 + posxBox, posy + 5 + dimText.getHeight() - this.utext.getDescent(stringBounder))).draw(
      this.utext,
    );

    if (noteAbove !== undefined) {
      const posxAbove = (dim.getWidth() - noteAbove.calculateDimension(stringBounder).getWidth()) / 2;
      noteAbove.drawU(ug.apply(new UTranslate(posxAbove, 0)));
    }

    if (noteBelow !== undefined) {
      const posxBelow = (dim.getWidth() - noteBelow.calculateDimension(stringBounder).getWidth()) / 2;
      const posyBelow = dim.getHeight() - noteBelow.calculateDimension(stringBounder).getHeight();
      noteBelow.drawU(ug.apply(new UTranslate(posxBelow, posyBelow)));
    }

    if (posxBox > 0) {
      this.drawHlineDirected(ug, this.getH1(stringBounder), 0, posxBox, SIDE_ARROW);
      this.drawHlineDirected(ug, this.getH1(stringBounder), posxBox + dimBox.getWidth(), dim.getWidth(), SIDE_ARROW);
    }
  }

  /** `drawU`'s three-way `symbol` branch, already translated to the box. @see ETileBox.java:179-193 */
  private drawBox(ug: UGraphic, dimBox: XDimension2D): void {
    const lineColor = this.style.value('LineColor').asColor(this.colorSet);
    if (this.symbol === Symbol.TERMINAL_STRING1 || this.symbol === Symbol.TERMINAL_STRING2) {
      const rect = URectangle.build(dimBox.getWidth(), dimBox.getHeight());
      ug.apply(fore(lineColor)).apply(UStroke.withThickness(TERMINAL_THICKNESS)).draw(rect);
    } else if (this.symbol === Symbol.SPECIAL_SEQUENCE) {
      const rect = URectangle.build(dimBox.getWidth(), dimBox.getHeight());
      ug.apply(fore(lineColor)).apply(SPECIAL_SEQUENCE_STROKE).draw(rect);
    } else {
      const backgroundColor = this.style.value('BackGroundColor').asColor(this.colorSet);
      const rect = URectangle.build(dimBox.getWidth(), dimBox.getHeight()).rounded(NON_TERMINAL_ROUND);
      ug.apply(fore(lineColor))
        .apply(back(backgroundColor))
        .apply(UStroke.withThickness(NON_TERMINAL_THICKNESS))
        .draw(rect);
    }
  }

  /** `TextBlockUtils.EMPTY_TEXT_BLOCK` is `undefined`. @see ETileBox.java:216-228 */
  private getNoteAbove(stringBounder: StringBounder): TextBlock | undefined {
    if (this.commentAbove === undefined) return undefined;
    return this.linkedNote(stringBounder, this.commentAbove, 'DOWN');
  }

  /** @see ETileBox.java:230-242 */
  private getNoteBelow(stringBounder: StringBounder): TextBlock | undefined {
    if (this.commentBelow === undefined) return undefined;
    return this.linkedNote(stringBounder, this.commentBelow, 'UP');
  }

  /**
   * The shared body of `getNoteAbove`/`getNoteBelow`: an `Opale` note linked from its centre to 20 px below it
   * (`DOWN`, pp1 at the note's bottom) or above it (`UP`, pp1 at its top). @see ETileBox.java:220-227, :234-241
   */
  private linkedNote(stringBounder: StringBounder, comment: string, direction: Direction): TextBlock {
    const note = FloatingNote.createOpale(
      Display.getWithNewlines(this.skinParam.getPragma(), comment),
      this.skinParam,
      'ebnf',
    );
    const dim = note.calculateDimension(stringBounder);
    const pos = dim.getWidth() * 0.5;
    if (direction === 'DOWN')
      note.setOpale(direction, new XPoint2D(pos, dim.getHeight()), new XPoint2D(pos, NOTE_GAP + dim.getHeight()));
    else note.setOpale(direction, new XPoint2D(pos, 0), new XPoint2D(pos, -NOTE_GAP));
    return note;
  }

  /** @see ETileBox.java:244-247 */
  push(_tile: ETile): void {
    throw new Error('UnsupportedOperationException');
  }

  /** @see ETileBox.java:249-252 */
  override getRepetitionLabel(): string {
    return this.value;
  }

  /** @see ETileBox.java:254-256 */
  getSymbol(): Symbol {
    return this.symbol;
  }

  /** @see ETileBox.java:258-264 */
  private getDrawValue(value: string): string {
    const name = VALUE_MAP.get(value);
    if (!parseBoolean(this.option.get(OptionKey.USE_DESCRIPTIVE_NAMES)) || name === undefined) return value;

    const language = this.option.get(OptionKey.LANGUAGE) ?? null;
    return getLocalizedValue(language, `regex.${name}`, value);
  }
}
