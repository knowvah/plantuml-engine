/**
 * odd T3d: a map cell is `Display.getWithNewlines(...).create0(...)` (`TextBlockMap.java:176-178`), so it splits on `\n`
 * and `%breakline()`, and `CreoleParser#createSheetSlow` (`CreoleParser.java:148-156`) takes `{{` through `}}` as one
 * `EmbeddedDiagram` stripe, sized as the nested document (`EmbeddedDiagram.java:129-133`).
 */
import { describe, expect, it } from 'vitest';

import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T3d';
const names = jarFixtureNames(DIR);

describe('an embedded map cell against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(9);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('draws the embed as an image, not its source', () => {
    const svg = renderJarFixture(DIR, 'value-seq');
    expect(svg).toContain('<image');
    expect(svg).not.toContain('{{');
  });

  it('keeps a scaled embed at its fractional size', () => {
    expect(renderJarFixture(DIR, 'scaled')).toMatch(/<image[^>]*width="115\.5"/);
  });
});
