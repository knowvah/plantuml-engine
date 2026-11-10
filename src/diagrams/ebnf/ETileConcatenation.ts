/**
 * `ETileConcatenation`: tiles side by side on one track, 20 apart, joined by directed lines. `push` prepends (the
 * engine pops its operands in reverse), `pushLast` appends.
 *
 * Mutable: `push`, `pushLast` and `overideFirst` edit the tile list in place, as Java's `ArrayList`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileConcatenation.java:45-120
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { ETile } from './ETile.js';

/** @see ETileConcatenation.java:48 */
const MARGINX = 20;
/** `drawHlineDirected(…, 0.5, 25)`. @see ETileConcatenation.java:77 */
const LINK_ARROW = { coef: 0.5, minimunSizeForArrow: 25 } as const;

export class ETileConcatenation extends ETile {
  private readonly tiles: ETile[] = [];

  /** `tiles.add(0, tile)`. @see ETileConcatenation.java:51-54 */
  push(tile: ETile): void {
    this.tiles.unshift(tile);
  }

  /** @see ETileConcatenation.java:56-58 */
  pushLast(tile: ETile): void {
    this.tiles.push(tile);
  }

  /** `tiles.set(0, tile)`. @see ETileConcatenation.java:60-62 */
  overideFirst(tile: ETile): void {
    this.tiles[0] = tile;
  }

  /** The leading `drawHline(ug, fullLinePos, 0, x)` with `x = 0` draws a zero-length line, as upstream. @see ETileConcatenation.java:64-82 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();

    const fullLinePos = this.getH1(stringBounder);
    let x = 0;
    this.drawHline(ug, fullLinePos, 0, x);
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i]!;
      const linePos = tile.getH1(stringBounder);
      tile.drawU(ug.apply(new UTranslate(x, fullLinePos - linePos)));
      x += tile.calculateDimension(stringBounder).getWidth();
      if (i !== this.tiles.length - 1) {
        this.drawHlineDirected(ug, fullLinePos, x, x + MARGINX, LINK_ARROW);
        x += MARGINX;
      }
    }
  }

  /** @see ETileConcatenation.java:84-92 */
  getH1(stringBounder: StringBounder): number {
    let result = 0;
    for (const tile of this.tiles) result = Math.max(result, tile.getH1(stringBounder));
    return result;
  }

  /** @see ETileConcatenation.java:94-102 */
  getH2(stringBounder: StringBounder): number {
    let result = 0;
    for (const tile of this.tiles) result = Math.max(result, tile.getH2(stringBounder));
    return result;
  }

  /** @see ETileConcatenation.java:104-114 */
  getWidth(stringBounder: StringBounder): number {
    let width = 0;
    for (let i = 0; i < this.tiles.length; i++) {
      width += this.tiles[i]!.getWidth(stringBounder);
      if (i !== this.tiles.length - 1) width += MARGINX;
    }
    return width;
  }

  /** `tiles.get(0)`: an empty list throws. @see ETileConcatenation.java:116-118 */
  getFirst(): ETile {
    const first = this.tiles[0];
    if (first === undefined) throw new Error('IndexOutOfBoundsException');
    return first;
  }
}
