/**
 * c4dd T3a: a creole table's `<#back,#line>` resolves through `HColorSet#parseColor` (`StripeTable.java:113`,
 * `HColorSet.java:58-63,78-92`): `transparent` and `background` are `HColors.none()`, an unknown name is white.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/c4dd-T3a';
const names = jarFixtureNames(DIR);

describe('creole table colours against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(7);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('an unknown colour still falls to white', () => {
    expect(renderJarFixture(DIR, 'garbage')).toContain('fill="#FFF"');
  });

  it('transparent draws no fill and no stroke width', () => {
    const svg = renderJarFixture(DIR, 'both');
    expect(svg).toContain('fill="none"');
    expect(svg).not.toContain('stroke:none;stroke-width');
  });
});
