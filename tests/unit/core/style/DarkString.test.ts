/**
 * DarkString — the regular/dark value pair behind every `ValueImpl`.
 * Branches pinned against `value/DarkString.java:50-92`; the regular+dark
 * combination is additionally jar-probed (see the ValueImpl test).
 */
import { describe, expect, it } from 'vitest';
import { DarkString } from '../../../../src/core/style/DarkString.js';
import { Specificity } from '../../../../src/core/style/Specificity.js';

const at = (order: number): Specificity => Specificity.atOrder(order);

describe('DarkString', () => {
  describe('mergeWith', () => {
    it('returns this for an undefined other (DarkString.java:51-52, Java null)', () => {
      const a = new DarkString('red', null, at(3));
      expect(a.mergeWith(undefined)).toBe(a);
    });

    it('two regular values: the strictly bigger specificity wins (java:54-57)', () => {
      const low = new DarkString('red', null, at(1));
      const high = new DarkString('blue', null, at(2));
      expect(low.mergeWith(high)).toBe(high);
      expect(high.mergeWith(low)).toBe(high);
    });

    it('two regular values of equal specificity: other wins (isBiggerThan is strict)', () => {
      const a = new DarkString('red', null, at(5));
      const b = new DarkString('blue', null, at(5));
      expect(a.mergeWith(b)).toBe(b);
      expect(b.mergeWith(a)).toBe(a);
    });

    it('a stereotype value beats a later plain one (Specificity stereotype tier)', () => {
      const stereo = new DarkString('red', null, at(1).withStereotypeCount(1));
      const plain = new DarkString('blue', null, at(5000));
      expect(stereo.mergeWith(plain)).toBe(stereo);
      expect(plain.mergeWith(stereo)).toBe(stereo);
    });

    it('two dark values: the bigger specificity wins (java:54 second disjunct)', () => {
      const low = new DarkString(null, 'red', at(1));
      const high = new DarkString(null, 'blue', at(2));
      expect(low.mergeWith(high)).toBe(high);
    });

    it('regular this + dark other: combines, keeping this specificity (java:59-60)', () => {
      const merged = new DarkString('red', null, at(1)).mergeWith(new DarkString(null, 'blue', at(9)));
      expect([merged.getValue1(), merged.getValue2(), merged.getSpecificity().toString()]).toEqual([
        'red',
        'blue',
        '1',
      ]);
    });

    it('dark this + regular other: combines, keeping other specificity (java:61-62)', () => {
      const merged = new DarkString(null, 'blue', at(9)).mergeWith(new DarkString('red', null, at(1)));
      expect([merged.getValue1(), merged.getValue2(), merged.getSpecificity().toString()]).toEqual([
        'red',
        'blue',
        '1',
      ]);
    });

    it('a full pair against a regular value falls through to specificity (java:64-66)', () => {
      const pair = new DarkString('red', 'blue', at(4));
      const regular = new DarkString('green', null, at(7));
      expect(pair.mergeWith(regular)).toBe(regular);
      expect(regular.mergeWith(pair)).toBe(regular);
    });
  });

  it('withAncestorRank / withStereotypeCount keep both strings (java:69-75)', () => {
    const ranked = new DarkString('red', 'blue', at(3)).withAncestorRank(-1);
    expect([ranked.getValue1(), ranked.getValue2(), ranked.getSpecificity().toString()]).toEqual([
      'red',
      'blue',
      '3,stereo=0,ancestor=-1',
    ]);
    expect(new DarkString('red', null, at(3)).withStereotypeCount(2).getSpecificity().toString()).toBe('3,stereo=2');
  });

  it('toString is value1/value2 (specificity), nulls printed as "null" (java:77-80)', () => {
    expect(new DarkString('red', null, at(3)).toString()).toBe('red/null (3)');
    expect(new DarkString(null, 'blue', at(4)).toString()).toBe('null/blue (4)');
  });
});
