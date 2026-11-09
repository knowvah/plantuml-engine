/**
 * laep/T3b-4: QUALIFIER1/QUALIFIER2 need `RegexLeaf.spaceOneOrMore()` on both
 * sides (`CommandLinkClass.java:120-126` and `:145-151`). `-down[hidden]->`
 * has no space before `[`, so ENT1 `-down` (a SEPARATOR_CHAR_SINGLE `-` plus
 * atom, `:177-178`) is followed by `[`, which is not ARROW_BODY1 `[-=.]+`
 * (`:134`): the class factory refuses the line (the legacy activity factory
 * at `PSystemBuilder.java:137` claims it).
 */
import { describe, it, expect } from 'vitest';
import { parseRelationshipLine, REL_DISPATCH_RE } from '../../../src/diagrams/class/class-relationship-parser.js';

describe('relationship qualifier spacing (CommandLinkClass.java:120-126, 145-151)', () => {
  it('refuses `-down[hidden]-> Describe` (no space before the bracket)', () => {
    expect(REL_DISPATCH_RE.test('-down[hidden]-> Describe')).toBe(false);
    expect(parseRelationshipLine('-down[hidden]-> Describe')).toBeNull();
  });

  it('refuses a qualifier without a space after the bracket', () => {
    expect(parseRelationshipLine('A [q]-- B')).toBeNull();
  });

  it('accepts a spaced first qualifier', () => {
    const r = parseRelationshipLine('A [q] -- B')!;
    expect(r.fromQualifier).toBe('q');
  });

  it('accepts a spaced first qualifier after a quoted cardinality shape', () => {
    const r = parseRelationshipLine('A [q] "1" -- B')!;
    expect(r.fromQualifier).toBe('q');
    expect(r.fromMultiplicity).toBe('1');
  });

  it('accepts a spaced second qualifier', () => {
    expect(parseRelationshipLine('A -- [q] B')!.toQualifier).toBe('q');
  });

  // `[q]B` is ENT2 upstream too: `[` and `]` are SEPARATOR_CHAR_SINGLE (:81-95).
  it('reads an unspaced second bracket as part of ENT2, not a qualifier', () => {
    expect(parseRelationshipLine('A --[q]B')!.toQualifier).toBeUndefined();
  });
});
