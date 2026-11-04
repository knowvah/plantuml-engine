import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

/**
 * stdd T2c: `CommandLinkStateCommon.java:189` builds the label with
 * `Display.getWithNewlines`, and `SvekEdge.java:287-300` draws it as a
 * `TextBlock` of lines (`create0(font, alignment, skinParam, wrapWidth,
 * CreoleMode.SIMPLE_LINE)`): the alignment is `stateMessageAlignment`, else
 * `defaultTextAlignment`, else CENTER (`SkinParam.java:722-723`); `wrapWidth`
 * is `skinParam.maxMessageSize()`; `LinkArg.build(label, length,
 * classAttributeIconSize() > 0)` (`:202`) strips a leading visibility
 * character and `addVisibilityModifier` (`:363-374`) draws its icon before
 * the block. `DriverTextSvg.java:118-125` advances x over leading spaces, and
 * `SvgGraphics.java:700-705` omits `textLength` on a single glyph. Values are
 * the jar's `in.svg`.
 */

const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(slug: string): string {
  const puml = readFileSync(`${CACHE}/${slug}/in.puml`, 'utf8');
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

const labelTexts = (svg: string): string[] =>
  [...svg.matchAll(/<text [^>]*font-size="13"[^>]*>[^<]*<\/text>/g)].map((m) => m[0]);

describe('stdd T2c: link labels', () => {
  it('ruruce-78: a `\\n` label is two left-aligned lines, each with its own textLength', () => {
    const texts = labelTexts(render('ruruce-78-feno407'));
    expect(texts).toEqual([
      '<text x="34.32" y="67.111" font-size="13" fill="#000" textLength="79.544">This is a label</text>',
      '<text x="34.32" y="80.111" font-size="13" fill="#000" textLength="104.081">over multiple lines</text>',
    ]);
  });

  it('tocitu-93: leading spaces move x, a single glyph has no textLength, defaultTextAlignment left applies', () => {
    const texts = labelTexts(render('tocitu-93-sidu557'));
    expect(texts).toEqual([
      '<text x="33" y="178.111" font-size="13" fill="#000" textLength="41.194">Alpha {</text>',
      '<text x="40.15" y="191.111" font-size="13" fill="#000" textLength="34.612">Foo();</text>',
      '<text x="43.725" y="204.111" font-size="13" fill="#000" textLength="32.419">Bar();</text>',
      '<text x="33" y="217.111" font-size="13" fill="#000">}</text>',
    ]);
  });

  it('lurage-50: `maxMessageSize 150` wraps the label into word runs and narrows the diagram to 285', () => {
    const svg = render('lurage-50-kobo763');
    expect(svg).toMatch(/<svg [^>]*width="285px"/);
    // The x and textLength of every word run are the jar's; the baselines sit 0.389 above the jar's
    // (17.111 vs 17.5) on a wrapped block, a text-metric residual journaled to T4b.
    const texts = labelTexts(svg).map((t) => t.replace(/ y="[0-9.]+"/, ''));
    expect(texts[0]).toBe('<text x="75.325" font-size="13" fill="#000" textLength="50.619">aaaaaaa</text>');
    // `DriverTextSvg.java:115-116`: a whitespace-only text is written as U+00A0.
    expect(texts[1]).toBe('<text x="125.944" font-size="13" fill="#000">\u00A0</text>');
    expect(texts[2]).toBe('<text x="129.519" font-size="13" fill="#000" textLength="72.313">bbbbbbbbbb</text>');
    expect(texts).toHaveLength(12);
  });

  it('susena-02: `+OK` draws the PUBLIC_METHOD icon before `OK`', () => {
    const svg = render('susena-02-gusa448');
    expect(svg).toContain(
      '<g data-visibility-modifier="PUBLIC_METHOD"><ellipse cx="245" cy="147" rx="3" ry="3" fill="none" style="stroke:#038048;stroke-width:1;"/></g>',
    );
    expect(svg).toContain('<text x="252" y="150.111" font-size="13" fill="#000" textLength="18.769">OK</text>');
  });
});
