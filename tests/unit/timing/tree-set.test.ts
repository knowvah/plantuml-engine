import { describe, expect, it } from 'vitest';

import { treeMapPut, treeSetAdd, type TreeMapEntry } from '../../../src/diagrams/timing/tree-set.js';

const num = (n: number): { n: number; compareTo(o: { n: number }): number } => ({ n, compareTo: (o) => n - o.n });

describe('treeSetAdd (TreeSet#add)', () => {
  it('keeps ascending order whatever the insertion order', () => {
    const set: ReturnType<typeof num>[] = [];
    for (const n of [5, 1, 9, 3, 7]) expect(treeSetAdd(set, num(n))).toBe(true);
    expect(set.map((x) => x.n)).toEqual([1, 3, 5, 7, 9]);
  });

  it('does not add an element comparing equal to a member, and keeps the first one', () => {
    const first = num(4);
    const set = [num(1), first, num(8)];
    expect(treeSetAdd(set, num(4))).toBe(false);
    expect(set).toHaveLength(3);
    expect(set[1]).toBe(first);
  });
});

describe('treeMapPut (TreeMap#put)', () => {
  const key = (n: number): { n: number; compareTo(o: { n: number }): number } => ({ n, compareTo: (o) => n - o.n });

  it('keeps the keys ascending and inserts a new key with its value', () => {
    const map: TreeMapEntry<ReturnType<typeof key>, string>[] = [];
    for (const n of [5, 1, 9]) treeMapPut(map, key(n), `v${n}`);
    expect(map.map((e) => [e.key.n, e.value])).toEqual([
      [1, 'v1'],
      [5, 'v5'],
      [9, 'v9'],
    ]);
  });

  it('keeps the first key and takes the new value on an equal key (`@1` then `@1.0`)', () => {
    const first = key(4);
    const map: TreeMapEntry<ReturnType<typeof key>, string>[] = [];
    treeMapPut(map, key(1), 'a');
    treeMapPut(map, first, 'old');
    treeMapPut(map, key(4), 'new');
    expect(map).toHaveLength(2);
    expect(map[1]?.key).toBe(first);
    expect(map[1]?.value).toBe('new');
  });
});
