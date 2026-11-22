/**
 * aae T4 (issue #188): `UGraphicCompressOnXorY#draw` maps EACH draw call's own point through `ct()`
 * (`klimt/compress/UGraphicCompressOnXorY.java:107-116`), so the parts of one arrow-label block move apart when
 * compression removes a slot between them. An embed image occupies no slot (`SlotFinder.java:84-109`): every image
 * whose draw point falls in the removed gap lands on the slot's start, while a `UText` keeps its own slot. Jar values
 * from `tests/fixtures/edge-label-embed/act3-text-after.svg` and `act3-two-embeds.svg`.
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

describe('aae T4: each part of an arrow-label block rides compression on its own draw point', () => {
  it('act3-text-after: the image lands at 92 and the text line after it keeps its own slot', () => {
    const svg = render('act3-text-after');
    expect(attrs(svg, 'image')).toEqual([expect.objectContaining({ x: '33.338', y: '92' })]);
    expect(attrs(svg, 'text')[2]).toMatchObject({ x: '33.338', y: '106.5' });
    expect(attrs(svg, 'line')[1]).toMatchObject({ y1: '87', y2: '126.444' });
  });

  it('act3-two-embeds: both images land on the removed slot start, and the canvas inks them there', () => {
    const svg = render('act3-two-embeds');
    expect(attrs(svg, 'image').map((i) => `${i.x},${i.y}`)).toEqual(['33.338,92', '33.338,92']);
    expect(attrs(svg, 'svg')[0]).toMatchObject({ width: '114px', height: '201px' });
  });
});
