import { HColors } from '../../core/klimt/color/HColors.js';
import { Fore } from '../../core/klimt/Fore.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { ULine } from '../../core/klimt/shape/ULine.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { AbstractConnectorPuzzle } from './AbstractConnectorPuzzle.js';
import { toShortString, Where, WHERE_VALUES } from './ConnectorPuzzle.js';
import type { BpmSkinParam } from './Placeable.js';

/** The cell size and stub length. @see ConnectorPuzzleEmpty.java:80,104-119 */
const SIZE = 20;
const HALF = 10;

/**
 * ConnectorPuzzleEmpty — a route cell: blue 10-px stubs from the centre of a
 * 20x20 cell toward each direction it holds.
 *
 * Not ported: `getMinMax` (throws upstream), `getInnerPosition` (`null`),
 * `getMagneticBorder` and `getBackcolor` -- `TextBlock` defaults no BPM
 * path reads (`GridArray` reads `calculateDimension` and `drawU`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/ConnectorPuzzleEmpty.java:54-141
 */
export class ConnectorPuzzleEmpty extends AbstractConnectorPuzzle implements TextBlock {
  /** Each direction whose initial the string contains. @see ConnectorPuzzleEmpty.java:56-64 */
  static get(value: string): ConnectorPuzzleEmpty {
    const result = new ConnectorPuzzleEmpty();
    for (const w of WHERE_VALUES) if (value.includes(toShortString(w))) result.append(w);
    return result;
  }

  /** `EnumSet#equals`: set equality. @see ConnectorPuzzleEmpty.java:66-68 */
  checkDirections(directions: string): boolean {
    const mine = this.connections();
    const other = ConnectorPuzzleEmpty.get(directions).connections();
    return mine.length === other.length && mine.every((w, i) => w === other[i]);
  }

  /** `NONE`, else `EnumSet#toString`. @see ConnectorPuzzleEmpty.java:70-77 */
  toString(): string {
    const connections = this.connections();
    if (connections.length === 0) return 'NONE';
    return `[${connections.join(', ')}]`;
  }

  /** @see ConnectorPuzzleEmpty.java:79-81 */
  getDimension(_stringBounder: StringBounder, _skinParam: BpmSkinParam): XDimension2D {
    return new XDimension2D(SIZE, SIZE);
  }

  /** @see ConnectorPuzzleEmpty.java:83-85 */
  toTextBlock(_skinParam: BpmSkinParam): TextBlock {
    return this;
  }

  /** @see ConnectorPuzzleEmpty.java:87-89 */
  getId(): string {
    throw new Error('UnsupportedOperationException: a connector puzzle has no id');
  }

  /** @see ConnectorPuzzleEmpty.java:91-100 */
  drawU(ugIn: UGraphic): void {
    const ug = ugIn.apply(new Fore(HColors.BLUE));
    for (const w of WHERE_VALUES) if (this.have(w)) this.drawLine(ug, w);
  }

  /** @see ConnectorPuzzleEmpty.java:102-115 */
  private drawLine(ug: UGraphic, w: Where): void {
    if (w === Where.WEST) ug.apply(UTranslate.dy(HALF)).draw(ULine.hline(HALF));
    if (w === Where.EAST) ug.apply(new UTranslate(HALF, HALF)).draw(ULine.hline(HALF));
    if (w === Where.NORTH) ug.apply(UTranslate.dx(HALF)).draw(ULine.vline(HALF));
    if (w === Where.SOUTH) ug.apply(new UTranslate(HALF, HALF)).draw(ULine.vline(HALF));
  }

  /** @see ConnectorPuzzleEmpty.java:117-120 */
  calculateDimension(_stringBounder: StringBounder): XDimension2D {
    return new XDimension2D(SIZE, SIZE);
  }
}
