/**
 * Specificity — the ordered tuple c9d62097ff5 put in place of the single-int
 * priority, compared tier by tier (`value/Specificity.java:129-148`).
 */
import { describe, expect, it } from 'vitest';
import { Specificity } from '../../../../src/core/style/Specificity.js';

const at = (order: number): Specificity => Specificity.atOrder(order);

describe('Specificity.compareTo', () => {
  it('order is the last tier: later wins, equal is a tie (java:147)', () => {
    expect(at(2).compareTo(at(1))).toBe(1);
    expect(at(1).compareTo(at(2))).toBe(-1);
    expect(at(3).compareTo(at(3))).toBe(0);
    expect(at(3).isBiggerThan(at(3))).toBe(false);
  });

  it('a stereotype count outranks any file order (java:143-145)', () => {
    expect(at(1).withStereotypeCount(1).isBiggerThan(at(1_000_000))).toBe(true);
    expect(at(1).withStereotypeCount(2).isBiggerThan(at(9).withStereotypeCount(1))).toBe(true);
  });

  it('the ancestor cascade outranks stereotype count; a nearer rank wins (java:135-141)', () => {
    const cascaded = at(1).withAncestorRank(-3);
    expect(cascaded.isBiggerThan(at(9).withStereotypeCount(5))).toBe(true);
    expect(at(1).withAncestorRank(0).isBiggerThan(at(9).withAncestorRank(-1))).toBe(true);
    // withAncestorRank keeps the stereotype count, which then breaks a rank tie
    expect(at(1).withStereotypeCount(1).withAncestorRank(-1).isBiggerThan(at(9).withAncestorRank(-1))).toBe(true);
  });

  it('a forced override beats everything, the cascade included (java:131-133)', () => {
    expect(Specificity.forcedOverride().isBiggerThan(at(1).withStereotypeCount(3).withAncestorRank(0))).toBe(true);
    expect(at(1).withAncestorRank(0).compareTo(Specificity.forcedOverride())).toBe(-1);
  });
});

describe('Specificity accessors', () => {
  it('hasStereotype is a non-zero stereotype count (java:124-127)', () => {
    expect(at(1).hasStereotype()).toBe(false);
    expect(at(1).withStereotypeCount(1).hasStereotype()).toBe(true);
    expect(Specificity.forcedOverride().hasStereotype()).toBe(false);
  });

  it('toString per tier (java:154-163)', () => {
    expect(Specificity.forcedOverride().toString()).toBe('override');
    expect(at(7).toString()).toBe('7');
    expect(at(7).withStereotypeCount(2).toString()).toBe('7,stereo=2');
    expect(at(7).withAncestorRank(-2).toString()).toBe('7,stereo=0,ancestor=-2');
  });
});
