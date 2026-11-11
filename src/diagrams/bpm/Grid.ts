import { BpmElement } from './BpmElement.js';
import { Cell } from './Cell.js';
import type { Chain } from './Chain.js';
import { ChainImpl } from './ChainImpl.js';
import { Col } from './Col.js';
import { ConnectorPuzzleEmpty } from './ConnectorPuzzleEmpty.js';
import { Where } from './ConnectorPuzzle.js';
import { Coord } from './Coord.js';
import { GridArray } from './GridArray.js';
import { Line } from './Line.js';
import type { Navigator } from './Navigator.js';
import { Navigators } from './Navigators.js';
import type { BpmSkinParam, Placeable } from './Placeable.js';

/** One `cells` entry: Java's `Map.Entry<Coord, Cell>`. */
interface GridEntry {
  readonly coord: Coord;
  readonly cell: Cell;
}

/** Java's `(BpmElement)` cast. */
function asElement(data: Placeable | null): BpmElement {
  if (!(data instanceof BpmElement)) throw new Error('ClassCastException: the cell does not hold a BpmElement');
  return data;
}

/** `getCell`'s two overloads to a (line, col) pair; Java's NPE on a null half (D5). @see Grid.java:75-77 */
function resolveCoord(coordOrLine: Coord | Line | null | undefined, colArg: Col | null | undefined): [Line, Col] {
  if (coordOrLine === null || coordOrLine === undefined)
    throw new Error('NullPointerException: getCell of a null coordinate');
  if (coordOrLine instanceof Coord) return [coordOrLine.getLine(), coordOrLine.getCol()];
  if (colArg === null || colArg === undefined) throw new Error('NullPointerException: getCell of a null col');
  return [coordOrLine, colArg];
}

/**
 * Grid — the BPM layout grid: a chain of lines, a chain of columns, and the
 * cells at their crossings, created on first `getCell`.
 *
 * `cells` is a `HashMap<Coord, Cell>` upstream, keyed by identity hashes, so
 * its iteration order changes from run to run (D4). This port keys each
 * cell by a per-grid identity number for its line and column and iterates
 * in insertion order. With unique ids every reader gives the jar's result;
 * with duplicate ids `getById` returns the earliest-inserted match, where
 * the jar's choice varies (`cov-duplicate-merge-id`: 6 renders, 2 SVGs).
 *
 * Not ported (D1): `Grid(Grid)`/`cloneMe` (java:64-73, no caller) and the
 * commented-out edge methods.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/Grid.java:50-432
 */
export class Grid {
  /** @see Grid.java:52 */
  private readonly lineChain: Chain<Line>;
  /** @see Grid.java:53 */
  private readonly colChain: Chain<Col>;
  /** @see Grid.java:54 */
  private readonly root: Coord;
  /** @see Grid.java:55 */
  private readonly cells = new Map<string, GridEntry>();
  /** The identity numbers standing in for `Line`/`Col#hashCode` (D4). */
  private readonly identities = new Map<object, number>();

  /** @see Grid.java:57-62 */
  constructor() {
    this.root = new Coord(new Line(), new Col());
    this.lineChain = new ChainImpl<Line>(this.root.getLine());
    this.colChain = new ChainImpl<Col>(this.root.getCol());
    this.cells.set(this.keyOf(this.root), { coord: this.root, cell: new Cell() });
  }

  private identity(o: object): number {
    let id = this.identities.get(o);
    if (id === undefined) {
      id = this.identities.size;
      this.identities.set(o, id);
    }
    return id;
  }

  private keyOf(coord: Coord): string {
    return `${this.identity(coord.getLine())}:${this.identity(coord.getCol())}`;
  }

  /**
   * `getCell(Coord)` and `getCell(Line, Col)`. A missing coordinate (a
   * `getById` miss) throws as Java's `coord.getLine()` NPE does (D5).
   * @see Grid.java:75-93
   */
  getCell(coordOrLine: Coord | Line | null | undefined, colArg?: Col | null): Cell {
    const [line, col] = resolveCoord(coordOrLine, colArg);
    if (!this.lineChain.contains(line)) throw new Error('IllegalArgumentException: the line is not in the grid');
    if (!this.colChain.contains(col)) throw new Error('IllegalArgumentException: the col is not in the grid');
    const coord = new Coord(line, col);
    const key = this.keyOf(coord);
    let result = this.cells.get(key)?.cell;
    if (result === undefined) {
      result = new Cell();
      this.cells.set(key, { coord, cell: result });
    }
    return result;
  }

  /** The first cell whose data has `id`; `undefined` where Java returns `null`. @see Grid.java:151-162 */
  getById(id: string): Coord | undefined {
    for (const { coord, cell } of this.cells.values()) {
      const data = cell.getData();
      if (data === null) continue;
      if (id === data.getId()) return coord;
    }
    return undefined;
  }

  /** @see Grid.java:164-166 */
  getRoot(): Coord {
    return this.root;
  }

  /** @see Grid.java:168-170 */
  lines(): Chain<Line> {
    return this.lineChain;
  }

  /** @see Grid.java:172-174 */
  cols(): Chain<Col> {
    return this.colChain;
  }

  /** `getCoord(Cell)`. @see Grid.java:176-183 */
  getCoord(cell: Cell): Coord {
    for (const entry of this.cells.values()) if (entry.cell === cell) return entry.coord;
    throw new Error('IllegalArgumentException: the cell is not in the grid');
  }

  /** The private `getCoord(Placeable)`. @see Grid.java:185-192 */
  private getCoordOf(placeable: Placeable): Coord {
    for (const entry of this.cells.values()) if (entry.cell.getData() === placeable) return entry.coord;
    throw new Error('IllegalArgumentException: the placeable is not in the grid');
  }

  /** `linesOf(Coord)` and `linesOf(Cell)`. @see Grid.java:194-196,202-204 */
  linesOf(at: Coord | Cell): Navigator<Line> {
    const coord = at instanceof Cell ? this.getCoord(at) : at;
    return this.lineChain.navigator(coord.getLine());
  }

  /** `colsOf(Coord)` and `colsOf(Cell)`. @see Grid.java:198-200,206-208 */
  colsOf(at: Coord | Cell): Navigator<Col> {
    const coord = at instanceof Cell ? this.getCoord(at) : at;
    return this.colChain.navigator(coord.getCol());
  }

  /** Each cell's data at its line and column index in the cleaned chains. @see Grid.java:210-226 */
  toArray(skinParam: BpmSkinParam): GridArray {
    const lines = this.lineChain.toList();
    const cols = this.colChain.toList();
    const result = new GridArray(skinParam, lines.length, cols.length);
    for (const { coord, cell } of this.cells.values()) {
      const l = lines.indexOf(coord.getLine());
      const c = cols.indexOf(coord.getCol());
      if (c === -1) throw new Error('IllegalStateException: a cell column is not in the grid');
      if (l === -1) throw new Error('IllegalStateException: a cell line is not in the grid');
      result.setData(l, c, cell.getData());
    }
    return result;
  }

  /** @see Grid.java:257-269 */
  usedColsOf(line: Line): ReadonlySet<Col> {
    const result = new Set<Col>();
    for (const { coord, cell } of this.cells.values()) {
      if (cell.getData() === null) continue;
      if (coord.getLine() === line) result.add(coord.getCol());
    }
    return result;
  }

  /** @see Grid.java:271-290 */
  removeLine(line: Line): void {
    for (const [key, { coord, cell }] of [...this.cells]) {
      if (coord.getLine() !== line) continue;
      if (cell.getData() === null) this.cells.delete(key);
      else throw new Error('IllegalStateException: removing a line that holds data');
    }
    const done = this.lineChain.remove(line);
    if (!done) throw new Error('IllegalArgumentException: the line is not in the grid');
  }

  /** A cell's first destination starts horizontally, later ones vertically. @see Grid.java:315-331 */
  addConnections(): void {
    for (const { coord: src, cell } of [...this.cells.values()]) {
      const dests2 = cell.getDestinations2();
      for (let i = 0; i < dests2.length; i++) {
        const dest = this.getCoordOf(dests2[i]!);
        if (i === 0) this.drawStartHorizontal(src, dest);
        else this.drawStartVertical(src, dest);
      }
    }
  }

  /** @see Grid.java:333-376 */
  private drawStartVertical(src: Coord, dest: Coord): void {
    if (src.getLine() === dest.getLine() && src.getCol() === dest.getCol())
      throw new Error('IllegalStateException: a connection to itself');
    const start = asElement(this.getCell(src).getData());
    const compare = this.lineChain.compare(src.getLine(), dest.getLine());
    if (compare === 0) throw new Error('IllegalStateException: a vertical start on one line');
    start.append(compare < 0 ? Where.SOUTH : Where.NORTH);
    this.walkLines(src, dest, src.getCol());
    this.walkCols(src, dest, dest.getLine());
    const end = asElement(this.getCell(dest).getData());
    if (src.getLine() === dest.getLine()) end.append(compare < 0 ? Where.NORTH : Where.SOUTH);
    if (src.getLine() !== dest.getLine() && src.getCol() !== dest.getCol()) this.verticalCorner(src, dest, end);
  }

  /** The corner of a vertical start. @see Grid.java:362-374 */
  private verticalCorner(src: Coord, dest: Coord, end: BpmElement): void {
    if (this.lineChain.compare(dest.getLine(), src.getLine()) > 0) this.addPuzzle(dest.getLine(), src.getCol(), 'N');
    else this.addPuzzle(dest.getLine(), src.getCol(), 'S');
    if (this.colChain.compare(dest.getCol(), src.getCol()) > 0) this.addPuzzle(dest.getLine(), src.getCol(), 'E');
    else this.addPuzzle(dest.getLine(), src.getCol(), 'W');
    end.append(this.colChain.compare(src.getCol(), dest.getCol()) > 0 ? Where.EAST : Where.WEST);
  }

  /** @see Grid.java:378-420 */
  private drawStartHorizontal(src: Coord, dest: Coord): void {
    if (src.getLine() === dest.getLine() && src.getCol() === dest.getCol())
      throw new Error('IllegalStateException: a connection to itself');
    const start = asElement(this.getCell(src).getData());
    const compare = this.colChain.compare(src.getCol(), dest.getCol());
    if (compare === 0) throw new Error('IllegalStateException: a horizontal start in one column');
    start.append(compare < 0 ? Where.EAST : Where.WEST);
    this.walkCols(src, dest, src.getLine());
    this.walkLines(src, dest, dest.getCol());
    const end = asElement(this.getCell(dest).getData());
    if (src.getLine() === dest.getLine()) end.append(compare < 0 ? Where.WEST : Where.EAST);
    if (src.getLine() !== dest.getLine() && src.getCol() !== dest.getCol()) this.horizontalCorner(src, dest, end);
  }

  /** The corner of a horizontal start. @see Grid.java:407-419 */
  private horizontalCorner(src: Coord, dest: Coord, end: BpmElement): void {
    if (this.colChain.compare(dest.getCol(), src.getCol()) > 0) this.addPuzzle(src.getLine(), dest.getCol(), 'W');
    else this.addPuzzle(src.getLine(), dest.getCol(), 'E');
    if (this.lineChain.compare(dest.getLine(), src.getLine()) > 0) this.addPuzzle(src.getLine(), dest.getCol(), 'S');
    else this.addPuzzle(src.getLine(), dest.getCol(), 'N');
    end.append(this.lineChain.compare(src.getLine(), dest.getLine()) > 0 ? Where.SOUTH : Where.NORTH);
  }

  /** The `itLine` loop: an `NS` puzzle on each line strictly between, in `col`. @see Grid.java:344-350,396-402 */
  private walkLines(src: Coord, dest: Coord, col: Col): void {
    const itLine = Navigators.iterate(this.lineChain, src.getLine(), dest.getLine());
    while (itLine.get() !== dest.getLine()) {
      const cur = itLine.next();
      if (cur !== dest.getLine()) this.addPuzzle(cur, col, 'NS');
    }
  }

  /** The `itCol` loop: an `EW` puzzle in each column strictly between, on `line`. @see Grid.java:351-357,389-395 */
  private walkCols(src: Coord, dest: Coord, line: Line): void {
    const itCol = Navigators.iterate(this.colChain, src.getCol(), dest.getCol());
    while (itCol.get() !== dest.getCol()) {
      const cur = itCol.next();
      if (cur !== dest.getCol()) this.addPuzzle(line, cur, 'EW');
    }
  }

  /** Java's `(ConnectorPuzzleEmpty)` cast throws on an element (`cov-goto-back`, D5). @see Grid.java:422-430 */
  private addPuzzle(line: Line | null, col: Col | null, direction: string): void {
    const cell = this.getCell(line, col);
    const data = cell.getData();
    if (data !== null && !(data instanceof ConnectorPuzzleEmpty))
      throw new Error('ClassCastException: a route crosses an element');
    let connector = data;
    if (connector === null) {
      connector = new ConnectorPuzzleEmpty();
      cell.setData(connector);
    }
    connector.appendAll(ConnectorPuzzleEmpty.get(direction));
  }
}
