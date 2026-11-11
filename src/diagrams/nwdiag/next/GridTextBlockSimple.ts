/**
 * GridTextBlockSimple — the networks × columns grid of server cells: a
 * column as wide as its widest cell, a line as tall as its tallest (at
 * least 50).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/GridTextBlockSimple.java
 */
import type { StringBounder } from '../../../core/klimt/font/StringBounder.js';
import type { MagneticBorder } from '../../../core/klimt/geom/MagneticBorder.js';
import { MagneticBorderNone } from '../../../core/klimt/geom/MagneticBorderNone.js';
import type { MinMax } from '../../../core/klimt/geom/MinMax.js';
import { XDimension2D } from '../../../core/klimt/geom/XDimension2D.js';
import { TextBlockMemoized } from '../../../core/klimt/shape/TextBlockMemoized.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { SkinParam } from '../nwdiag-skin-param.js';
import { NwArray } from './NwArray.js';
import type { NServerDraw } from './NServerDraw.js';

/** `lineHeight`'s floor. @see GridTextBlockSimple.java:93 */
const MINIMUM_LINE_HEIGHT = 50;

/** @see GridTextBlockSimple.java:50 */
export class GridTextBlockSimple extends TextBlockMemoized {
  /** @see GridTextBlockSimple.java:52 */
  static readonly MINIMUM_WIDTH = 70;

  /** @see GridTextBlockSimple.java:54 */
  protected readonly data: NwArray;
  /** @see GridTextBlockSimple.java:55 */
  private readonly skinParam: SkinParam;

  /** @see GridTextBlockSimple.java:57-60 */
  constructor(lines: number, cols: number, skinParam: SkinParam) {
    super();
    this.skinParam = skinParam;
    this.data = new NwArray(lines, cols);
  }

  /** @see GridTextBlockSimple.java:62-63 */
  protected drawGrid(_ug: UGraphic): void {}

  /** @see GridTextBlockSimple.java:65-81 */
  drawU(ug: UGraphic): void {
    this.drawGrid(ug);
    const stringBounder = ug.getStringBounder();
    let y = 0;
    for (let i = 0; i < this.data.getNbLines(); i++) {
      const lineHeight = this.lineHeight(stringBounder, i);
      let x = 0;
      for (let j = 0; j < this.data.getNbCols(); j++) {
        const colWidth = this.colWidth(stringBounder, j);
        this.data.get(i, j)?.drawMe(ug.apply(new UTranslate(x, y)), colWidth, lineHeight);
        x += colWidth;
      }
      y += lineHeight;
    }
  }

  /** @see GridTextBlockSimple.java:83-90 */
  protected colWidth(stringBounder: StringBounder, j: number): number {
    let width = 0;
    for (let i = 0; i < this.data.getNbLines(); i++) {
      const cell = this.data.get(i, j);
      if (cell !== null) width = Math.max(width, cell.naturalDimension(stringBounder).getWidth());
    }
    return width;
  }

  /** @see GridTextBlockSimple.java:92-99 */
  lineHeight(stringBounder: StringBounder, i: number): number {
    let height = MINIMUM_LINE_HEIGHT;
    for (let j = 0; j < this.data.getNbCols(); j++) {
      const cell = this.data.get(i, j);
      if (cell !== null) height = Math.max(height, cell.naturalDimension(stringBounder).getHeight());
    }
    return height;
  }

  /** @see GridTextBlockSimple.java:101-116 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    if (this.data.getNbLines() === 0) return new XDimension2D(0, 0);

    let height = 0;
    for (let i = 0; i < this.data.getNbLines(); i++) height += this.lineHeight(stringBounder, i);

    let width = 0;
    for (let j = 0; j < this.data.getNbCols(); j++) width += this.colWidth(stringBounder, j);

    return new XDimension2D(Math.max(GridTextBlockSimple.MINIMUM_WIDTH, width), height);
  }

  /** @see GridTextBlockSimple.java:118-121 */
  getInnerPosition(member: string, _stringBounder: StringBounder): never {
    throw new Error(`UnsupportedOperationException: member=${member} class ${this.constructor.name}`);
  }

  /** @see GridTextBlockSimple.java:123-125 */
  getMinMax(_stringBounder: StringBounder): MinMax {
    throw new Error(`UnsupportedOperationException: class ${this.constructor.name}`);
  }

  /** @see GridTextBlockSimple.java:127-129 */
  add(i: number, j: number, value: NServerDraw): void {
    this.data.set(i, j, value);
  }

  /** @see GridTextBlockSimple.java:131-133 */
  protected getSkinParam(): SkinParam {
    return this.skinParam;
  }

  /** @see GridTextBlockSimple.java:135-138 */
  getMagneticBorder(): MagneticBorder {
    return new MagneticBorderNone();
  }

  /** @see GridTextBlockSimple.java:140-143 */
  getBackcolor(): null {
    return null;
  }
}
