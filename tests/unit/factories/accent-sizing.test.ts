import { describe, expect, it } from 'vitest';
import { measureTeXIcon } from '../../../src/core/latex-metrics.js';

/**
 * Jar sizes (width x height) of the `<math>` images in the creole corpus
 * (`test-results/dot-cache/unknown/{jugepi,xanuke,kebadi,cunotu,vocalo}*`),
 * keyed by the LaTeX AsciiMath converts the source to.
 */
const JAR_SIZES: readonly (readonly [string, number, number])[] = [
  ['\\vec{{x}}', 20, 23],
  ['\\vec{{{x}}}', 20, 23],
  ['\\vec{{{x}{y}}}', 30, 27],
  ['\\vec{{x}}{y}{z}', 41, 27],
  ['\\vec{{{x}{y}{x}}}', 42, 27],
  ['\\vec{{{x}+{y}}}', 55, 30],
  ['\\vec{\\sqrt{{x}}}', 38, 35],
  ['\\vec{{\\sqrt{{{x}}}}}', 38, 35],
  ['\\vec{\\sqrt{{3}}}', 36, 35],
  ['\\vec{\\text{F}}', 22, 28],
  ['\\vec{{()}}', 24, 34],
  ['\\hat{{x}}', 20, 22],
  ['\\hat{{{x}}}', 20, 22],
  ['\\hat{{{x}{y}}}', 30, 26],
  ['\\hat{{x}}{y}{z}', 41, 26],
  ['\\hat{{{x}{y}{x}}}', 42, 26],
  ['\\tilde{{x}}', 20, 22],
  ['\\dot{{x}}', 20, 22],
  ['\\ddot{{x}}', 20, 22],
  ['\\overline{{x}}', 20, 21],
  ['\\underline{{x}}', 20, 21],
  ['\\underline{{{x}}}', 20, 21],
  ['\\underline{{{x}{y}{x}}}', 42, 25],
  ['\\underbrace{{{x}+{1}}}', 56, 38],
  ['\\vec{}', 8, 23],
  ['\\tilde{}', 8, 22],
  ['\\hat{}', 8, 22],
  ['\\dot{}', 8, 22],
  ['\\ddot{}', 8, 22],
  ['\\underline{}', 8, 12],
  ['\\overline{}', 8, 12],
  ['\\underbrace{}', 28, 18],
  ['\\overbrace{}', 28, 18],
];

describe('accent, over/under line and brace sizing (AccentedAtom, OverlinedAtom, UnderlinedAtom, OverUnderDelimiter)', () => {
  it.each(JAR_SIZES)('%s sizes %i x %i like the jar, with nothing unsupported', (latex, width, height) => {
    expect(measureTeXIcon(latex)).toEqual({ width, height, unsupported: [] });
  });

  it('sizes an overbrace as its underbrace mirror', () => {
    expect(measureTeXIcon('\\overbrace{{{x}+{1}}}')).toEqual({ width: 56, height: 38, unsupported: [] });
  });

  it('reports an accent AccentedAtom does not build as unsupported, sized by its base', () => {
    expect(measureTeXIcon('\\widehat{{x}}').unsupported).toEqual(['accent']);
  });
});
