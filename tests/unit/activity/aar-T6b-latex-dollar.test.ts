/**
 * aar-T6b: a `$` in the default math mode of a `<latex>` formula is skipped, not an error.
 * JLaTeXMath 1.0.7 `TeXParser#parse` (the `'$'` arm): `if (!ignoreWhiteSpace) { ...getDollarGroup... }`, else the
 * character is consumed and parsing continues. The jar's cached `cepivu-60-lobe416` images are 212x30.
 */
import { describe, it, expect } from 'vitest';
import { measureLatex, stripMathModeDollars } from '../../../src/core/latex.js';

describe('stripMathModeDollars', () => {
  it('drops an unescaped $ outside a text-mode group', () => {
    expect(stripMathModeDollars(String.raw`set $x = \sqrt{y+z}$ and $i = 1$`)).toBe(
      String.raw`set x = \sqrt{y+z} and i = 1`,
    );
  });

  it('keeps an escaped \\$ and a $ inside \\text{...}', () => {
    expect(stripMathModeDollars(String.raw`a \$ b \text{c $d$ e} $f`)).toBe(String.raw`a \$ b \text{c $d$ e} f`);
  });
});

describe('measureLatex with $ delimiters (cepivu-60-lobe416)', () => {
  it('sizes `set $x = \\sqrt{y+z}$ and $i = 1$` at the jar image size 212x30', () => {
    expect(measureLatex(String.raw`set $x = \sqrt{y+z}$ and $i = 1$`)).toEqual({ width: 212, height: 30 });
  });
});
