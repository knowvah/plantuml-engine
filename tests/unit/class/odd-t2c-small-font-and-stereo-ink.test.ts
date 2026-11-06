/**
 * odd T2c: an object, map or json name is an `AtomText`, 10 tall at least (`AtomText.java:179-181`), with its baseline
 * off the font's own height; and a stereotype line's text is ink, `y -= dim.getHeight() - 1.5` (`LimitFinder.java:220`),
 * so a 12 px one clears the rect's `y - 1` by 0.167.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T2c';
const names = jarFixtureNames(DIR);

describe('small fonts and stereotype ink against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(31);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('a name below size 10 sizes the box as a 10 px name, its baseline unmoved', () => {
    const svg = renderJarFixture(DIR, 'map-6');
    expect(svg).toContain('height="28"');
    expect(svg).toContain('y="13.667"');
  });

  it('a stereotype pushes the first box to y 7.167', () => {
    expect(renderJarFixture(DIR, 'object-8-stereo')).toContain('y="7.167"');
  });
});
