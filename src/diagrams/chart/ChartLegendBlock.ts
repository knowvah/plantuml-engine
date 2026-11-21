/**
 * ChartLegendBlock — the legend of a pie (one entry per slice) or a radar (one
 * per series): a coloured square and a name per entry, one under the other on
 * the left or right of the chart, side by side above or below it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartLegendBlock.java
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { URectangle } from '../../core/klimt/shape/URectangle.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { HColor } from '../../core/style/Value.js';
import { LegendPosition } from './chart-modes.js';
import type { SkinParam } from './chart-skin-param.js';
import {
  back,
  displayBlock,
  fore,
  getLegendStyleSignature,
  mergedStyle,
  type StyleFontConfiguration,
} from './ChartStyles.js';

/** @see ChartLegendBlock.java:57 */
const SYMBOL_SIZE = 12;
/** @see ChartLegendBlock.java:58 */
const TEXT_SPACING = 5;
/** @see ChartLegendBlock.java:59 */
const ITEM_SPACING = 15;

export class ChartLegendBlock {
  private readonly names: string[] = [];
  private readonly colors: HColor[] = [];
  private readonly vertical: boolean;
  private readonly fontConfig: StyleFontConfiguration;

  /** @see ChartLegendBlock.java:67-72 */
  constructor(
    private readonly skinParam: SkinParam,
    position: LegendPosition,
  ) {
    this.vertical = position === LegendPosition.LEFT || position === LegendPosition.RIGHT;
    this.fontConfig = mergedStyle(getLegendStyleSignature(), skinParam).getFontConfiguration(
      skinParam.getIHtmlColorSet(),
    );
  }

  add(name: string, color: HColor): void {
    this.names.push(name);
    this.colors.push(color);
  }

  isEmpty(): boolean {
    return this.names.length === 0;
  }

  /** @see ChartLegendBlock.java:83-86 */
  private text(name: string): TextBlock {
    return displayBlock(this.skinParam, name, this.fontConfig, HorizontalAlignment.LEFT);
  }

  /** @see ChartLegendBlock.java:88-104 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    let width = 0;
    let height = 0;
    for (const [i, name] of this.names.entries()) {
      const dim = this.text(name).calculateDimension(stringBounder);
      const itemWidth = SYMBOL_SIZE + TEXT_SPACING + dim.getWidth();
      const itemHeight = Math.max(SYMBOL_SIZE, dim.getHeight());
      if (this.vertical) {
        width = Math.max(width, itemWidth);
        height += itemHeight + (i > 0 ? ITEM_SPACING / 2 : 0);
      } else {
        width += itemWidth + (i > 0 ? ITEM_SPACING : 0);
        height = Math.max(height, itemHeight);
      }
    }
    return new XDimension2D(width, height);
  }

  /** @see ChartLegendBlock.java:106-126 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    let x = 0;
    let y = 0;
    for (const [i, name] of this.names.entries()) {
      const text = this.text(name);
      const dim = text.calculateDimension(stringBounder);
      const itemHeight = Math.max(SYMBOL_SIZE, dim.getHeight());
      const color = this.colors[i]!;
      ug.apply(fore(color))
        .apply(back(color))
        .apply(new UTranslate(x, y + (itemHeight - SYMBOL_SIZE) / 2))
        .draw(URectangle.build(SYMBOL_SIZE, SYMBOL_SIZE));
      text.drawU(ug.apply(new UTranslate(x + SYMBOL_SIZE + TEXT_SPACING, y + (itemHeight - dim.getHeight()) / 2)));
      if (this.vertical) y += itemHeight + ITEM_SPACING / 2;
      else x += SYMBOL_SIZE + TEXT_SPACING + dim.getWidth() + ITEM_SPACING;
    }
  }
}
