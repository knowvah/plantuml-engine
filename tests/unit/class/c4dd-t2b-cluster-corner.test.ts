/**
 * c4dd T2b: a class or object group's `RoundCorner` off the merged style, against the jar: `Cluster.java:321-324` for
 * a group, `EntityImageEmptyPackage.java:88,104` for an empty one.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/c4dd-T2b';
const names = jarFixtureNames(DIR);

/** Each folder arc radius of a fixture's render, once. */
function arcRadii(name: string): readonly string[] {
  return [...new Set([...renderJarFixture(DIR, name).matchAll(/ A([\d.]+),/g)].map((m) => m[1]!))];
}

describe('group corners against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(18);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('a package draws roundcorner 8 as arcs of 4 and 6', () => {
    expect(arcRadii('class-package')).toEqual(['6', '4']);
  });

  it('an empty package ignores `group { RoundCorner }`, which the jar reads only on a group', () => {
    expect(arcRadii('class-style-group')).toEqual(['6.75', '4.5', '3.75', '2.5']);
  });
});
