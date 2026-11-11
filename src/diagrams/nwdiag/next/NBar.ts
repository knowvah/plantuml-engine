/**
 * NBar — a server's vertical extent: the stages of the networks it joins.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NBar.java
 */
import { NStage } from './NStage.js';
import type { NBox } from './NBox.js';
import type { Staged } from './Staged.js';

/** @see NBar.java:39 */
export class NBar implements Staged {
  /** @see NBar.java:41 */
  private parent: NBox | null = null;
  /** Java's `null` until the first `addStage`. @see NBar.java:42 */
  private start: NStage | null = null;
  /** @see NBar.java:43 */
  private end: NStage | null = null;

  /** @see NBar.java:46-48 */
  toString(): string {
    return `${String(this.start)}->${String(this.end)}`;
  }

  /** @see NBar.java:50-52 */
  getParent(): NBox | null {
    return this.parent;
  }

  /** @see NBar.java:54-56 */
  setParent(parent: NBox | null): void {
    this.parent = parent;
  }

  /**
   * Java returns `null` before the first `addStage`; every caller reads it
   * after one (`NServer.connectTo`), so the port asserts it.
   * @see NBar.java:59-61
   */
  getStart(): NStage {
    return this.start!;
  }

  /** @see NBar.java:64-66 */
  getEnd(): NStage {
    return this.end!;
  }

  /** `Objects.requireNonNull(stage)`, then grow the range. @see NBar.java:68-77 */
  addStage(stage: NStage | null | undefined): void {
    if (stage === null || stage === undefined) throw new Error('NullPointerException');
    if (this.start === null && this.end === null) {
      this.start = stage;
      this.end = stage;
    } else {
      this.start = NStage.getMin(this.start!, stage);
      this.end = NStage.getMax(this.end!, stage);
    }
  }

  /** @see NBar.java:80-82 */
  getNWidth(): number {
    return 1;
  }

  /** @see NBar.java:85-87 */
  contains(stage: NStage): boolean {
    return stage.compareTo(this.start!) >= 0 && stage.compareTo(this.end!) <= 0;
  }
}
