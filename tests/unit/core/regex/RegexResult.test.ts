import { describe, expect, it } from 'vitest';
import { RegexPartialMatch } from '../../../../src/core/regex/RegexPartialMatch.js';
import { RegexResult } from '../../../../src/core/regex/RegexResult.js';
import { RegexConcat } from '../../../../src/core/regex/RegexConcat.js';
import { RegexLeaf } from '../../../../src/core/regex/RegexLeaf.js';
import { RegexOr } from '../../../../src/core/regex/RegexOr.js';
import { UBrexConcat } from '../../../../src/core/ubrex/builder/UBrexConcat.js';
import { UBrexLeaf } from '../../../../src/core/ubrex/builder/UBrexLeaf.js';
import { UBrexNamed } from '../../../../src/core/ubrex/builder/UBrexNamed.js';
import { UBrexOr } from '../../../../src/core/ubrex/builder/UBrexOr.js';
import type { UMatcher } from '../../../../src/core/ubrex/UMatcher.js';

function partial(...values: (string | undefined)[]): RegexPartialMatch {
  const p = new RegexPartialMatch(values.length);
  for (const v of values) p.add(v);
  return p;
}

function groupResult(...groups: [string, RegexPartialMatch][]): RegexResult {
  const r = RegexResult.create();
  for (const [name, value] of groups) r.add(name, value);
  return r;
}

function mapResult(): RegexResult {
  return groupResult(['NAME', partial('foo', 'bar')], ['NAME2', partial(undefined, 'baz')], ['OTHER', partial('o')]);
}

function matcherResult(): { result: RegexResult; matcher: UMatcher } {
  const cut = UBrexConcat.build(
    new UBrexNamed('K', new UBrexLeaf('〇+〴d')),
    new UBrexLeaf(','),
    new UBrexNamed('K', new UBrexLeaf('〇+〴d')),
    new UBrexOr(new UBrexNamed('KP_A', new UBrexLeaf('x')), new UBrexNamed('KP_B', new UBrexLeaf('y'))),
  );
  const matcher = cut.match('12,34x', 0);
  return { result: RegexResult.fromUMatcher(matcher), matcher };
}

describe('RegexResult (named groups in match order, RegexResult.java:46-175, e2659a157bf)', () => {
  it('getUMatcher is undefined (:55-57)', () => {
    expect(mapResult().getUMatcher()).toBeUndefined();
  });

  it('get(key) returns the partial match, undefined when absent (:106-111)', () => {
    const r = mapResult();
    expect(r.get('NAME')?.size()).toBe(2);
    expect(r.get('NOPE')).toBeUndefined();
  });

  it('get(key) answers the FIRST of two groups sharing a name (:72-91, the HashMap kept the last)', () => {
    const r = groupResult(['COLOR', partial('#Technology')], ['COLOR', partial('#F1F1F1')]);
    expect(r.get('COLOR', 0)).toBe('#Technology');
    expect(r.getLazzy('COLOR', 0)).toBe('#Technology');
    expect(r.size()).toBe(2);
  });

  it('get(key, num) reads the nth capture, undefined for an unknown key (:113-126)', () => {
    const r = mapResult();
    expect(r.get('NAME', 1)).toBe('bar');
    expect(r.get('NAME2', 0)).toBeUndefined();
    expect(r.get('NOPE', 0)).toBeUndefined();
  });

  it('get(key, num) out of range throws RangeError (RegexPartialMatch#get)', () => {
    expect(() => mapResult().get('NAME', 2)).toThrow(RangeError);
  });

  it('getLazzy returns the first non-null capture num among keys with the prefix (:128-160)', () => {
    const r = mapResult();
    expect(r.getLazzy('NAME', 0)).toBe('foo'); // NAME[0] first
    expect(r.getLazzy('NAME2', 0)).toBeUndefined(); // NAME2[0] is null, no other NAME2* key
    expect(r.getLazzy('NAME', 1)).toBe('bar');
    expect(r.getLazzy('OTH', 0)).toBe('o');
  });

  it('getLazzy walks the groups in match order: an earlier COLOR2 beats a later COLOR', () => {
    const r = groupResult(['COLOR2', partial('#pink')], ['CODE', partial('b')], ['COLOR', partial('#green')]);
    expect(r.getLazzy('COLOR', 0)).toBe('#pink');
    expect(groupResult(['COLOR2', partial(undefined)], ['COLOR', partial('#green')]).getLazzy('COLOR', 0)).toBe(
      '#green',
    );
  });

  it('getLazzy skips keys whose list is too short and non-matching prefixes', () => {
    const r = groupResult(['AB', partial('short')], ['ABC', partial(undefined, 'second')], ['ABD', partial('x', 'y')]);
    expect(r.getLazzy('AB', 1)).toBe('second'); // AB has size 1 (<=1: skipped), ABC[1] wins
    expect(r.getLazzy('Z', 0)).toBeUndefined();
    expect(r.getLazzy('AB', 5)).toBeUndefined();
  });

  it('size is the number of groups (:169-173)', () => {
    expect(mapResult().size()).toBe(3);
  });

  it('toString lists the groups in order (:93-104)', () => {
    expect(mapResult().toString()).toBe('{NAME={[foo, bar]}, NAME2={[null, baz]}, OTHER={[o]}}');
    expect(RegexResult.create().toString()).toBe('{}');
  });
});

describe('RegexResult (UMatcher-backed, RegexResult.java:66-70)', () => {
  it('getUMatcher returns the matcher (:55-57)', () => {
    const { result, matcher } = matcherResult();
    expect(result.getUMatcher()).toBe(matcher);
  });

  it('get(key) is unsupported (:106-108)', () => {
    expect(() => matcherResult().result.get('K')).toThrow('UnsupportedOperationException');
  });

  it('size is unsupported (:169-171)', () => {
    expect(() => matcherResult().result.size()).toThrow('UnsupportedOperationException');
  });

  it('get(key, num) indexes findValuesByKey, undefined when empty (:113-119)', () => {
    const { result } = matcherResult();
    expect(result.get('K', 0)).toBe('12');
    expect(result.get('K', 1)).toBe('34');
    expect(result.get('NOPE', 0)).toBeUndefined();
    expect(() => result.get('K', 2)).toThrow(new RangeError('Index 2 out of bounds for length 2'));
  });

  it('getLazzy indexes findFirstValuesByKeyPrefix, undefined when none (:128-134)', () => {
    const { result, matcher } = matcherResult();
    expect(result.getLazzy('KP_', 0)).toBe(matcher.findFirstValuesByKeyPrefix('KP_')?.[0]);
    expect(result.getLazzy('NOPE', 0)).toBeUndefined();
  });

  it('toString delegates to the matcher (:94-96)', () => {
    const { result, matcher } = matcherResult();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Java Object#toString of the matcher
    expect(result.toString()).toBe(String(matcher));
  });
});

describe('RegexComposed#matcher fills one RegexResult in node order (RegexComposed.java:80-108)', () => {
  // CommandArchimateMultilines.java:83,89: `color().getRegex()` and `ColorParser.exp1()` are both named COLOR.
  const twoColors = RegexConcat.build(
    'k',
    new RegexLeaf(1, 'COLOR', '(#\\w+)?'),
    new RegexLeaf(' '),
    new RegexLeaf(1, 'CODE', '(\\w+)'),
    new RegexLeaf(' '),
    new RegexLeaf(1, 'COLOR', '(#\\w+)?'),
  );

  it('keeps both same-named leaves, the first answering get and getLazzy', () => {
    const r = twoColors.matcher('#Technology X #F1F1F1')!;
    expect(r.toString()).toBe('{COLOR={[#Technology]}, CODE={[X]}, COLOR={[#F1F1F1]}}');
    expect(r.getLazzy('COLOR', 0)).toBe('#Technology');
    expect(twoColors.matcher(' X #F1F1F1')!.getLazzy('COLOR', 0)).toBe('#F1F1F1');
  });

  it('a named RegexOr adds its own entry after its children (RegexOr.java:74-85)', () => {
    const or = RegexConcat.build(
      'k',
      new RegexOr('ALT', new RegexLeaf(1, 'ALT1', '(a)'), new RegexLeaf(1, 'ALT2', '(b)')),
    );
    const r = or.matcher('b')!;
    expect(r.toString()).toBe('{ALT1={[null]}, ALT2={[b]}, ALT={[b]}}');
    expect(r.getLazzy('ALT', 0)).toBe('b');
  });

  it('an unnamed leaf consumes its groups without recording them (RegexLeaf.java:117-125)', () => {
    const r = RegexConcat.build('k', new RegexLeaf(1, '(x)'), new RegexLeaf(1, 'Y', '(y)')).matcher('xy')!;
    expect(r.toString()).toBe('{Y={[y]}}');
  });
});
