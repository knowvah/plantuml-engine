/**
 * odd T3b: `BodierMap#getBody` hands `style.wrapWidth()` to every cell (`BodierMap.java:104`,
 * `TextBlockMap.java:176-178`), with the stereotype's merged style, and a whole cell block draws before its neighbour.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T3b';
const names = jarFixtureNames(DIR);

describe('map cell wrap against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(8);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('wraps only the stereotype that carries the width', () => {
    const heights = [...renderJarFixture(DIR, 'stereo-width').matchAll(/<rect[^>]*height="([\d.]+)"/g)].map(
      (m) => m[1],
    );
    expect(heights).toEqual(['104', '36']);
  });
});
