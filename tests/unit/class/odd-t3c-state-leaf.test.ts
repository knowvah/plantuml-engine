/**
 * odd T3c: a `state` leaf under `allow_mixing` is `LeafType.STATE` (`CommandCreateElementFull2.java:239-241`), and
 * `GeneralImageBuilder.java:130-143` hands it the state engine's image, not a class box.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T3c';
const names = jarFixtureNames(DIR).filter((name) => name !== 'composite');

describe('a state leaf against the jar', () => {
  it('collects every drawn fixture with an oracle', () => {
    expect(names.length).toBe(11);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('draws a rounded box with no circle', () => {
    const svg = renderJarFixture(DIR, 'plain');
    expect(svg).toContain('rx="12.5"');
    expect(svg.match(/<ellipse/g)).toHaveLength(1);
  });

  it('refuses a state body as the syntax error the jar reports at that line', () => {
    const svg = renderJarFixture(DIR, 'composite');
    expect(svg).toContain('(line 3) ]');
    expect(svg).toContain('Syntax Error? (Assumed diagram type: class)');
  });
});
