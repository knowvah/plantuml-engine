/**
 * NwArray — the networks × columns grid of server cells.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NwArray.java
 */
import type { NServerDraw } from './NServerDraw.js';

/** @see NwArray.java:37 */
export class NwArray {
  /** `new NServerDraw[lines][cols]`, every cell `null`. @see NwArray.java:40 */
  private readonly data: (NServerDraw | null)[][];

  /** @see NwArray.java:42-44 */
  constructor(lines: number, cols: number) {
    this.data = Array.from({ length: lines }, () => new Array<NServerDraw | null>(cols).fill(null));
  }

  /** @see NwArray.java:47-49 */
  toString(): string {
    return `lines=${this.getNbLines()} cols=${this.getNbCols()}`;
  }

  /** @see NwArray.java:51-53 */
  getNbLines(): number {
    return this.data.length;
  }

  /**
   * `data[0].length`: with zero lines Java throws
   * `ArrayIndexOutOfBoundsException` (nwp D4).
   * @see NwArray.java:55-57
   */
  getNbCols(): number {
    const first = this.data[0];
    if (first === undefined) throw new Error('ArrayIndexOutOfBoundsException');
    return first.length;
  }

  /** @see NwArray.java:59-61 */
  get(i: number, j: number): NServerDraw | null {
    return this.data[i]![j]!;
  }

  /** @see NwArray.java:63-65 */
  getLine(i: number): (NServerDraw | null)[] {
    return this.data[i]!;
  }

  /** @see NwArray.java:67-69 */
  set(i: number, j: number, value: NServerDraw | null): void {
    this.data[i]![j] = value;
  }
}
