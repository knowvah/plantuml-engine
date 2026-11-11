/** An element that orders itself, as `java.lang.Comparable` does. */
export interface Comparable<T> {
  compareTo(other: T): number;
}

/**
 * `TreeSet#add` over a sorted array (timing-engine-port D6): binary search on `compareTo`, and an element
 * comparing equal to a member is not added. Answers whether the element was added.
 */
export function treeSetAdd<T extends Comparable<T>>(sorted: T[], element: T): boolean {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const c = (sorted[mid] as T).compareTo(element);
    if (c === 0) return false;
    if (c < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  sorted.splice(lo, 0, element);
  return true;
}

/** One `Map.Entry<K, V>` of a {@link treeMapPut} array. */
export interface TreeMapEntry<K, V> {
  readonly key: K;
  value: V;
}

/**
 * `TreeMap#put` over a sorted array (timing-engine-port D6): binary search on `compareTo`; a key comparing equal to
 * a member keeps the first key and takes the new value, so `@1` and `@1.0` are one entry.
 */
export function treeMapPut<K extends Comparable<K>, V>(sorted: TreeMapEntry<K, V>[], key: K, value: V): void {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const entry = sorted[mid] as TreeMapEntry<K, V>;
    const c = entry.key.compareTo(key);
    if (c === 0) {
      entry.value = value;
      return;
    }
    if (c < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  sorted.splice(lo, 0, { key, value });
}
