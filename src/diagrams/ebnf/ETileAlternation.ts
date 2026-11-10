/**
 * `ETileAlternation`: `a | b | …`, each branch stacked 10 apart between two vertical rails `marginx` in from each
 * side; the first branch is the straight track. `push` prepends.
 *
 * `drawU`'s two paths are split into `drawUInZeroOrMore` and `drawUNormal` (the hooks' 30-NLOC cap, eep D12); the
 * Java local names (`a b c`, `p q r`, `height42`, `ug_b`, `ug_q`) are kept. `inZeroOrMore` is only ever set by the
 * deprecated, never-called `setInZeroOrMore` (Java: "To be removed, never used"), ported with it.
 *
 * Mutable: `push` edits the branch list in place.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ETileAlternation.java:46-165
 */
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import { UTranslate } from '../../core/klimt/UTranslate.js';
import { CornerCurved } from './CornerCurved.js';
import { ETile } from './ETile.js';

/** @see ETileAlternation.java:49 */
const MARGINX = 12;
/** The gap between two branches. @see ETileAlternation.java:69, :115, :139 */
const BRANCH_GAP = 10;
/** `drawHlineDirected(…, 0.3, 25)` in the zero-or-more path. @see ETileAlternation.java:112 */
const ZERO_OR_MORE_ARROW = { coef: 0.3, minimunSizeForArrow: 25 } as const;
/** `drawHlineDirected(…, 0.5, 25)` in the normal path. @see ETileAlternation.java:133, :136 */
const BRANCH_ARROW = { coef: 0.5, minimunSizeForArrow: 25 } as const;

/** `drawU`'s column positions: `a b c` from the left, `p q r` from the right. @see ETileAlternation.java:92-100 */
interface Columns {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly p: number;
  readonly q: number;
  readonly r: number;
}

export class ETileAlternation extends ETile {
  private readonly tiles: ETile[] = [];
  private inZeroOrMore = false;

  /** `tiles.add(0, tile)`. @see ETileAlternation.java:52-55 */
  push(tile: ETile): void {
    this.tiles.unshift(tile);
  }

  /** @see ETileAlternation.java:57-60 */
  getH1(stringBounder: StringBounder): number {
    return this.tiles[0]!.getH1(stringBounder);
  }

  /** @see ETileAlternation.java:62-72 */
  getH2(stringBounder: StringBounder): number {
    let height = this.tiles[0]!.getH2(stringBounder);
    for (let i = 1; i < this.tiles.length; i++) {
      const tile = this.tiles[i]!;
      height += tile.getH1(stringBounder);
      height += tile.getH2(stringBounder);
      height += BRANCH_GAP;
    }
    return height;
  }

  /** @see ETileAlternation.java:74-83 */
  getWidth(stringBounder: StringBounder): number {
    let width = 0;
    for (const tile of this.tiles) {
      const dim = tile.calculateDimension(stringBounder);
      width = Math.max(width, dim.getWidth());
    }
    width += 2 * 2 * MARGINX;
    return width;
  }

  /** @see ETileAlternation.java:85-156 */
  drawU(ug: UGraphic): void {
    const stringBounder = ug.getStringBounder();

    const a = 0;
    const b = a + MARGINX;
    const c = b + MARGINX;

    const fullDim = this.calculateDimension(stringBounder);

    const r = fullDim.getWidth();
    const q = r - MARGINX;
    const p = q - MARGINX;

    const linePos = this.getH1(stringBounder);

    if (this.inZeroOrMore) this.drawUInZeroOrMore(ug, { a, b, c, p, q, r });
    else this.drawUNormal(ug, { a, b, c, p, q, r }, linePos);
  }

  /** The `inZeroOrMore` branch. @see ETileAlternation.java:104-119 */
  private drawUInZeroOrMore(ug: UGraphic, columns: Columns): void {
    const { b, c, p, q } = columns;
    const stringBounder = ug.getStringBounder();
    let y = 0;
    let lastLinePos = 0;
    for (const tile of this.tiles) {
      const dim = tile.calculateDimension(stringBounder);
      lastLinePos = y + tile.getH1(stringBounder);
      tile.drawU(ug.apply(new UTranslate(c, y)));

      CornerCurved.createSW(MARGINX).drawU(ug.apply(new UTranslate(b, lastLinePos)));
      this.drawHlineDirected(ug, lastLinePos, c + dim.getWidth(), p, ZERO_OR_MORE_ARROW);
      CornerCurved.createSE(MARGINX).drawU(ug.apply(new UTranslate(q, lastLinePos)));

      y += dim.getHeight() + BRANCH_GAP;
    }
    this.drawVline(ug, b, 0, lastLinePos - MARGINX);
    this.drawVline(ug, q, 0, lastLinePos - MARGINX);
  }

  /** The `else` branch: the branches, then the two rails. @see ETileAlternation.java:121-154 */
  private drawUNormal(ug: UGraphic, columns: Columns, linePos: number): void {
    const { b, q } = columns;
    const lastLinePos = this.drawBranches(ug, columns);

    const height42 = lastLinePos - linePos;
    const ug_b = ug.apply(new UTranslate(b, linePos));
    const ug_q = ug.apply(new UTranslate(q, linePos));

    CornerCurved.createSW(MARGINX).drawU(ug_b.apply(UTranslate.dy(height42)));
    this.drawVline(ug_b, 0, MARGINX, height42 - MARGINX);
    CornerCurved.createNE(MARGINX).drawU(ug_b);

    CornerCurved.createSE(MARGINX).drawU(ug_q.apply(UTranslate.dy(height42)));
    this.drawVline(ug_q, 0, MARGINX, height42 - MARGINX);
    CornerCurved.createNW(MARGINX).drawU(ug_q);
  }

  /** The `else` branch's loop; answers `lastLinePos`. @see ETileAlternation.java:122-140 */
  private drawBranches(ug: UGraphic, columns: Columns): number {
    const { a, b, c, p, q, r } = columns;
    const stringBounder = ug.getStringBounder();
    let y = 0;
    let lastLinePos = 0;
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i]!;
      const dim = tile.calculateDimension(stringBounder);
      lastLinePos = y + tile.getH1(stringBounder);
      tile.drawU(ug.apply(new UTranslate(c, y)));

      if (i === 0) {
        this.drawHline(ug, lastLinePos, a, c);
        this.drawHline(ug, lastLinePos, c + dim.getWidth(), r);
      } else if (i > 0 && i < this.tiles.length - 1) {
        CornerCurved.createSW(MARGINX).drawU(ug.apply(new UTranslate(b, lastLinePos)));
        this.drawHlineDirected(ug, lastLinePos, c + dim.getWidth(), p, BRANCH_ARROW);
        CornerCurved.createSE(MARGINX).drawU(ug.apply(new UTranslate(q, lastLinePos)));
      } else if (i === this.tiles.length - 1) {
        this.drawHlineDirected(ug, lastLinePos, c + dim.getWidth(), p, BRANCH_ARROW);
      }
      y += dim.getHeight() + BRANCH_GAP;
    }
    return lastLinePos;
  }

  /** Java sets `true` whatever the argument ("To be removed, never used", `@Deprecated`). @see ETileAlternation.java:158-163 */
  setInZeroOrMore(_inZeroOrMore: boolean): void {
    this.inZeroOrMore = true;
  }
}
