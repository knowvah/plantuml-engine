/**
 * NBox — bars packed together as one block: a single server, or a group.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NBox.java
 */
import { NStage } from './NStage.js';
import { NTetris } from './NTetris.js';
import type { NBar } from './NBar.js';
import type { Staged } from './Staged.js';

/** @see NBox.java:41 */
export class NBox implements Staged {
  /** @see NBox.java:43 */
  private readonly bars: NBar[] = [];
  /** @see NBox.java:44 */
  private readonly tetris = new NTetris<NBar>();

  /** @see NBox.java:46-52 */
  add(bar: NBar): void {
    if (this.bars.includes(bar)) return;
    this.bars.push(bar);
    this.tetris.add(bar);
  }

  /** `bars.get(0)`: an empty box throws, as Java's `IndexOutOfBoundsException`. */
  private first(): NBar {
    const bar = this.bars[0];
    if (bar === undefined) throw new Error('IndexOutOfBoundsException');
    return bar;
  }

  /** @see NBox.java:55-61 */
  getStart(): NStage {
    let result = this.first().getStart();
    for (let i = 1; i < this.bars.length; i++) result = NStage.getMin(result, this.bars[i]!.getStart());
    return result;
  }

  /** @see NBox.java:64-70 */
  getEnd(): NStage {
    let result = this.first().getEnd();
    for (let i = 1; i < this.bars.length; i++) result = NStage.getMax(result, this.bars[i]!.getEnd());
    return result;
  }

  /** @see NBox.java:73-75 */
  getNWidth(): number {
    return this.tetris.getNWidth();
  }

  /** @see NBox.java:77-79 */
  getPositions(): ReadonlyMap<NBar, number> {
    return this.tetris.getPositions();
  }

  /** @see NBox.java:82-84 */
  contains(stage: NStage): boolean {
    return stage.compareTo(this.getStart()) >= 0 && stage.compareTo(this.getEnd()) <= 0;
  }
}
