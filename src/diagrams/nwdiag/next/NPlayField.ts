/**
 * NPlayField — the stages (one per network) and the boxes packed across them.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/next/NPlayField.java
 */
import { NBox } from './NBox.js';
import { NStage } from './NStage.js';
import { NTetris } from './NTetris.js';
import type { NBar } from './NBar.js';
import type { NServer } from '../core/NServer.js';
import type { NwGroup } from '../core/NwGroup.js';

/** @see NPlayField.java:48 */
export class NPlayField {
  /** @see NPlayField.java:50 */
  private readonly stages: NStage[] = [];
  /** @see NPlayField.java:52 */
  private readonly boxes: NBox[] = [];

  /** Grows the stage list up to `num`. @see NPlayField.java:54-59 */
  getStage(num: number): NStage {
    while (this.stages.length <= num) this.stages.push(new NStage(this.stages.length));
    return this.stages[num]!;
  }

  /** @see NPlayField.java:61-66 */
  getLast(): NStage | null {
    if (this.stages.length === 0) return null;
    return this.getStage(this.stages.length - 1);
  }

  /** @see NPlayField.java:68-70 */
  createNewStage(): NStage {
    return this.getStage(this.stages.length);
  }

  /** @see NPlayField.java:72-81 */
  addInPlayfield(bar: NBar): void {
    const parent = bar.getParent();
    if (parent === null) {
      const single = new NBox();
      single.add(bar);
      bar.setParent(single);
      this.boxes.push(single);
    } else if (!this.boxes.includes(parent)) {
      this.boxes.push(parent);
    }
  }

  /**
   * Each bar's column: its box's position plus its place inside the box.
   * Java's result is a `HashMap` read only by `get` (nwp D4).
   * @see NPlayField.java:83-101
   */
  doLayout(): ReadonlyMap<NBar, number> {
    const tetris = new NTetris<NBox>();
    for (const box of this.boxes) tetris.add(box);
    const result = new Map<NBar, number>();
    for (const [box, boxPos] of tetris.getPositions())
      for (const [bar, barPos] of box.getPositions()) result.set(bar, boxPos + barPos);
    return result;
  }

  /** @see NPlayField.java:103-108 */
  fixGroups(groups: readonly NwGroup[], servers: Iterable<NServer>): void {
    const all = [...servers];
    for (const group of groups)
      for (const server of all) if (group.contains(server)) this.fixServerInGroup(server, group);
  }

  /** `boxes.remove(Object)` drops the first occurrence. @see NPlayField.java:110-119 */
  private fixServerInGroup(server: NServer, group: NwGroup): void {
    const groupBox = group.getNboxInternal();
    const bar = server.getBar();
    if (bar.getParent() === groupBox) return;
    const at = this.boxes.indexOf(bar.getParent()!);
    if (at >= 0) this.boxes.splice(at, 1);
    if (!this.boxes.includes(groupBox)) this.boxes.push(groupBox);
    bar.setParent(groupBox);
    groupBox.add(bar);
  }
}
