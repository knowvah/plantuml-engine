import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T4b, text reads against the jar's `in.svg`:
 * - a `<sup>`/`<sub>` run's baseline: `Sea` positions the atom from its UNMUTED metrics (`creole-sea-line.ts`'s
 *   `dy` contract), so the descent term is the unmuted size over 4.5, not the muted one
 *   (`FontConfiguration.java:98-104` mutes by 3; `AtomText.java:321-323`).
 * - a link label's ink: `TextBlockMarged#drawU` draws the margin box AND the text (`TextBlockMarged.java:79-87`),
 *   and `LimitFinder#drawText` (`LimitFinder.java:217-224`) reaches `baseline - (height - 1.5)`, above a
 *   1px-marged 13px block; `SvekResult.java:131-135` moves the drawing by that min.
 * - a multi-line `title` body keeps its relative indentation (`CommandMultilinesTitle.java:75-77`
 *   `removeEmptyColumns`), so `StripeTree#computeLevel` (`StripeTree.java:68-82`) sees `  \t|_` as level 3.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function diffs(slug: string): unknown[] {
  return compareSvg(render(slug), readFileSync(`${CACHE}/${slug}/in.svg`, 'utf8'), 'deterministic').diffs;
}

describe('stdd T4b: text', () => {
  it('exposant-03 / juvagu-33: a sub/sup baseline is 3/4.5 above the muted-size reconstruction', () => {
    expect(render('exposant-03-state')).toMatch(/<text x="22.15" y="129.556" [^>]*font-size="11"/);
    expect(diffs('exposant-03-state')).toEqual([]);
    expect(diffs('juvagu-33-dupa212')).toEqual([]);
  });

  it('lurage-50: a wrapped label at the top shifts the drawing by its text ink, 0.389 for 13px', () => {
    expect(render('lurage-50-kobo763')).toMatch(/<rect x="7" y="38.389" /);
    expect(diffs('lurage-50-kobo763')).toEqual([]);
  });

  it('guligu-53 / zinupo-20: a `|_` tree in a title keeps its nesting', () => {
    expect(render('guligu-53-cufe221')).toMatch(/<text x="42.137" [^>]*>prop1<\/text>/);
    expect(diffs('guligu-53-cufe221')).toEqual([]);
    expect(diffs('zinupo-20-vuma863')).toEqual([]);
  });
});
