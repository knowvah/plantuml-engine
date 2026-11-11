import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AsciiMath } from '../../../src/core/math/AsciiMath.js';
import { batikColorName, mathDocument } from '../../../src/core/math/math-document.js';
import type { AwtColor } from '../../../src/core/math/math-document.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

const BLACK: AwtColor = { r: 0, g: 0, b: 0, a: 255 };
const WHITE: AwtColor = { r: 255, g: 255, b: 255, a: 255 };
const YELLOW: AwtColor = { r: 255, g: 255, b: 0, a: 255 };

function oracle(slug: string): string {
  return readFileSync(new URL(`${slug}/in.svg`, CORPUS), 'utf8');
}

/** The jar document's bytes up to the glyph group, which is JLaTeXMath's (D4). */
function envelopeOf(svg: string): string {
  return svg.slice(0, svg.indexOf('<g transform='));
}

describe('mathDocument', () => {
  const tex = new AsciiMath('g_1(x,p)= f_12^u(X+1,sqrt2)-f_1^u*X').getSource();
  const doc = mathDocument(tex, BLACK, YELLOW);

  it('reproduces Batik envelope bytes up to the glyph group (caruta-83-deta919)', () => {
    const jar = oracle('caruta-83-deta919');
    expect(doc.startsWith(envelopeOf(jar))).toBe(true);
    expect(doc.endsWith('\n  ></g\n></svg\n>\n')).toBe(true);
    expect(jar.endsWith('\n  ></g\n></svg\n>\n')).toBe(true);
  });

  it('sizes the root by TeXIcon: 319 x 44 (caruta-83-deta919)', () => {
    expect(doc).toContain('width="319" height="44" xmlns=');
  });

  it('differs from the jar only below the root: the root and its style string match', () => {
    const { diffs } = compareSvg(doc, oracle('caruta-83-deta919'), 'deterministic');
    // The comparator folds the paint group into the glyph group, so the glyph
    // group's paths (27 children) meet our KaTeX body there.
    expect(diffs.length).toBeGreaterThan(0);
    for (const d of diffs) expect(d.path).toMatch(/^svg\/g\[1\]/);
  });

  it('names an opaque hex colour rgb(r,g,b) (cov-math-back) and Batik names as words', () => {
    expect(batikColorName({ r: 170, g: 187, b: 204, a: 255 })).toBe('rgb(170,187,204)');
    expect(batikColorName(WHITE)).toBe('white');
    expect(batikColorName({ r: 0, g: 255, b: 255, a: 255 })).toBe('aqua');
    expect(batikColorName({ r: 128, g: 128, b: 128, a: 255 })).toBe('gray');
    expect(batikColorName({ r: 255, g: 255, b: 255, a: 0 })).toBe('rgb(255,255,255)');
  });

  it('writes the background paint group as Batik does, opacities included', () => {
    expect(mathDocument('x^2', BLACK, { r: 170, g: 187, b: 204, a: 255 })).toContain(
      '<g style="fill:rgb(170,187,204); stroke:rgb(170,187,204);"\n    ><rect x="0" width="27" height="26" y="0" style="stroke:none;"\n    /></g\n',
    );
    expect(mathDocument('x^2', BLACK, { r: 0, g: 0, b: 0, a: 0 })).toContain(
      '<g style="fill:rgb(0,0,0); fill-opacity:0; stroke-opacity:0; stroke:rgb(0,0,0);"',
    );
    expect(mathDocument('x', BLACK, { r: 255, g: 0, b: 0, a: 128 })).toContain(
      'fill:rgb(255,0,0); fill-opacity:0.502; stroke-opacity:0.502; stroke:rgb(255,0,0);',
    );
    expect(mathDocument('x', BLACK, { r: 0, g: 128, b: 128, a: 51 })).toContain(
      'fill-opacity:0.2; stroke-opacity:0.2;',
    );
  });

  it('draws no paint group for a null background (ConverterSvg.java:99)', () => {
    const none = mathDocument('x^2', BLACK, null);
    expect(none).not.toContain('<rect');
    expect(none).toContain('<g\n  ><foreignObject');
  });

  it('colours the KaTeX body with the foreground name', () => {
    expect(mathDocument('x', { r: 255, g: 0, b: 0, a: 255 }, WHITE)).toContain('color:red');
  });

  it('writes no glyph group for a blank formula (cov-math-only-directive, 8x8)', () => {
    const doc = mathDocument('', BLACK, WHITE);
    expect(doc).not.toContain('foreignObject');
    expect(doc).toContain('width="8" height="8"');
    expect(doc.endsWith('style="stroke:none;"\n    /></g\n  ></g\n></svg\n>\n')).toBe(true);
  });
});
