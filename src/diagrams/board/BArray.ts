/**
 * BArray — the cards of one activity, keyed by `"x;stage"` in a default
 * `HashMap<String, BNode>`. Upstream iterates `data.values()`, so the cards
 * draw in `HashMap` bucket order, not tree order (bep D3): the keys are kept
 * in `put` order and the table is replayed by `javaHashSetOrder` on each
 * iteration, as `java/util/HashMap.java` builds it.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/BArray.java
 */
import { javaHashSetOrder } from '../../core/java-hash-set.js';
import type { BNode } from './BNode.js';

/**
 * `String#hashCode()`: `s[0]*31^(n-1) + ... + s[n-1]` over UTF-16 code
 * units, as a Java `int`. Local, as five other ports keep theirs (bep D3).
 * @see JDK 21 java/lang/StringLatin1.java `hashCode`
 */
function javaStringHashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/** @see BArray.java:43 */
export class BArray implements Iterable<BNode> {
  /** `new HashMap<>()`: the values by key, plus the keys in `put` order for the replay. @see BArray.java:45 */
  private readonly data = new Map<string, BNode>();
  /** @see BArray.java:46 */
  private maxX = 0;
  /** @see BArray.java:47 */
  private maxY = 0;

  /** A duplicate key is Java's `IllegalArgumentException`. @see BArray.java:49-57 */
  put(node: BNode): void {
    const key = this.getKey(node.getX(), node.getStage());
    if (this.data.has(key)) {
      throw new Error('IllegalArgumentException');
    }
    this.data.set(key, node);
    this.maxX = Math.max(this.maxX, node.getX());
    this.maxY = Math.max(this.maxY, node.getStage());
  }

  /** @see BArray.java:59-62 */
  getCell(x: number, y: number): BNode | undefined {
    const key = this.getKey(x, y);
    return this.data.get(key);
  }

  /** @see BArray.java:64-66 */
  private getKey(x: number, y: number): string {
    return `${String(x)};${String(y)}`;
  }

  /**
   * `data.values().iterator()`: a `HashMap`'s values follow its keys' table
   * order, which `javaHashSetOrder` replays from the `put` history (`put`
   * never repeats a key, so the history is the map's insertion order).
   * `String#equals` is `Object.is` on two strings.
   * @see BArray.java:68-70
   */
  [Symbol.iterator](): Iterator<BNode> {
    const keys = javaHashSetOrder([...this.data.keys()], javaStringHashCode, Object.is);
    return keys.map((key) => this.data.get(key)!)[Symbol.iterator]();
  }

  /** @see BArray.java:72-74 */
  getMaxX(): number {
    return this.maxX;
  }

  /** @see BArray.java:76-78 */
  getMaxY(): number {
    return this.maxY;
  }
}
