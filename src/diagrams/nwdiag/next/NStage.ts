/**
 * NStage — one row of the nwdiag play field: a network's ordinal.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NStage.java
 */

/** @see NStage.java:37 */
export class NStage {
  /** @see NStage.java:39 */
  private readonly number: number;

  /** @see NStage.java:41-43 */
  constructor(number: number) {
    this.number = number;
  }

  /** @see NStage.java:46-48 */
  toString(): string {
    return `S${this.number}`;
  }

  /** `Integer.compare`. @see NStage.java:51-53 */
  compareTo(other: NStage): number {
    return this.number < other.number ? -1 : this.number === other.number ? 0 : 1;
  }

  /** @see NStage.java:55-57 */
  getNumber(): number {
    return this.number;
  }

  /** The second stage wins a tie. @see NStage.java:59-64 */
  static getMin(stage1: NStage, stage2: NStage): NStage {
    if (stage1.number < stage2.number) return stage1;
    return stage2;
  }

  /** The second stage wins a tie. @see NStage.java:66-71 */
  static getMax(stage1: NStage, stage2: NStage): NStage {
    if (stage1.number > stage2.number) return stage1;
    return stage2;
  }
}
