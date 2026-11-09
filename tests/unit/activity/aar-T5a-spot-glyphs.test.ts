/**
 * aar-T5a (item 13): every `(X)` letter and digit draws the jar's outline, as written (no case folding).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/command/CommandCircleSpot3.java:61
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/activitydiagram3/ftile/vertical/FtileCircleSpot.java:111
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/DriverCenteredCharacterSvg.java:72-81
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { spotGlyphPath } from '../../../src/diagrams/activity/activity-spot-glyph.js';

/** The first spot's centre and glyph `d` in an authored oracle. */
function oracleSpot(name: string): { cx: number; cy: number; d: string } {
  const svg = readFileSync(`tests/fixtures/diagram-style-scope/activity__${name}.svg`, 'utf8');
  const m = /<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="10" ry="10"[^>]*\/><path d="([^"]+)"/.exec(svg)!;
  return { cx: Number(m[1]), cy: Number(m[2]), d: m[3]! };
}

describe('spotGlyphPath', () => {
  for (const [name, letter] of [
    ['spot-C', 'C'],
    ['spot-7', '7'],
    ['spot-lq', 'q'],
  ] as const) {
    it(`${name}: reproduces the oracle's outline at its own centre`, () => {
      const { cx, cy, d } = oracleSpot(name);
      expect(spotGlyphPath(letter, cx, cy)).toBe(d);
    });
  }

  it('a lowercase letter is not folded onto its capital', () => {
    const { cx, cy } = oracleSpot('spot-lq');
    expect(spotGlyphPath('q', cx, cy)).not.toBe(spotGlyphPath('Q', cx, cy));
  });
});
