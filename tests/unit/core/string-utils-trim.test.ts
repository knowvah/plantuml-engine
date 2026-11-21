/**
 * `StringUtils.isTrimmable`, `trin` and `trim2` (upstream 0c54c010cdf): U+00A0 is a blank for both trims.
 *
 * @see ~/git/plantuml/src/test/java/net/sourceforge/plantuml/StringUtilsTest.java:110-116
 */
import { describe, expect, it } from 'vitest';
import { isTrimmable, trim2, trin } from '../../../src/core/string-utils-trim.js';

const NBSP = '\u00A0';

describe('StringUtils trims (0c54c010cdf)', () => {
  it('trinRemovesTheNonBreakingSpace (StringUtilsTest.java:110-116)', () => {
    expect(trin(`${NBSP} foo${NBSP}`)).toBe('foo');
    expect(trin(`${NBSP}foo${NBSP}bar\t`)).toBe(`foo${NBSP}bar`);
    expect(trin(`${NBSP}${NBSP}`)).toBe('');
    expect(trim2(`${NBSP}foo ${NBSP}`)).toBe('foo');
  });

  it('isTrimmable: every char <= U+0020 and U+00A0, nothing else (StringUtils.java:654-656)', () => {
    expect(isTrimmable('\u0000')).toBe(true);
    expect(isTrimmable('\t')).toBe(true);
    expect(isTrimmable(' ')).toBe(true);
    expect(isTrimmable(NBSP)).toBe(true);
    expect(isTrimmable('!')).toBe(false);
    expect(isTrimmable('\u2003')).toBe(false);
    expect(isTrimmable('\u3000')).toBe(false);
  });

  it('keeps blanks JS String#trim would remove but Java does not', () => {
    expect(trin('\u2003foo\u3000')).toBe('\u2003foo\u3000');
    expect(trim2('\uFEFFfoo')).toBe('\uFEFFfoo');
  });

  it('returns the argument itself when nothing is trimmed, "" when all is', () => {
    expect(trin('')).toBe('');
    expect(trin('a b')).toBe('a b');
    expect(trin(' \t\n')).toBe('');
    expect(trim2('')).toBe('');
    expect(trim2('x')).toBe('x');
    expect(trim2('\u0001\u0001')).toBe('');
  });
});
