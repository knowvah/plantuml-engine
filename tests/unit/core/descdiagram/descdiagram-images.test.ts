/**
 * dei-T4b/T4c: the core Problem Frames images. Expected values are the jar's: `rukitu-26-seme622` (dot-cache unknown),
 * `oracle/goldens/svg-description/component/dei-domain-each` and `dei-requirement`.
 */
import { describe, expect, it } from 'vitest';
import { FontStyle, type FontConfiguration } from '../../../../src/core/klimt/shape/UText.js';
import { UStroke } from '../../../../src/core/klimt/UStroke.js';
import { UFontFactory } from '../../../../src/core/klimt/font/UFontFactory.js';
import { loadSkin } from '../../../../src/core/style/StyleLoader.js';
import { ShapeType } from '../../../../src/core/svek/ShapeType.js';
import { EntityImageDomain } from '../../../../src/core/descdiagram/EntityImageDomain.js';
import { EntityImageMachine } from '../../../../src/core/descdiagram/EntityImageMachine.js';
import { EntityImageDesignedDomain } from '../../../../src/core/descdiagram/EntityImageDesignedDomain.js';
import {
  EntityImageRequirement,
  REQUIREMENT_STYLE_SIGNATURE,
} from '../../../../src/core/descdiagram/EntityImageRequirement.js';
import { boxedGlyphPath, isBoxedCharacterFont } from '../../../../src/core/descdiagram/boxed-glyph-data.js';
import type { DescdiagramBoxParams } from '../../../../src/core/descdiagram/descdiagram-common.js';
import { drawnBody } from '../../../helpers/chen-leaf-images.js';
import { testStringBounder } from '../../../helpers/legacy-leaf-images.js';

const FONT_12: FontConfiguration = { family: 'sans-serif', size: 12, color: '#000000', styles: new Set() };
const FONT_12_ITALIC: FontConfiguration = { ...FONT_12, styles: new Set([FontStyle.ITALIC]) };

function box(display: string, stereoLabels: readonly string[] | undefined): DescdiagramBoxParams {
  return {
    display,
    stereoLabels,
    nameFont: FONT_12,
    stereoFont: FONT_12_ITALIC,
    borderColor: '#000000',
    backColor: '#FFFFFF',
    stroke: UStroke.withThickness(1.5),
  };
}

describe('EntityImageDomain (EntityImageDomain.java:71-170, BoxedCharacter.java:69-95)', () => {
  const google = new EntityImageDomain({ ...box('Google Map', ['«Causal»']), letter: 'C', tagBackColor: undefined });

  it("sizes rukitu's Google Map: the title over the 16px tag, 69.325 x 44", () => {
    const dim = google.calculateDimension(testStringBounder());
    expect(dim.getWidth()).toBeCloseTo(69.325, 3);
    expect(dim.getHeight()).toBe(44);
    expect(google.getShapeType()).toBe(ShapeType.RECTANGLE);
  });

  it('draws the box, the name, and the tag square with its captured C, as the jar does', () => {
    const svg = drawnBody(38.19, 94, (ug) => google.drawU(ug));
    expect(svg).toContain(
      '<rect x="38.19" y="94" width="69.325" height="44" fill="#FFF" style="stroke:#000;stroke-width:1.5;"/>',
    );
    expect(svg).toContain(
      '<text x="40.19" y="111.333" fill="#000" font-size="12" textLength="65.325">Google Map</text>',
    );
    expect(svg).toContain(
      '<rect x="91.515" y="122" width="16" height="16" fill="none" style="stroke:#000;stroke-width:1;"/>',
    );
    // rukitu's own C. The capture was taken at another box, so a coordinate may differ in the 3rd decimal (the
    // AWT float behind it is not recoverable), within compareSvg's deterministic tolerance.
    const oracle = 'M99.599,134.717 Q97.577,134.717 96.476,133.53 Q95.374,132.344 95.374,130.17';
    const drawn = /<path d="([^"]+)" fill="#000"\/>/.exec(svg)![1]!;
    const nums = (d: string): number[] => (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    nums(oracle).forEach((n, i) => expect(Math.abs(nums(drawn)[i]! - n)).toBeLessThan(0.0015));
    expect(svg).not.toContain('<g ');
  });

  it('draws no glyph for a letter with no capture', () => {
    const svg = drawnBody(0, 0, (ug) =>
      new EntityImageDomain({ ...box('Q', ['«Q»']), letter: 'Q', tagBackColor: undefined }).drawU(ug),
    );
    expect(svg).toContain('width="16" height="16"');
    expect(svg).not.toContain('<path');
  });

  it('fills the tag with the stereotype colour when it has one', () => {
    const svg = drawnBody(0, 0, (ug) =>
      new EntityImageDomain({ ...box('A', ['«Lexical»']), letter: 'X', tagBackColor: '#FF0000' }).drawU(ug),
    );
    expect(svg).toMatch(/width="16" height="16" fill="#F00"/);
  });
});

describe('boxed-glyph-data (decisions D4, amended 2026-11-16)', () => {
  it('keys the captures to BoxedCharacter’s font: UFontFactory.byDefault(8) is sansSerif(12)', () => {
    expect(isBoxedCharacterFont(UFontFactory.byDefault(8))).toBe(true);
    expect(isBoxedCharacterFont(UFontFactory.sansSerif(8))).toBe(false);
    expect(isBoxedCharacterFont(UFontFactory.monospace(12))).toBe(false);
  });

  it.each([
    ['P', 46.025, 43, 'M43.644,47.5 L43.644,38.828'],
    ['X', 339.775, 43, 'M335.869,47.5 L338.746,43.146'],
    ['C', 49.775, 147, 'M49.859,151.717 Q47.838,151.717'],
    ['B', 144.46, 147, 'M142.079,151.5 L142.079,142.828'],
  ])('replays %s at the dei-domain-each box centre', (letter, cx, cy, head) => {
    expect(boxedGlyphPath(letter, cx, cy)!.startsWith(head)).toBe(true);
  });

  it('answers undefined for a letter it never captured', () => {
    expect(boxedGlyphPath('Z', 0, 0)).toBeUndefined();
  });
});

describe('EntityImageMachine and EntityImageDesignedDomain (dei-domain-each)', () => {
  it('a machine is the title + 10 wide, with a 4px box 4px in and the title 5px right', () => {
    const img = new EntityImageMachine(box('Mach', ['«Machine»']));
    expect(img.calculateDimension(testStringBounder()).getWidth()).toBeCloseTo(68.725, 3);
    const svg = drawnBody(89.02, 15, (ug) => img.drawU(ug));
    expect(svg).toContain(
      '<rect x="89.02" y="15" width="68.725" height="28" fill="#FFF" style="stroke:#000;stroke-width:1.5;"/>',
    );
    expect(svg).toContain(
      '<rect x="93.02" y="15" width="4" height="28" fill="#FFF" style="stroke:#000;stroke-width:1.5;"/>',
    );
    expect(svg).toContain('<text x="113.72" y="32.333" fill="#000" font-size="12" textLength="29.325">Mach</text>');
    expect(img.getShapeType()).toBe(ShapeType.RECTANGLE);
  });

  it('a designed domain is the title + 5 wide, with a 4px box at its corner and the title 4px right', () => {
    const img = new EntityImageDesignedDomain(box('Des', ['«Designed»']));
    expect(img.calculateDimension(testStringBounder()).getWidth()).toBeCloseTo(69.125, 3);
    const svg = drawnBody(192.83, 15, (ug) => img.drawU(ug));
    expect(svg).toContain(
      '<rect x="192.83" y="15" width="4" height="28" fill="#FFF" style="stroke:#000;stroke-width:1.5;"/>',
    );
    expect(svg).toContain('<text x="220.705" y="32.333" fill="#000" font-size="12" textLength="21.375">Des</text>');
  });

  it('both are stencils from 0 to their width', () => {
    const img = new EntityImageMachine(box('Mach', undefined));
    const width = img.calculateDimension(testStringBounder()).getWidth();
    expect([img.getStartingX(testStringBounder(), 3), img.getEndingX(testStringBounder(), 3)]).toEqual([0, width]);
    const des = new EntityImageDesignedDomain(box('Des', undefined));
    expect(des.getStartingX(testStringBounder(), 3)).toBe(0);
    expect(des.getEndingX(testStringBounder(), 3)).toBe(des.calculateDimension(testStringBounder()).getWidth());
  });
});

describe('EntityImageRequirement (EntityImageRequirement.java:77-149)', () => {
  const style = REQUIREMENT_STYLE_SIGNATURE.getMergedStyle(loadSkin('plantuml.skin'))!;
  const params = {
    display: 'Top need',
    stereoLabel: undefined,
    style,
    stereoFont: FONT_12_ITALIC,
    lineColor: '#000000',
    backColor: '#FFFFFF',
  };

  it("draws dei-requirement's Top need: a dashed fitted ellipse around the 14pt text", () => {
    const img = new EntityImageRequirement(params);
    expect(img.getShapeType()).toBe(ShapeType.OVAL);
    const dim = img.calculateDimension(testStringBounder());
    const svg = drawnBody(77.996 - dim.getWidth() / 2, 19.167 - dim.getHeight() / 2, (ug) => img.drawU(ug));
    expect(svg).toContain(
      '<ellipse cx="77.996" cy="19.167" rx="53.836" ry="13.167" fill="#FFF" style="stroke:#000;stroke-width:1.5;stroke-dasharray:7,7;"/>',
    );
    // The corner above is computed from the dimension, so the baseline may differ from the jar's 21.862 in the 3rd
    // decimal; the layout places the real node at the jar's corner (dei-requirement, measured in dei-domain.test.ts).
    const y = Number(/<text x="45.421" y="([\d.]+)"[^>]*textLength="59.15">Top need</.exec(svg)![1]);
    expect(y).toBeCloseTo(21.862, 2);
  });

  it('puts the stereotype label over the text, and takes an explicit border stroke', () => {
    const img = new EntityImageRequirement({ ...params, stereoLabel: '«FR»', stroke: UStroke.withThickness(2) });
    const svg = drawnBody(0, 0, (ug) => img.drawU(ug));
    expect(svg).toContain('font-style="italic">«FR»</text>');
    expect(svg).toContain('stroke-width:2;');
    expect(svg).not.toContain('dasharray');
  });
});
