/**
 * c4dd T2a: a chrome box's `RoundCorner` under `skinparam roundcorner`, against the jar. The last declaration wins
 * whichever selector it names: `FromSkinparamToStyle.java:164,169,175`.
 */
import { describe, expect, it } from 'vitest';

import { defaultTheme } from '../../src/core/theme.js';
import { resolveAnnotationStyles } from '../../src/core/annotations/style.js';
import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/c4dd-T2a';
const names = jarFixtureNames(DIR);

/** The `rx` of each chrome rect of a fixture's render. */
function roundedRects(name: string): readonly string[] {
  return [...renderJarFixture(DIR, name).matchAll(/<rect[^>]*?\brx="([^"]*)"/g)].map((m) => m[1]!);
}

describe('chrome corners against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(15);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('a legend with no roundcorner keeps the skin value', () => {
    expect(roundedRects('no-roundcorner')).toEqual(['7.5']);
  });

  it('the later of roundcorner and legendBorderRoundCorner wins', () => {
    expect(roundedRects('roundcorner-then-legend')).toEqual(['1.5']);
    expect(roundedRects('legend-then-roundcorner')).toEqual(['4']);
  });
});

describe('resolveAnnotationStyles with a bare skinparam map', () => {
  it('answers roundcorner for every element that has no border of its own', () => {
    const styles = resolveAnnotationStyles(defaultTheme, new Map([['roundcorner', '8']]), new Map());
    expect(styles.title.roundCorner).toBe(8);
    expect(styles.legend.roundCorner).toBe(8);
    expect(styles.mainframe.roundCorner).toBe(8);
  });

  it('leaves the skin value alone with no roundcorner', () => {
    expect(resolveAnnotationStyles(defaultTheme, new Map(), new Map()).legend.roundCorner).toBe(15);
  });

  it('keeps the overlay for a <style> the parser rejects', () => {
    const source = {
      skinparam: new Map([['roundcorner', '8']]),
      styles: ['legend { { } }'],
    };
    expect(resolveAnnotationStyles(defaultTheme, source, new Map()).legend.roundCorner).toBe(15);
  });
});
