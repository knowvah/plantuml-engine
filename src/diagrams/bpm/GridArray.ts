import { HColors } from '../../core/klimt/color/HColors.js';
import { Fore } from '../../core/klimt/Fore.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { TextBlockMemoized } from '../../core/klimt/shape/TextBlockMemoized.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import type { BpmSkinParam, Placeable } from './Placeable.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/GridArray.java:109 */
const MARGIN = 30;

/**
 * GridArray — the cleaned grid as a `lines x cols` array of placeables,
 * drawn as a black grid with each cell centred in its `+30` margins.
 *
 * The grid draws one hline per line start and one vline per column start,
 * at full width and height, so the right and bottom edges are never drawn
 * (D8, `cov-merge-only`). Not ported (D1): the private `drawArrow`,
 * `getCenterOf`, `getCoord(Cell)` and `printMe` (java:183-224), whose one
 * caller was the commented-out edge drawing.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/GridArray.java:48-230
 */
export class GridArray extends TextBlockMemoized {
  /** @see GridArray.java:52 */
  private readonly data: (Placeable | null)[][];

  /** @see GridArray.java:57-62 */
  constructor(
    private readonly skinParam: BpmSkinParam,
    private readonly lines: number,
    private readonly cols: number,
  ) {
    super();
    this.data = Array.from({ length: lines }, () => Array.from({ length: cols }, () => null));
  }

  /** @see GridArray.java:64-67 */
  toString(): string {
    return `${this.lines}x${this.cols}`;
  }

  /** @see GridArray.java:69-71 */
  setData(l: number, c: number, element: Placeable | null): void {
    this.data[l]![c] = element;
  }

  /** @see GridArray.java:73-75 */
  getData(l: number, c: number): Placeable | null {
    return this.data[l]![c] ?? null;
  }

  /** Returns the column count, as upstream's does. @see GridArray.java:77-79 */
  getRows(): number {
    return this.cols;
  }

  /** @see GridArray.java:81-83 */
  getLines(): number {
    return this.lines;
  }

  /** @see GridArray.java:85-95 */
  private getHeightOfLine(stringBounder: StringBounder, line: number): number {
    let height = 0;
    for (let i = 0; i < this.cols; i++) {
      const cell = this.data[line]![i];
      if (cell === null || cell === undefined) continue;
      height = Math.max(height, cell.getDimension(stringBounder, this.skinParam).getHeight());
    }
    return height;
  }

  /** @see GridArray.java:97-107 */
  private getWidthOfCol(stringBounder: StringBounder, col: number): number {
    let width = 0;
    for (let i = 0; i < this.lines; i++) {
      const cell = this.data[i]![col];
      if (cell === null || cell === undefined) continue;
      width = Math.max(width, cell.getDimension(stringBounder, this.skinParam).getWidth());
    }
    return width;
  }

  /** @see GridArray.java:111-122 */
  protected calculateDimensionSlow(stringBounder: StringBounder): XDimension2D {
    let heightMax = 0;
    for (let l = 0; l < this.lines; l++) heightMax += this.getHeightOfLine(stringBounder, l) + MARGIN;
    let widthMax = 0;
    for (let c = 0; c < this.cols; c++) widthMax += this.getWidthOfCol(stringBounder, c) + MARGIN;
    return new XDimension2D(widthMax, heightMax);
  }

  /** The grid first, then each cell centred, line by line. @see GridArray.java:124-158 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();
    let dy = 0;
    this.drawInternalGrid(ug);
    for (let l = 0; l < this.lines; l++) {
      let dx = 0;
      const heightOfLine = this.getHeightOfLine(stringBounder, l);
      for (let r = 0; r < this.cols; r++) {
        const widthOfCol = this.getWidthOfCol(stringBounder, r);
        const cell = this.data[l]![r];
        if (cell !== null && cell !== undefined) {
          const dim = cell.getDimension(stringBounder, this.skinParam);
          const x = dx + (widthOfCol + MARGIN - dim.getWidth()) / 2;
          const y = dy + (heightOfLine + MARGIN - dim.getHeight()) / 2;
          cell.toTextBlock(this.skinParam).drawU(ug.apply(new UTranslate(x, y)));
        }
        dx += widthOfCol + MARGIN;
      }
      dy += heightOfLine + MARGIN;
    }
  }

  /** @see GridArray.java:160-181 */
  private drawInternalGrid(ugIn: UGraphic): void {
    let heightMax = 0;
    for (let l = 0; l < this.lines; l++) heightMax += this.getHeightOfLine(ugIn.getStringBounder(), l) + MARGIN;
    let widthMax = 0;
    for (let c = 0; c < this.cols; c++) widthMax += this.getWidthOfCol(ugIn.getStringBounder(), c) + MARGIN;
    const ug = ugIn.apply(new Fore(HColors.BLACK));
    let y = 0;
    for (let l = 0; l < this.lines; l++) {
      ug.apply(UTranslate.dy(y)).draw(ULine.hline(widthMax));
      y += this.getHeightOfLine(ug.getStringBounder(), l) + MARGIN;
    }
    let x = 0;
    for (let c = 0; c < this.cols; c++) {
      ug.apply(UTranslate.dx(x)).draw(ULine.vline(heightMax));
      x += this.getWidthOfCol(ug.getStringBounder(), c) + MARGIN;
    }
  }
}
