/**
 * `ListSpriteDiagram#getTextBlock`: every sprite over its name, centred, flowing right by `w + 30` and wrapping past
 * 1024. Values are the planning oracles' (`plans/listsprite-factory-port/probes/`), drawn at the export's margin 10.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/ListSpriteDiagram.java:67-106
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { preprocessingArtifactOf } from '../../../../../src/core/command/PSystemBasicFactory.js';
import { VERSION_PLACEHOLDER } from '../../../../../src/core/klimt/document-shell.js';
import { basicSvgOption } from '../../../../../src/core/klimt/drawing/svg/svg-graphics-core.js';
import { UGraphicSvg } from '../../../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import type { ListSpriteDiagram } from '../../../../../src/core/klimt/sprite/ListSpriteDiagram.js';
import { parseListSprite } from '../../../../../src/core/klimt/sprite/ListSpriteDiagramFactory.js';
import { UTranslate } from '../../../../../src/core/klimt/UTranslate.js';
import { internalSpriteStoreFrom } from '../../../../../src/core/internal-sprite-store.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';
import { stringBounderFor } from '../../../../../src/core/UgDiagram.js';
import { buildSpriteAssetsStore } from '../../../../helpers/sprite-assets-store.js';
import { sourceOf } from '../../../../helpers/utility-single-line.js';

const PROBES = 'plans/listsprite-factory-port/probes';
/** `TitledDiagram#getDefaultMargins`'s `same(10)` (TitledDiagram.java:273-276). */
const MARGIN = 10;
/** The jar's `/sprites/**` bundle, which `sprite $x jar:…` reads (`cov-sprites-jar-sprite`). */
const SPRITES = internalSpriteStoreFrom(buildSpriteAssetsStore());

function diagramOf(slug: string): ListSpriteDiagram {
  const source = sourceOf(readFileSync(`${PROBES}/${slug}.puml`, 'utf8'));
  const parsed = parseListSprite(source, preprocessingArtifactOf(source), { sprites: SPRITES });
  if ('refused' in parsed) throw new Error(`refused: ${parsed.message}`);
  return parsed;
}

/** The page's block drawn at the margin, as the export draws it. */
function draw(slug: string): { svg: string; width: number; height: number } {
  const measurer = new DeterministicMeasurer();
  const block = diagramOf(slug).getTextBlock();
  const dim = block.calculateDimension(stringBounderFor(measurer));
  const driver = { calculateDimension: (font: never, text: string) => ({ width: measurer.measure(text, font).width }) };
  const ug = UGraphicSvg.build(0, basicSvgOption(), VERSION_PLACEHOLDER, driver, measurer);
  block.drawU(ug.apply(new UTranslate(MARGIN, MARGIN)));
  return { svg: ug.getSvgString(), width: dim.getWidth(), height: dim.getHeight() };
}

function attrs(svg: string, tag: string, name: string): string[] {
  return [...svg.matchAll(new RegExp(`<${tag} [^>]*\\b${name}="([^"]*)"`, 'g'))].map((m) => m[1]!);
}

describe('ListSpriteDiagram#getTextBlock', () => {
  it('cov-sprites-uml-mono: a 57.212x24 block, the 15x10 image at (16.106, 10), foo1 at (10, 30.889)', () => {
    const { svg, width, height } = draw('cov-sprites-uml-mono');
    // `foo1` (27.212) plus 30, by the 10 px sprite over the 14 px name; the jar's 78x45 page adds the margins.
    expect([width.toFixed(3), height]).toEqual(['57.212', 24]);
    expect([attrs(svg, 'image', 'x'), attrs(svg, 'image', 'y')]).toEqual([['16.106'], ['10']]);
    expect([attrs(svg, 'image', 'width'), attrs(svg, 'image', 'height')]).toEqual([['15'], ['10']]);
    expect([attrs(svg, 'text', 'x'), attrs(svg, 'text', 'y')]).toEqual([['10'], ['30.889']]);
  });

  it('cov-sprites-wrap: twelve sprites, six per row, images at y=10 and y=77, each row led at x=64.725', () => {
    const { svg } = draw('cov-sprites-wrap');
    const ys = attrs(svg, 'image', 'y');
    const xs = attrs(svg, 'image', 'x');
    expect(ys).toEqual([...Array<string>(6).fill('10'), ...Array<string>(6).fill('77')]);
    expect([xs[0], xs[6]]).toEqual(['64.725', '64.725']);
  });

  it('cov-sprites-mixed-order: names in String#compareTo order (lsp D5)', () => {
    const texts = [...draw('cov-sprites-mixed-order').svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    expect(texts).toEqual(['9nine', 'HD', 'Zeta', '_under', 'alpha', 'foo1', 'mdiHeadset']);
  });

  it('cov-sprites-creole-name: `foo__bar__` is two runs, `bar` underlined; `x--y--z` strikes `y` (lsp D8)', () => {
    const { svg } = draw('cov-sprites-creole-name');
    expect(attrs(svg, 'text', 'x')).toEqual(['10', '70.275', '89.7', '139.912', '146.912', '153.912']);
    expect(attrs(svg, 'text', 'text-decoration')).toEqual(['underline', 'line-through']);
  });

  it.each([
    ['cov-sprites-svg', 'M47.362,12 C37.362,12'],
    ['cov-sprites-jar-sprite', 'M30.441,14.639 L15.615,14.686'],
  ])('%s: the sprite draws as a <path>, not an <image>', (slug, d) => {
    const { svg } = draw(slug);
    expect(attrs(svg, 'image', 'x')).toEqual([]);
    expect(attrs(svg, 'path', 'd')[0]?.startsWith(d)).toBe(true);
  });

  it('cov-sprites-color: the 4x4 colour sprite at (11.5, 10) over `c`', () => {
    const { svg } = draw('cov-sprites-color');
    expect([attrs(svg, 'image', 'x'), attrs(svg, 'image', 'y'), attrs(svg, 'text', 'y')]).toEqual([
      ['11.5'],
      ['10'],
      ['24.889'],
    ]);
  });

  it('cov-sprites-uml-nosprites-title: no sprite is a 0x0 block', () => {
    const { width, height } = draw('cov-sprites-uml-nosprites-title');
    expect([width, height]).toEqual([0, 0]);
  });
});
