/**
 * `listSpritePlugin` end to end: the `HELP` root, the `same(10)` margin, the chrome and scale paths, through
 * `renderSync` (`@startsprites` routes to `'sprites'`, lsp D2).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:159-209
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../../../src/index.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';

const PROBES = 'plans/listsprite-factory-port/probes';
const ROOT_SIZE = /<svg [^>]*\bwidth="(\d+)px" height="(\d+)px"/;

function render(slug: string): string {
  return renderSync(readFileSync(`${PROBES}/${slug}.puml`, 'utf8'), { measurer: new DeterministicMeasurer() });
}

function rootSize(svg: string): [number, number] {
  const m = ROOT_SIZE.exec(svg);
  return [Number(m?.[1]), Number(m?.[2])];
}

describe('listSpritePlugin', () => {
  it('cov-sprites-uml-mono: data-diagram-type="HELP", a 78x45 page', () => {
    const svg = render('cov-sprites-uml-mono');
    expect(svg).toContain('data-diagram-type="HELP"');
    expect(rootSize(svg)).toEqual([78, 45]);
  });

  it('cov-sprites-startsprites-mono: @startsprites draws, not "unknown diagram type"', () => {
    const svg = render('cov-sprites-startsprites-mono');
    expect(svg).not.toContain('unknown diagram type');
    expect(svg).toContain('>foo1</text>');
  });

  it('cov-sprites-chrome: the title and the legend draw around the page', () => {
    const svg = render('cov-sprites-chrome');
    expect(svg).toContain('>Sprite catalogue</text>');
    expect(svg).toContain('>the legend</text>');
  });

  it('cov-sprites-scale: `scale 2` doubles the page', () => {
    const [w, h] = rootSize(render('cov-sprites-scale'));
    expect([w, h]).toEqual([156, 90]);
  });

  it('cov-sprites-skinparam-bg: the document background reaches the root', () => {
    expect(render('cov-sprites-skinparam-bg')).toMatch(/background:#(?!FFFFFF)/);
  });
});
