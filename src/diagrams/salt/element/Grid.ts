/**
 * Grid — the `{#`/`{+`/`{^`/`{!`/`{-` pyramid table lines: one unit
 * segment per cell edge, collected per `TableStrategy` (the outline at
 * construction, each cell's edges on `addCell`), drawn as horizontals then
 * verticals, then the pyramid title over a white box at (6, 0).
 * Built by `ElementPyramid#drawU` (`ElementPyramid.java:106`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/salt/element/Grid.java:50-133
 */
import { Back } from '../../../core/klimt/Back.js';
import type { HColorSimple } from '../../../core/klimt/color/HColorSimple.js';
import { Fore } from '../../../core/klimt/Fore.js';
import { ULine } from '../../../core/klimt/shape/ULine.js';
import { URectangle } from '../../../core/klimt/shape/URectangle.js';
import type { TextBlock } from '../../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../../core/klimt/UGraphic.js';
import { UTranslate } from '../../../core/klimt/UTranslate.js';
import type { Cell } from '../Cell.js';
import { Segment } from './Segment.js';
import { TableStrategy } from './TableStrategy.js';

/**
 * `java.util.LinkedHashSet<Segment>` — what `Grid.java:57-58` collects into
 * since upstream `1ec797b9732` (before it, a `HashSet` whose bin order was
 * the draw order). Iteration is insertion order; `add` keeps the first of
 * two segments equal on `hashCode()` + `equals()` and leaves its position
 * alone, as `HashMap#putVal` does for an existing key (`LinkedHashMap`
 * links a node only when it is created). A TS `Set` keys on identity, so
 * the de-duplication is done here on the segment's `hashCode()`.
 *
 * @see net/sourceforge/plantuml/salt/element/Grid.java:57-58 (upstream a720bdd)
 * @see java.base/java/util/LinkedHashSet.java (JDK 21)
 */
class LinkedHashSet implements Iterable<Segment> {
  /** Insertion-ordered entries, bucketed by `hashCode()` for the equality probe. */
  private readonly ordered: Segment[] = [];
  private readonly byHash = new Map<number, Segment[]>();

  /** @see java.base/java/util/HashSet.java:228-230 (JDK 21) */
  add(e: Segment): boolean {
    const hash = e.hashCode();
    const bucket = this.byHash.get(hash);
    if (bucket?.some((k) => e.equals(k))) return false;
    if (bucket === undefined) this.byHash.set(hash, [e]);
    else bucket.push(e);
    this.ordered.push(e);
    return true;
  }

  [Symbol.iterator](): Iterator<Segment> {
    return this.ordered[Symbol.iterator]();
  }
}

/** Java array read: an out-of-range index throws `ArrayIndexOutOfBoundsException`. */
function at(array: readonly number[], index: number): number {
  const v = array[index];
  if (v === undefined) throw new RangeError(`Index ${index} out of bounds for length ${array.length}`);
  return v;
}

export class Grid {
  /** @see Grid.java:52 */
  private readonly rowsStart: readonly number[];
  /** @see Grid.java:53 */
  private readonly colsStart: readonly number[];
  /** @see Grid.java:54 */
  private readonly strategy: TableStrategy;
  /** @see Grid.java:55 */
  private readonly title: TextBlock;

  /** @see Grid.java:57 */
  private readonly horizontals = new LinkedHashSet();
  /** @see Grid.java:58 */
  private readonly verticals = new LinkedHashSet();

  /** @see Grid.java:60-69 */
  constructor(rowsStart: readonly number[], colsStart: readonly number[], strategy: TableStrategy, title: TextBlock) {
    this.title = title;
    this.rowsStart = rowsStart;
    this.colsStart = colsStart;
    this.strategy = strategy;
    if (
      strategy === TableStrategy.DRAW_OUTSIDE ||
      strategy === TableStrategy.DRAW_OUTSIDE_WITH_TITLE ||
      strategy === TableStrategy.DRAW_ALL
    ) {
      this.addOutside();
    }
  }

  /** @see Grid.java:71-83 */
  private addOutside(): void {
    const nbRow = this.rowsStart.length;
    const nbCol = this.colsStart.length;
    for (let c = 0; c < nbCol - 1; c++) {
      this.horizontals.add(new Segment(0, c));
      this.horizontals.add(new Segment(nbRow - 1, c));
    }
    for (let r = 0; r < nbRow - 1; r++) {
      this.verticals.add(new Segment(r, 0));
      this.verticals.add(new Segment(r, nbCol - 1));
    }
  }

  /**
   * `white` is upstream's `HColor`; typed as the `HColorSimple` every caller
   * passes (`AbstractElement#getWhite`), so it can be painted
   * (`white.bg()` → `Back`, `apply(white)` → `Fore`).
   * @see Grid.java:85-109
   */
  drawU(ug: UGraphic, x: number, y: number, white: HColorSimple): void {
    // Hlines
    for (const seg of this.horizontals) {
      const row1 = seg.getRow();
      const col1 = seg.getCol();
      const width = at(this.colsStart, col1 + 1) - at(this.colsStart, col1);
      ug.apply(new UTranslate(x + at(this.colsStart, col1), y + at(this.rowsStart, row1))).draw(ULine.hline(width));
    }
    // Vlines
    for (const seg of this.verticals) {
      const row1 = seg.getRow();
      const col1 = seg.getCol();
      const height = at(this.rowsStart, row1 + 1) - at(this.rowsStart, row1);
      ug.apply(new UTranslate(x + at(this.colsStart, col1), y + at(this.rowsStart, row1))).draw(ULine.vline(height));
    }

    const dim = this.title.calculateDimension(ug.getStringBounder());

    if (dim.getWidth() > 0 && dim.getHeight() > 0) {
      const ug2 = ug.apply(new UTranslate(x + 6, y - dim.getHeight() * 0));
      ug2.apply(new Back(white)).apply(new Fore(white)).draw(URectangle.build(dim.getWidth(), dim.getHeight()));
      this.title.drawU(ug2);
    }
  }

  /** @see Grid.java:111-132 */
  addCell(cell: Cell): void {
    if (
      this.strategy === TableStrategy.DRAW_NONE ||
      this.strategy === TableStrategy.DRAW_OUTSIDE ||
      this.strategy === TableStrategy.DRAW_OUTSIDE_WITH_TITLE
    ) {
      return;
    }

    if (this.strategy === TableStrategy.DRAW_HORIZONTAL || this.strategy === TableStrategy.DRAW_ALL) {
      // Hlines
      for (let c = cell.getMinCol(); c <= cell.getMaxCol(); c++) {
        this.horizontals.add(new Segment(cell.getMinRow(), c));
        this.horizontals.add(new Segment(cell.getMaxRow() + 1, c));
      }
    }
    if (this.strategy === TableStrategy.DRAW_VERTICAL || this.strategy === TableStrategy.DRAW_ALL) {
      // Vlines
      for (let r = cell.getMinRow(); r <= cell.getMaxRow(); r++) {
        this.verticals.add(new Segment(r, cell.getMinCol()));
        this.verticals.add(new Segment(r, cell.getMaxCol() + 1));
      }
    }
  }
}
