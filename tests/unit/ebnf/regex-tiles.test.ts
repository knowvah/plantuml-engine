import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { fore } from '../../../src/diagrams/ebnf/ebnf-klimt.js';
import type { ETile } from '../../../src/diagrams/ebnf/ETile.js';
import { ETileAlternation } from '../../../src/diagrams/ebnf/ETileAlternation.js';
import { ETileLookAheadOrBehind } from '../../../src/diagrams/ebnf/ETileLookAheadOrBehind.js';
import { ETileNamedGroup } from '../../../src/diagrams/ebnf/ETileNamedGroup.js';
import { ETileOptional } from '../../../src/diagrams/ebnf/ETileOptional.js';
import { ETileRegexGroup } from '../../../src/diagrams/ebnf/ETileRegexGroup.js';
import { ETileRegexGroupAllBut } from '../../../src/diagrams/ebnf/ETileRegexGroupAllBut.js';
import { Symbol } from '../../../src/diagrams/ebnf/Symbol.js';
import { body, BOUNDER, box, ebnfSkinParam, ebnfStyle, newGraphic } from './helpers.js';
import {
  ALL_BUT_FAPORU,
  LOOKAHEAD_CECAVE,
  LOOKBEHIND_VUNUMO,
  NAMED_GROUP_TUBEPU,
  REGEX_GROUP_TOPAMU,
} from './regex-oracle-snippets.js';

const skinParam = ebnfSkinParam();
const { style, fc } = ebnfStyle(skinParam);
const colorSet = skinParam.getIHtmlColorSet();
const lineColor = style.value('LineColor').asColor(colorSet);

/** The tiles' x is the unrounded 15 + 19.3625 (box `A`) + 20 that the SVG prints as 54.363. The regex engine draws its tiles in the line colour at stroke 1 (the oracle's `stroke-width:1`). */
function draw(tile: ETile, x: number, y: number): string {
  const ug = newGraphic();
  tile.drawU(ug.apply(fore(lineColor)).apply(new UTranslate(x, y)));
  return body(ug);
}

describe('regex-only tiles against the jar (eep D4)', () => {
  it('ETileNamedGroup: tubepu-44-gigu535 `A(?<tld>BCD)Z`', () => {
    const tile = new ETileNamedGroup(box('BCD', Symbol.TERMINAL_STRING1), fc, colorSet, skinParam, 'tld');
    expect(tile.calculateDimension(BOUNDER).getWidth()).toBeCloseTo(59.663, 3);
    expect(tile.calculateDimension(BOUNDER).getHeight()).toBe(44);
    expect(draw(tile, 54.3625, 15)).toBe(NAMED_GROUP_TUBEPU);
  });

  it('ETileLookAheadOrBehind: cecave-79-napo327 `(?=abc)` and vunumo-43-buli848 `(?<=abc)`', () => {
    const ahead = new ETileLookAheadOrBehind(box('abc', Symbol.TERMINAL_STRING1), fc, style, colorSet, '?=');
    expect(draw(ahead, 54.3625, 15)).toBe(LOOKAHEAD_CECAVE);
    const behind = new ETileLookAheadOrBehind(box('abc', Symbol.TERMINAL_STRING1), fc, style, colorSet, '?<=');
    expect(draw(behind, 54.3625, 15)).toBe(LOOKBEHIND_VUNUMO);
  });

  it('ETileRegexGroup: topamu-99-rasu015 `A[B]C`', () => {
    const tile = new ETileRegexGroup(['B'], fc, style, colorSet, skinParam);
    expect(tile.getH1(BOUNDER)).toBe(7);
    expect(draw(tile, 54.3625, 20)).toBe(REGEX_GROUP_TOPAMU);
  });

  it('ETileRegexGroupAllBut: faporu-75-biso094 `[^\\s%g{}\\[\\]]`, rules as wide as the first list', () => {
    const tile = new ETileRegexGroupAllBut(['^', '\\s', '%', 'g', '{', '}', '[', ']'], fc, style, colorSet, skinParam);
    expect(tile.getH1(BOUNDER)).toBe(49);
    expect(draw(tile, 30, 27)).toBe(ALL_BUT_FAPORU);
    expect(() => new ETileRegexGroupAllBut([], fc, style, colorSet, skinParam)).toThrow('IndexOutOfBoundsException');
  });

  it('ETileRegexGroup with several elements, narrower than a wider sibling, rules between and side arrows', () => {
    const tile = new ETileRegexGroup(['a', 'b'], fc, style, colorSet, skinParam);
    expect(tile.getH1(BOUNDER)).toBe(14);
    const svg = draw(tile, 0, 0);
    expect(svg).toContain('stroke-width:0.3;');
    expect(svg.match(/<text/g)).toHaveLength(2);
  });

  it('push on every regex tile throws', () => {
    const leaf = box('x', Symbol.TERMINAL_STRING1);
    for (const tile of [
      new ETileNamedGroup(leaf, fc, colorSet, skinParam, 'n'),
      new ETileLookAheadOrBehind(leaf, fc, style, colorSet, '?='),
      new ETileRegexGroup(['x'], fc, style, colorSet, skinParam),
      new ETileRegexGroupAllBut(['^', 'x'], fc, style, colorSet, skinParam),
      new ETileOptional(leaf, skinParam),
    ])
      expect(() => tile.push(leaf)).toThrow('UnsupportedOperationException');
  });
});

// ETileOptional is `@Deprecated` and constructed nowhere in upstream (no `new ETileOptional(`), so no jar output
// can draw it. Its expected values are the Java formulas (ETileOptional.java:71-136), not an oracle.
describe('ETileOptional (ETileOptional.java:52-168, no jar caller)', () => {
  it('over a box: 15 each side, the bypass 16 above the track', () => {
    const leaf = box('x', Symbol.TERMINAL_STRING1);
    const tile = new ETileOptional(leaf, skinParam);
    expect(tile.getWidth(BOUNDER)).toBe(leaf.getWidth(BOUNDER) + 30);
    expect(tile.getH1(BOUNDER)).toBe(16 + 12);
    expect(tile.getH2(BOUNDER)).toBe(12);
    const svg = draw(tile, 0, 0);
    // posYoptionalLine = 16 - 11 = 5; corner 8: the bypass runs from 16 to width - 16.
    expect(svg).toContain(`<line x1="16" y1="5" x2="${tile.getWidth(BOUNDER) - 16}" y2="5"`);
  });

  it('over an alternation: no side margin, corners of 12, and notes above and below', () => {
    const alt = new ETileAlternation();
    alt.push(box('b', Symbol.TERMINAL_STRING1));
    alt.push(box('a', Symbol.TERMINAL_STRING1));
    const tile = new ETileOptional(alt, skinParam);
    expect(tile.getWidth(BOUNDER)).toBe(alt.getWidth(BOUNDER));
    tile.addCommentAbove('up');
    tile.addCommentBelow('down');
    expect(tile.getH1(BOUNDER)).toBe(16 + 12 + 23 + 10);
    expect(tile.getH2(BOUNDER)).toBe(alt.getH2(BOUNDER) + 23 + 10);
    const svg = draw(tile, 0, 0);
    expect(svg).toContain('>up</text>');
    expect(svg).toContain('>down</text>');
  });
});
