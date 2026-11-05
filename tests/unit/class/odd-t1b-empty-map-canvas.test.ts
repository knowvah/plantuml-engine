/**
 * odd T1b: `TextBlockMap#drawU`'s row loop is what reaches `x + w`; a map with no rows bounds at its rect's `x + w - 1`
 * (`LimitFinder.java:184-188`). An empty json body's bottom is the same rect's `y + h - 1`.
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T1b';
const names = jarFixtureNames(DIR);

/** The root's `width` and `height`. */
function canvas(name: string): readonly string[] {
  const root = /<svg[^>]*?\bwidth="(\d+)px" height="(\d+)px"/.exec(renderJarFixture(DIR, name));
  return [root![1]!, root![2]!];
}

describe('an empty map or json against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(12);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('a map beside an empty one reaches its own hline, whichever side', () => {
    expect(canvas('empty-beside-row')).toEqual(canvas('row-beside-empty'));
  });

  it('an empty json beside a map bounds the canvas at its rect', () => {
    expect(canvas('json-empty')).toEqual(['131', '52']);
  });
});
