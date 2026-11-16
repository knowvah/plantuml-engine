/**
 * `TextBlockCucaJSon` — the entries area of a `json` leaf: a recursive table of key cells and value cells
 * (`TextBlockJson` for an object, `TextBlockArray` for an array, a margin-5,2 creole cell for a scalar).
 *
 * `setTotalWidth` is the draw-time width the root table's horizontal lines run to
 * (`EntityImageJson#drawU` sets it to the finished box width, `EntityImageJson.java:207`); no dimension reads it.
 * A nested object's lines run to `jsonTotalWidth - width1` (`TextBlockCucaJSon.java:171`), and an array element
 * inherits its array's width unchanged (`:206`, `:218`).
 *
 * A cell is `Display.getWithNewlines(pragma, key).create0(fc, LEFT, skinParam, wordWrap, CreoleMode.FULL, …)`
 * margined by 5,2 (`:184-190`); the creole line is built by `buildTextBlock`, this port's `create0` seam for
 * leaf text (`EntityImageDescriptionTextBlock.ts`).
 *
 * The class and state engines keep their own copies (`class-json-sizing.ts`, `state-json-sizing.ts`); decisions D1.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cucadiagram/TextBlockCucaJSon.java:58-236
 */
import type { JsonNode } from '../../command/JsonNode.js';
import { Display } from '../../klimt/creole/Display.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../../klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../../klimt/shape/TextBlock.js';
import { TextBlockMemoized } from '../../klimt/shape/TextBlockMemoized.js';
import { TextBlockUtils } from '../../klimt/shape/TextBlockUtils.js';
import type { FontConfiguration } from '../../klimt/shape/UText.js';
import { ULine } from '../../klimt/shape/ULine.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UTranslate } from '../../klimt/UTranslate.js';
import { Pragma } from '../../skin/Pragma.js';
import { buildTextBlock } from './EntityImageDescriptionTextBlock.js';
import { JSON_CELL_MARGIN_X, JSON_CELL_MARGIN_Y } from './EntityImageJson.js';

type JsonObjectNode = Extract<JsonNode, { kind: 'object' }>;
type JsonArrayNode = Extract<JsonNode, { kind: 'array' }>;
type JsonScalarNode = Extract<JsonNode, { kind: 'scalar' }>;

/** `value.isString() ? value.asString() : value.toString()` (`TextBlockCucaJSon.java:89-90`). */
function scalarText(node: JsonScalarNode): string {
  const v = node.value;
  if (v === null) return 'null';
  return typeof v === 'string' ? v : String(v);
}

/** @see TextBlockCucaJSon.java:58 */
export class TextBlockCucaJSon implements TextBlock {
  private jsonTextBlock: TextBlock | undefined;
  private mainTotalWidth = 0;

  /** @see TextBlockCucaJSon.java:68-74 */
  constructor(
    private readonly fontConfiguration: FontConfiguration,
    private readonly json: JsonNode,
    private readonly wordWrap: number,
    private readonly pragma: Pragma = Pragma.createEmpty(),
  ) {}

  /** @see TextBlockCucaJSon.java:76-86 */
  private getJsonTextBlock(): TextBlock {
    this.jsonTextBlock ??= this.getTextBlockValue(this.json, 0);
    if (this.jsonTextBlock instanceof TextBlockJson) this.jsonTextBlock.jsonTotalWidth = this.mainTotalWidth;
    if (this.jsonTextBlock instanceof TextBlockArray) this.jsonTextBlock.arrayTotalWidth = this.mainTotalWidth;
    return this.jsonTextBlock;
  }

  /** @see TextBlockCucaJSon.java:88-100 */
  getTextBlockValue(value: JsonNode, width2: number): TextBlock {
    if (value.kind === 'scalar') return this.getTextBlock(scalarText(value));
    if (value.kind === 'array') return new TextBlockArray(this, value, width2);
    return new TextBlockJson(this, value, width2);
  }

  /** @see TextBlockCucaJSon.java:108-111 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return this.getJsonTextBlock().calculateDimension(stringBounder);
  }

  /** @see TextBlockCucaJSon.java:113-115 */
  drawU(ug: UGraphic): void {
    this.getJsonTextBlock().drawU(ug);
  }

  /** @see TextBlockCucaJSon.java:183-190 */
  getTextBlock(key: string): TextBlock {
    const display = Display.getWithNewlines(this.pragma, key);
    const text = Array.from(display, String).join('\n');
    const result = buildTextBlock(text, this.fontConfiguration, HorizontalAlignment.LEFT, undefined, this.wordWrap);
    // Java's 3-arg `withMargin(tb, marginX, marginY)`, spelled out as this port's 5-arg form.
    return TextBlockUtils.withMargin(
      result,
      JSON_CELL_MARGIN_X,
      JSON_CELL_MARGIN_X,
      JSON_CELL_MARGIN_Y,
      JSON_CELL_MARGIN_Y,
    );
  }

  /** @see TextBlockCucaJSon.java:233-235 */
  setTotalWidth(totalWidth: number): void {
    this.mainTotalWidth = totalWidth;
  }
}

/** @see TextBlockCucaJSon.java:117-182 */
class TextBlockJson extends TextBlockMemoized {
  constructor(
    private readonly outer: TextBlockCucaJSon,
    private readonly obj: JsonObjectNode,
    public jsonTotalWidth: number,
  ) {
    super();
  }

  /** @see TextBlockCucaJSon.java:127-130 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(
      this.getWidth1(stringBounder) + this.getWidth2(stringBounder),
      this.getHeight(stringBounder),
    );
  }

  /** @see TextBlockCucaJSon.java:132-139 */
  private getWidth1(stringBounder: StringBounder): number {
    let result = 0;
    for (const s of this.obj.entries)
      result = Math.max(result, this.outer.getTextBlock(s.key).calculateDimension(stringBounder).getWidth());
    return result;
  }

  /** @see TextBlockCucaJSon.java:141-148 */
  private getWidth2(stringBounder: StringBounder): number {
    let result = 0;
    for (const s of this.obj.entries) {
      const tb2 = this.outer.getTextBlockValue(s.value, this.jsonTotalWidth);
      result = Math.max(result, tb2.calculateDimension(stringBounder).getWidth());
    }
    return result;
  }

  /** @see TextBlockCucaJSon.java:150-160 */
  private getHeight(stringBounder: StringBounder): number {
    let result = 0;
    for (const s of this.obj.entries) {
      const dim1 = this.outer.getTextBlock(s.key).calculateDimension(stringBounder);
      const dim2 = this.outer.getTextBlockValue(s.value, this.jsonTotalWidth).calculateDimension(stringBounder);
      result += Math.max(dim1.getHeight(), dim2.getHeight());
    }
    return result;
  }

  /** @see TextBlockCucaJSon.java:162-180 */
  drawU(ug0: UGraphic): void {
    let ug = ug0;
    const stringBounder = ug.getStringBounder();
    const width1 = this.getWidth1(stringBounder);
    const height = this.getHeight(stringBounder);
    ug.apply(UTranslate.dx(width1)).draw(ULine.vline(height));
    const hline = ULine.hline(this.jsonTotalWidth);
    for (const s of this.obj.entries) {
      const tb1 = this.outer.getTextBlock(s.key);
      const tb2 = this.outer.getTextBlockValue(s.value, this.jsonTotalWidth - width1);
      const dim1 = tb1.calculateDimension(stringBounder);
      const dim2 = tb2.calculateDimension(stringBounder);
      ug.draw(hline);
      tb1.drawU(ug);
      tb2.drawU(ug.apply(UTranslate.dx(width1)));
      ug = ug.apply(UTranslate.dy(Math.max(dim1.getHeight(), dim2.getHeight())));
    }
  }
}

/** @see TextBlockCucaJSon.java:192-226 */
class TextBlockArray extends TextBlockMemoized {
  constructor(
    private readonly outer: TextBlockCucaJSon,
    private readonly array: JsonArrayNode,
    public arrayTotalWidth: number,
  ) {
    super();
  }

  /** @see TextBlockCucaJSon.java:202-211 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    let result = new XDimension2D(0, 0);
    for (const element of this.array.items) {
      const dim = this.outer.getTextBlockValue(element, this.arrayTotalWidth).calculateDimension(stringBounder);
      result = result.mergeTB(dim);
    }
    return result;
  }

  /** @see TextBlockCucaJSon.java:213-224 */
  drawU(ug0: UGraphic): void {
    let ug = ug0;
    const hline = ULine.hline(this.arrayTotalWidth);
    let nb = 0;
    for (const element of this.array.items) {
      const tb = this.outer.getTextBlockValue(element, this.arrayTotalWidth);
      if (nb > 0) ug.draw(hline);
      nb++;
      tb.drawU(ug);
      ug = ug.apply(UTranslate.dy(tb.calculateDimension(ug.getStringBounder()).getHeight()));
    }
  }
}
