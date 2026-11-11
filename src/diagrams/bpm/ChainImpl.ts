import type { Chain } from './Chain.js';
import type { Navigator } from './Navigator.js';

/**
 * ChainImpl — a chain grown both ways from a root: `positive` holds the root
 * and what follows it, `negative` what precedes it, nearest first. A cursor
 * past either end pads its list with `null` (`ensure`), which `toList`
 * hides (D1, D9). Elements compare by reference (`Line`/`Col` inherit
 * `Object#equals`). A navigator whose chain changed structurally under it
 * throws `ConcurrentModificationException`.
 *
 * Not ported: the private no-argument constructor and `cloneMe`
 * (java:61-67, 107-108): `Grid#cloneMe`, their one caller, has none (D1).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/ChainImpl.java:46-245
 */
export class ChainImpl<O extends object> implements Chain<O> {
  /** @see ChainImpl.java:48 */
  private readonly positive: (O | null)[] = [];
  /** @see ChainImpl.java:49 */
  private readonly negative: (O | null)[] = [];
  /** @see ChainImpl.java:50 */
  private currentVersion = 0;

  /** `Objects.requireNonNull(root)`. @see ChainImpl.java:110-112 */
  constructor(root: O) {
    this.positive.push(root);
  }

  /** `List#remove(Object)`: the first `equals` (reference) match. @see ChainImpl.java:52-59 */
  remove(data: O): boolean {
    this.updateStructuralVersion();
    let result = removeFirst(this.positive, data);
    if (!result) result = removeFirst(this.negative, data);
    return result;
  }

  /** Negatives from the far end inward, then positives. @see ChainImpl.java:69-90 */
  compare(a: O, b: O): number {
    if (a === b) return 0;
    for (let i = this.negative.length - 1; i >= 0; i--) {
      if (a === this.negative[i]) return -1;
      if (b === this.negative[i]) return 1;
    }
    for (const cur of this.positive) {
      if (a === cur) return -1;
      if (b === cur) return 1;
    }
    throw new Error('UnsupportedOperationException: neither element is in the chain');
  }

  /** Each negative is inserted at the front, so the far end leads. @see ChainImpl.java:92-105 */
  toList(): readonly O[] {
    const result: O[] = [];
    for (const element of this.negative) if (element !== null) result.unshift(element);
    for (const element of this.positive) if (element !== null) result.push(element);
    return result;
  }

  /** @see ChainImpl.java:114-117 */
  private updateStructuralVersion(): number {
    this.currentVersion++;
    return this.currentVersion;
  }

  /** @see ChainImpl.java:119-130 */
  contains(data: O): boolean {
    return this.indexOf(data) !== undefined;
  }

  /** `IllegalArgumentException` when absent. @see ChainImpl.java:132-147 */
  navigator(data: O): Navigator<O> {
    const position = this.indexOf(data);
    if (position === undefined) throw new Error('IllegalArgumentException: not in the chain');
    return new InternalNavigator(this, position, this.currentVersion);
  }

  /**
   * The shared scan of `contains`/`navigator`: positive `i`, else negative
   * `-i - 1`, interleaved by index. `Objects.requireNonNull(data)`.
   * @see ChainImpl.java:119-147
   */
  private indexOf(data: O | null | undefined): number | undefined {
    if (data === null || data === undefined) throw new Error('NullPointerException: chain element is null');
    for (let i = 0; i < Math.max(this.positive.length, this.negative.length); i++) {
      if (i < this.positive.length && data === this.positive[i]) return i;
      if (i < this.negative.length && data === this.negative[i]) return -i - 1;
    }
    return undefined;
  }

  /** The navigator's version check. @see ChainImpl.java:206-210 */
  version(): number {
    return this.currentVersion;
  }

  /** @see ChainImpl.java:149-156 */
  getInternal(position: number): O | null {
    this.ensure(position);
    if (position >= 0) return this.positive[position] ?? null;
    return this.negative[-position - 1] ?? null;
  }

  /** @see ChainImpl.java:158-166 */
  setInternal(position: number, data: O): void {
    requireNonNull(data);
    this.ensure(position);
    if (position >= 0) this.positive[position] = data;
    else this.negative[-position - 1] = data;
  }

  /** `List#add(index, data)` after `ensure`. @see ChainImpl.java:168-176 */
  insertInternal(position: number, data: O): void {
    requireNonNull(data);
    this.ensure(position);
    if (position >= 0) this.positive.splice(position, 0, data);
    else this.negative.splice(-position - 1, 0, data);
  }

  /** A structural change: the navigator adopts the new version. @see ChainImpl.java:235,240 */
  bumpVersion(): number {
    return this.updateStructuralVersion();
  }

  /** @see ChainImpl.java:178-184 */
  private ensure(position: number): void {
    if (position >= 0) ensureInternal(position, this.positive);
    else ensureInternal(-position - 1, this.negative);
  }
}

/** Pads with `null` until `position` is an index. @see ChainImpl.java:186-194 */
function ensureInternal<O>(position: number, list: (O | null)[]): void {
  while (list.length <= position) list.push(null);
}

function requireNonNull(data: unknown): void {
  if (data === null || data === undefined) throw new Error('NullPointerException: chain element is null');
}

function removeFirst<O>(list: (O | null)[], data: O): boolean {
  const index = list.indexOf(data);
  if (index === -1) return false;
  list.splice(index, 1);
  return true;
}

/**
 * The inner class `ChainImpl.InternalNavigator`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/bpm/ChainImpl.java:196-243
 */
class InternalNavigator<O extends object> implements Navigator<O> {
  /** @see ChainImpl.java:201-204 */
  constructor(
    private readonly chain: ChainImpl<O>,
    private position: number,
    private version: number,
  ) {}

  /** @see ChainImpl.java:206-210 */
  private checkConsistency(): void {
    if (this.version !== this.chain.version()) throw new Error('ConcurrentModificationException: the chain changed');
  }

  /** @see ChainImpl.java:212-216 */
  next(): O | null {
    this.checkConsistency();
    this.position++;
    return this.get();
  }

  /** @see ChainImpl.java:218-222 */
  previous(): O | null {
    this.checkConsistency();
    this.position--;
    return this.get();
  }

  /** @see ChainImpl.java:224-227 */
  get(): O | null {
    this.checkConsistency();
    return this.chain.getInternal(this.position);
  }

  /** @see ChainImpl.java:229-232 */
  set(data: O): void {
    this.checkConsistency();
    this.chain.setInternal(this.position, data);
  }

  /** No consistency check upstream. @see ChainImpl.java:234-237 */
  insertBefore(data: O): void {
    this.version = this.chain.bumpVersion();
    this.chain.insertInternal(this.position, data);
  }

  /** @see ChainImpl.java:239-242 */
  insertAfter(data: O): void {
    this.version = this.chain.bumpVersion();
    this.chain.insertInternal(this.position + 1, data);
  }
}
