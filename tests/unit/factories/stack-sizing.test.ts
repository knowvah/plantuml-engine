import { describe, expect, it } from 'vitest';
import { measureTeXIcon } from '../../../src/core/latex-metrics.js';

/**
 * Jar sizes (width x height) of formulas JLaTeXMath builds as a vertical
 * stack: `PredefMacros#stackrel_macro`, `#overset_macro`, `#underset_macro`
 * (`UnderOverAtom`) and a formula-level `\\` (`PredefMacros#cr_macro`,
 * `ArrayOfAtoms#getAsVRow`, `VRowAtom`). Each size was read from the pinned
 * oracle jar rendering that formula ALONE (`scripts/oracle-render.sh`): the
 * jar's JVM shares symbol state across the formulas of one run.
 */
const JAR_STACKS: readonly (readonly [string, number, number])[] = [
  ['\\stackrel{{3}}{=}', 24, 26],
  ['{\\stackrel{{{3}}}{{=}}}', 24, 26],
  ['\\stackrel{\\sim}{=}', 24, 22],
  ['\\stackrel{\\frown}{{{A}{B}}}', 40, 31],
  ['{\\stackrel{\\text{def}}{=}}{\\quad\\text{or}\\quad}{\\stackrel{{\\Delta}}{{=}}}', 122, 29],
  ['{\\overset{{{k}}}{{=}}}', 24, 26],
  ['{\\underset{{{k}}}{{=}}}', 24, 34],
  // An empty argument is an `EmptyAtom`, so each space still counts:
  // `\stackrel` always has an (empty) under part, `\underset`'s 0.5 is in em.
  ['{\\stackrel{}{}}', 8, 12],
  ['{\\underset{}{}}', 8, 18],
  ['{a}\\\\{b}', 19, 40],
  ['{a}^{{2}}\\\\{a}^{{3}}', 27, 52],
];

describe('measureTeXIcon: stacks and formula-level newlines', () => {
  it.each(JAR_STACKS)('%s is %i x %i', (tex, width, height) => {
    expect(measureTeXIcon(tex)).toEqual({ width, height, unsupported: [] });
  });

  it('keeps the rows of a three-row newline apart by one interline each', () => {
    const two = measureTeXIcon('{a}\\\\{b}');
    const three = measureTeXIcon('{a}\\\\{b}\\\\{c}');
    expect(three.width).toBe(two.width);
    expect(three.height).toBeGreaterThan(two.height);
  });

  it('drops an empty row (`VRowAtom#append(null)`)', () => {
    expect(measureTeXIcon('{a}\\\\\\\\{b}')).toEqual(measureTeXIcon('{a}\\\\{b}'));
  });

  it('sizes a one-script mclass that is not a stack macro as an ordinary typed atom', () => {
    const size = measureTeXIcon('\\mathrel{x}');
    expect(size.unsupported).toEqual([]);
    expect(size.width).toBeGreaterThan(0);
  });
});
