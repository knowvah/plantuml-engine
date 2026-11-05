/**
 * BNode — one card of a board activity: its label, its stage (the number of
 * `+` that introduced it, 0 for the activity's root) and the column `x` that
 * `computeX` assigns.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BNode.java
 */
import type { BArray } from './BArray.js';

/** `java.util.concurrent.atomic.AtomicInteger`, the one counter `computeX` threads through the tree. */
export interface AtomicInteger {
  value: number;
}

/** @see BNode.java:42 */
export class BNode {
  /** @see BNode.java:45 */
  private readonly name: string;
  /** @see BNode.java:46 */
  private readonly stage: number;
  /** @see BNode.java:47 */
  private x = -1;
  /** @see BNode.java:48 */
  private parent: BNode | undefined = undefined;
  /** @see BNode.java:49 */
  private readonly children: BNode[] = [];

  /** @see BNode.java:51-54 */
  constructor(stage: number, name: string) {
    this.name = name;
    this.stage = stage;
  }

  /**
   * Both guards are Java's `IllegalArgumentException`s; the second runs after
   * the child is already added, as written.
   * @see BNode.java:56-65
   */
  addChild(child: BNode): void {
    if (child.stage <= this.stage) {
      throw new Error('IllegalArgumentException');
    }
    this.children.push(child);
    if (child.parent !== undefined) {
      throw new Error('IllegalArgumentException');
    }
    child.parent = this;
  }

  /** @see BNode.java:67-69 */
  getName(): string {
    return this.name;
  }

  /** @see BNode.java:71-73 */
  getStage(): number {
    return this.stage;
  }

  /** @see BNode.java:75-77 */
  getParent(): BNode | undefined {
    return this.parent;
  }

  /** @see BNode.java:79-82 */
  toString(): string {
    return `${this.name}(${String(this.stage)}) [${String(this.x)}]`;
  }

  /**
   * Pre-order columns: the first child shares its parent's column, each later
   * sibling bumps the shared counter first.
   * @see BNode.java:84-93
   */
  computeX(count: AtomicInteger): void {
    this.x = count.value;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]!;
      if (i > 0) {
        count.value += 1;
      }
      child.computeX(count);
    }
  }

  /** @see BNode.java:95-101 */
  initBarray(array: BArray): void {
    array.put(this);
    for (const child of this.children) {
      child.initBarray(array);
    }
  }

  /** @see BNode.java:103-105 */
  getX(): number {
    return this.x;
  }
}
