/**
 * aae T3 (issue #188): every consumer of an embed arrow label sees it where it is drawn.
 *
 * The jar's canvas is the `LimitFinder` extent of the compressed drawing (`CompressionXorYBuilder.java:87-89`), so
 * the label's ink is the image at its compressed draw point, `x + w - 1` wide (`LimitFinder.java:199-202`). Jar
 * values from `tests/fixtures/edge-label-embed/act3-open.svg`, `act3.svg` and `act3-mixed.svg`.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/edge-label-embed');

function render(row: string): string {
  return renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), { measurer: new DeterministicMeasurer() });
}

function attrs(svg: string, tag: string): Record<string, string>[] {
  return [...svg.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((m) =>
    Object.fromEntries([...m[1]!.matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1]!, a[2]!])),
  );
}

describe('aae T3: the open embed arrow label (Welcome page)', () => {
  const svg = render('act3-open');

  it("keeps every node at the jar's y", () => {
    expect(attrs(svg, 'ellipse')[0]).toMatchObject({ cy: '25' });
    expect(attrs(svg, 'rect')[0]).toMatchObject({ y: '55' });
    expect(attrs(svg, 'line')[1]).toMatchObject({ y1: '87', y2: '107' });
  });

  it("draws the jar's one 532x227 image at (33.338, 92)", () => {
    const images = attrs(svg, 'image');
    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({ width: '532', height: '227', x: '33.338', y: '92' });
  });

  it('sizes the canvas 585x339 from the drawn image', () => {
    expect(attrs(svg, 'svg')[0]).toMatchObject({ width: '585px', height: '339px' });
  });
});

describe('aae T3: the embed label inks x + w - 1, not x + w', () => {
  it.each([
    ['act3', '201px'],
    ['act3-mixed', '222px'],
  ])('%s is 114 wide', (row, height) => {
    expect(attrs(render(row), 'svg')[0]).toMatchObject({ width: '114px', height });
  });
});
