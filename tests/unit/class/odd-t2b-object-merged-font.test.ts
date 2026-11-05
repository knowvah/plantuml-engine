/**
 * odd T2b: `objectAttributeFont*` converts onto `SName.object` (`FromSkinparamToStyle.java:200-202`), and the merged
 * style answers `LineThickness` and `RoundCorner` too, never the class tiers. A header split draws `halfRounded`, whose
 * `UPath` reaches `x + w` in the ink (`URectangle.java:123-135`, `LimitFinder.java:164-167`).
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T2b';
const names = jarFixtureNames(DIR);

describe('object attribute fonts and header split ink against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(20);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('the later of objectFontSize and objectAttributeFontSize wins', () => {
    expect(renderJarFixture(DIR, 'attr-then-font')).toContain('font-size="16"');
    expect(renderJarFixture(DIR, 'font-then-attr')).toContain('font-size="11"');
  });

  it('a gradient on an empty object reaches one pixel further than a flat fill', () => {
    const width = (name: string) => /viewBox="0 0 (\d+)/.exec(renderJarFixture(DIR, name))![1];
    expect(width('grad2')).toBe('100');
  });

  it('a square header split draws a rect, not a path', () => {
    expect(renderJarFixture(DIR, 'grad-square')).not.toContain('<path d="M7');
  });
});
