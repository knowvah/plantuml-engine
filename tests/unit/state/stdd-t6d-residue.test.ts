import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T6d, the residue: a creole `* item` list in a state description. `StripeStyle#getHeader` makes a `Bullet`
 * for a `LIST_WITHOUT_NUMBER` stripe (`StripeStyle.java:60-61`) and `StripeSimple` puts it first among the stripe's
 * atoms (`StripeSimple.java:118-121`); `Fission#getSplitted` keeps it on the first wrapped line and gives the others
 * a blank of the same width (`Fission.java:69,87`). `Bullet#calculateDimensionSlow` is (12, 5) at order 0
 * (`Bullet.java:57-62`), `getStartingAltitude` -5 (`:72-75`), `drawU` a 5x5 ellipse 3 px in, in the font colour,
 * stroke thickness 0 (`:63-71`). The flat creole seam (`creole-text-lines.ts`) now carries that header.
 * `tests/fixtures/stdd-T6d/leaf-bullet.svg` is a `scripts/oracle-render.sh` render.
 */

const CACHE = 'test-results/dot-cache/state';
const FIXTURES = 'tests/fixtures/stdd-T6d';
const measurer = new DeterministicMeasurer();

function render(puml: string): string {
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function diffsAgainst(puml: string, jar: string): { ours: string; diffs: unknown[] } {
  const ours = render(puml);
  return { ours, diffs: compareSvg(ours, jar, 'deterministic').diffs };
}

describe('stdd T6d: a creole bullet list in a state description', () => {
  it('draws the Bullet header of a composite description (gopudo-91)', () => {
    const { ours, diffs } = diffsAgainst(
      readFileSync(`${CACHE}/gopudo-91-bego999/in.puml`, 'utf8'),
      readFileSync(`${CACHE}/gopudo-91-bego999/in.svg`, 'utf8'),
    );
    expect(ours).toContain('<ellipse cx="17.5" cy="35" rx="2.5" ry="2.5" fill="#000"/>');
    expect(ours).toMatch(/<text x="24" y="39.389" [^>]*>a list</);
    expect(diffs).toEqual([]);
  });

  it('indents a leaf description by the 12 px bullet and widens the box (authored fixture)', () => {
    const { ours, diffs } = diffsAgainst(
      readFileSync(`${FIXTURES}/leaf-bullet.puml`, 'utf8'),
      readFileSync(`${FIXTURES}/leaf-bullet.svg`, 'utf8'),
    );
    expect(ours).toMatch(/<rect x="7" y="7" width="60.788" height="62"/);
    expect(ours).toContain('<ellipse cx="17.5" cy="42.5" rx="2.5" ry="2.5" fill="#000"/>');
    expect(diffs).toEqual([]);
  });
});
