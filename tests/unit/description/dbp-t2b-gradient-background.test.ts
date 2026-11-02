/**
 * dbp-T2b: the description engine draws through the klimt port, whose
 * `SvgGraphics` constructor takes the jar's gradient branch
 * (`SvgGraphics.java:178-183`): the `<linearGradient>` is the FIRST def
 * (`:393`, created in the constructor), the `url(#id)` rect the content's
 * first child, and the root style carries no `background:`.
 *
 * The chromed path unwraps that document (`unwrapKlimtSvg`) and re-splices the
 * rect at the final canvas size: it must leave exactly ONE def and ONE rect.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { unwrapKlimtSvg } from '../../../src/diagrams/description/renderer.js';

const STYLE = '<style>\ndocument {\n  BackgroundColor red/blue\n}\n</style>\n';
const PLAIN = `@startuml\n${STYLE}[A] --> [B]\n@enduml`;
const CHROMED = `@startuml\n${STYLE}[A] --> [B]\ntitle T\n@enduml`;

function render(src: string): string {
  return renderSync(src, { measurer: new DeterministicMeasurer() });
}

const GRADIENT_DEFS_RE = /<linearGradient\b/g;
const URL_RECT_RE = /<rect x="0" y="0" width="(\d+)" height="(\d+)" fill="url\(#([^)]+)\)"[^>]*\/>/g;

function expectOneGradientRect(svg: string): { id: string; width: string; height: string } {
  expect(svg.match(GRADIENT_DEFS_RE)).toHaveLength(1);
  const rects = [...svg.matchAll(URL_RECT_RE)];
  expect(rects).toHaveLength(1);
  const [, width, height, id] = rects[0]!;
  expect(svg).toContain(`<linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="${id}">`);
  expect(svg).not.toContain('red/blue');
  expect(svg).not.toMatch(/<svg[^>]*background:/);
  return { id: id!, width: width!, height: height! };
}

describe('description document gradient (dbp-T2b)', () => {
  it('unchromed: one def, one url rect as the content first child, no root background', () => {
    const svg = render(PLAIN);
    expectOneGradientRect(svg);
    expect(svg).toMatch(/<g[^>]*><rect x="0" y="0" width="\d+" height="\d+" fill="url\(#/);
  });

  it('chromed: still one def and one url rect, sized to the final canvas, before the title', () => {
    const svg = render(CHROMED);
    const { width, height } = expectOneGradientRect(svg);
    const root = /<svg[^>]* width="(\d+)px" height="(\d+)px"/.exec(svg);
    expect([width, height]).toEqual([root?.[1], root?.[2]]);
    expect(svg.indexOf('fill="url(#')).toBeLessThan(svg.indexOf('<g class="title"'));
  });

  it('chromed: the gradient def is the first def, ahead of any other', () => {
    const svg = render(CHROMED);
    expect(svg).toMatch(/<defs><linearGradient\b/);
  });
});

describe('unwrapKlimtSvg — gradient background (dbp-T2b)', () => {
  const KLIMT =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" ' +
    'viewBox="0 0 10 10"><?plantuml $version$?>' +
    '<defs><linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="g0"/></defs>' +
    '<g><rect x="0" y="0" width="10" height="10" fill="url(#g0)" style="stroke:none;"/><circle/></g></svg>';

  it('lifts the url rect as documentBackgroundRect and keeps the def in extraDefs', () => {
    const fragment = unwrapKlimtSvg(KLIMT, 'red/blue');
    expect(fragment.documentBackgroundRect).toBe('url(#g0)');
    expect(fragment.extraDefs).toBe('<linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="g0"/>');
    expect(fragment.body).toBe('<circle/>');
  });

  it('declares no root background for a gradient (backcolorString is null, SvgGraphics.java:178-183)', () => {
    expect(unwrapKlimtSvg(KLIMT, 'red/blue').background).toBe('#00000000');
  });
});
