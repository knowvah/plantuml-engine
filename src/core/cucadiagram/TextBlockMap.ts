/**
 * `TextBlockMap` — a `map` leaf's entries: one row per key, the key column aligned by the map style's
 * `HorizontalAlignment`, the value column flush left, a full-width line above every row and a vertical line after the
 * key column of every row that has a value. A `*->` row's value is a `Point`, which is sized but never drawn: its key
 * takes the whole width.
 *
 * Each cell is `Display.getWithNewlines(pragma, s).create0(fc, LEFT, skinParam, wordWrap, CreoleMode.FULL, …)` margined
 * by 5,2 (`TextBlockMap.java:172-181`), built by `buildTextBlock`, this port's `create0` seam for leaf text.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/cucadiagram/TextBlockMap.java:66-213
 */
import { Display } from '../klimt/creole/Display.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import { TextBlockMemoized } from '../klimt/shape/TextBlockMemoized.js';
import { TextBlockUtils } from '../klimt/shape/TextBlockUtils.js';
import { UEllipse } from '../klimt/shape/UEllipse.js';
import { ULine } from '../klimt/shape/ULine.js';
import type { FontConfiguration } from '../klimt/shape/UText.js';
import type { UGraphic } from '../klimt/UGraphic.js';
import { UTranslate } from '../klimt/UTranslate.js';
import { Back } from '../klimt/Back.js';
import { Fore } from '../klimt/Fore.js';
import { Pragma } from '../skin/Pragma.js';
import { VisibilityModifier } from '../skin/VisibilityModifier.js';
import { Ports } from '../svek/Ports.js';
import { buildTextBlock } from '../svek/image/EntityImageDescriptionTextBlock.js';

/** `getTextBlock`'s `withMargin(result, 5, 2)`. @see TextBlockMap.java:179 */
const MAP_CELL_MARGIN_X = 5;
const MAP_CELL_MARGIN_Y = 2;
/** The value `BodierMap#addFieldOrMethod` stores for a linked entry. @see BodierMap.java:79 */
const MAP_LINK_VALUE = String.fromCharCode(0);
/** `getPorts`: every row reports at score 100. @see TextBlockMap.java:101 */
const MAP_ROW_PORT_SCORE = 100;
/** `Point#getDiameter`. @see TextBlockMap.java:203-205 */
const POINT_DIAMETER = 7;

/** `HorizontalAlignment#getPosition`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/geom/HorizontalAlignment.java:92-98 */
function getPosition(alignment: HorizontalAlignment, width: number, fullWidth: number): number {
  if (alignment === HorizontalAlignment.RIGHT) return fullWidth - width;
  if (alignment === HorizontalAlignment.CENTER) return (fullWidth - width) / 2;
  return 0;
}

/** `TextBlockMap.Point`: a 7x7 dot in the font colour. @see TextBlockMap.java:183-207 */
class Point implements TextBlock {
  constructor(private readonly color: string | null) {}

  calculateDimension(): XDimension2D {
    return new XDimension2D(POINT_DIAMETER, POINT_DIAMETER);
  }

  drawU(ug: UGraphic): void {
    const color = this.color ?? '#000000';
    ug.apply(new Fore(color)).apply(new Back(color)).draw(UEllipse.build(POINT_DIAMETER, POINT_DIAMETER));
  }
}

/** One row: the key block and the value block. */
interface Cell {
  readonly key: TextBlock;
  readonly value: TextBlock;
}

/** @see TextBlockMap.java:66 */
export class TextBlockMap extends TextBlockMemoized {
  private readonly blocks: Cell[] = [];
  private readonly keys: string[] = [];
  private totalWidth = 0;

  /** @see TextBlockMap.java:75-90 */
  constructor(
    private readonly fontConfiguration: FontConfiguration,
    map: ReadonlyMap<string, string>,
    private readonly wordWrap: number,
    private readonly horizontalAlignment: HorizontalAlignment,
    private readonly pragma: Pragma = Pragma.createEmpty(),
  ) {
    super();
    for (const [entKey, value] of map) {
      const key = VisibilityModifier.isVisibilityCharacter(entKey) ? entKey.substring(1) : entKey;
      this.keys.push(key);
      this.blocks.push({ key: this.getTextBlock(key), value: this.getTextBlock(value) });
    }
  }

  /** @see TextBlockMap.java:93-106 */
  getPorts(stringBounder: StringBounder): Ports {
    const ports = new Ports();
    let y = 0;
    this.blocks.forEach((cell, i) => {
      const height = this.getHeightOfRow(stringBounder, cell);
      ports.add(this.keys[i]!, MAP_ROW_PORT_SCORE, y, height);
      y += height;
    });
    return ports;
  }

  /** @see TextBlockMap.java:109-112 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(
      this.getWidthColA(stringBounder) + this.getWidthColB(stringBounder),
      this.getTotalHeight(stringBounder),
    );
  }

  /** @see TextBlockMap.java:114-116 */
  private getWidthColA(stringBounder: StringBounder): number {
    return getMaxWidth(
      stringBounder,
      this.blocks.map((c) => c.key),
    );
  }

  /** @see TextBlockMap.java:118-120 */
  private getWidthColB(stringBounder: StringBounder): number {
    return getMaxWidth(
      stringBounder,
      this.blocks.map((c) => c.value),
    );
  }

  /** @see TextBlockMap.java:130-155 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    const fullDim = this.calculateDimension(stringBounder);
    const trueWidth = Math.max(fullDim.getWidth(), this.totalWidth);
    const widthColA = this.getWidthColA(stringBounder);
    let y = 0;
    for (const cell of this.blocks) {
      const ugline = ug.apply(UTranslate.dy(y));
      ugline.draw(ULine.hline(trueWidth));
      const heightOfRow = this.getHeightOfRow(stringBounder, cell);
      const keyWidth = cell.key.calculateDimension(stringBounder).getWidth();
      if (cell.value instanceof Point) {
        cell.key.drawU(ugline.apply(UTranslate.dx(getPosition(this.horizontalAlignment, keyWidth, trueWidth))));
      } else {
        cell.key.drawU(ugline.apply(UTranslate.dx(getPosition(this.horizontalAlignment, keyWidth, widthColA))));
        cell.value.drawU(ugline.apply(UTranslate.dx(widthColA)));
        ugline.apply(UTranslate.dx(widthColA)).draw(ULine.vline(heightOfRow));
      }
      y += heightOfRow;
    }
  }

  /** @see TextBlockMap.java:157-165 */
  private getTotalHeight(stringBounder: StringBounder): number {
    return this.blocks.reduce((sum, cell) => sum + this.getHeightOfRow(stringBounder, cell), 0);
  }

  /** @see TextBlockMap.java:167-170 */
  private getHeightOfRow(stringBounder: StringBounder, cell: Cell): number {
    return Math.max(
      cell.key.calculateDimension(stringBounder).getHeight(),
      cell.value.calculateDimension(stringBounder).getHeight(),
    );
  }

  /** @see TextBlockMap.java:172-181 */
  private getTextBlock(key: string): TextBlock {
    if (key === MAP_LINK_VALUE) return new Point(this.fontConfiguration.color);
    const display = Display.getWithNewlines(this.pragma, key);
    const text = Array.from(display, String).join('\n');
    const result = buildTextBlock(text, this.fontConfiguration, HorizontalAlignment.LEFT, undefined, this.wordWrap);
    // Java's 3-arg `withMargin(tb, marginX, marginY)`, spelled out as this port's 5-arg form.
    return TextBlockUtils.withMargin(
      result,
      MAP_CELL_MARGIN_X,
      MAP_CELL_MARGIN_X,
      MAP_CELL_MARGIN_Y,
      MAP_CELL_MARGIN_Y,
    );
  }

  /** @see TextBlockMap.java:209-211 */
  setTotalWidth(totalWidth: number): void {
    this.totalWidth = totalWidth;
  }
}

/** @see TextBlockMap.java:122-128 */
function getMaxWidth(stringBounder: StringBounder, blocks: readonly TextBlock[]): number {
  let width = 0;
  for (const block of blocks) width = Math.max(width, block.calculateDimension(stringBounder).getWidth());
  return width;
}
