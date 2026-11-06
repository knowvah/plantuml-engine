/**
 * odd T2a: an object, map or json image reads `getStyle()` and `getStyleHeader()` from the one builder, with its
 * stereotype (`EntityImageObject.java:127-135`), so a bare `header { }` and `skinparam object { <<Foo>> { } }` reach it.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T2a';
const names = jarFixtureNames(DIR);

describe('merged object style against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(8);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('a bare header style draws the header split and the red name on all three kinds', () => {
    const svg = renderJarFixture(DIR, 'bare-header');
    expect(svg.match(/fill="#98FB98"/g)).toHaveLength(3);
    expect(svg.match(/fill="#F00"/g)).toHaveLength(3);
  });

  it('an inline back colour draws no header split', () => {
    expect(renderJarFixture(DIR, 'inline-back')).not.toContain('#98FB98');
  });

  it('the later of a bare header and a nested one wins the property both name', () => {
    expect(renderJarFixture(DIR, 'nested-then-bare')).toContain('fill="#00F"');
    expect(renderJarFixture(DIR, 'bare-then-nested')).toContain('fill="#F00"');
  });
});
