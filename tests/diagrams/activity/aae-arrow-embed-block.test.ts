/**
 * aae T2 (issue #188): an activity-3 arrow label whose block starts with an embed (`-> {{\nclass X\n}};`).
 *
 * The jar's block is the whole embed (`Snake.java:247` prints `dim=[61,68]`, `.agent-notes/aae-T1.md`); the
 * reserve keeps the raw arrow 87 -> 190 (`FtileFactoryDelegatorAssembly.java:58-63`). `SlotFinder` has no branch
 * for the image (`SlotFinder.java:84-109`), so compression removes that gap, and the image's own draw point --
 * not a text baseline -- rides through `ct` (`UGraphicCompressOnXorY.java:116`), landing at the removed slot's
 * start. Jar values from `tests/fixtures/edge-label-embed/act3.svg`.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { edgeLabelBlockSize } from '../../../src/diagrams/activity/layout/compress/edge-label-anchor.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/edge-label-embed');
const EMBED_LABEL = '{{\nclass X\n}}';
const TEXT_LABEL = 'hello\nworld\nthree';

function attrs(svg: string, tag: string): Record<string, string>[] {
  return [...svg.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'g'))].map((m) =>
    Object.fromEntries([...m[1]!.matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1]!, a[2]!])),
  );
}

describe('aae T2: an embed-first activity arrow label', () => {
  let svg = '';
  beforeAll(() => {
    // `renderSync` registers the nested renderer the block measure reads (`src/index.ts#prepareBlock`).
    svg = renderSync(readFileSync(join(FIXTURES, 'act3.puml'), 'utf8'), { measurer: new DeterministicMeasurer() });
  });

  it('measures the block as the whole embed, as Snake.java:247 sees it', () => {
    expect(edgeLabelBlockSize(EMBED_LABEL, defaultTheme, new DeterministicMeasurer())).toEqual({
      width: 61,
      height: 68,
    });
  });

  it('leaves an embed-free 3-line label at its base size (D3)', () => {
    // Measured on the mission base `229a5a836`.
    expect(edgeLabelBlockSize(TEXT_LABEL, defaultTheme, new DeterministicMeasurer())).toEqual({
      width: 26.331249237060547,
      height: 33,
    });
  });

  it("draws the jar's one image at the compressed draw point (33.338, 92)", () => {
    const images = attrs(svg, 'image');
    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({ width: '61', height: '68', x: '33.338', y: '92' });
  });

  it('keeps the :a -> :b arrow 87 -> 107 and the canvas 201 tall', () => {
    expect(attrs(svg, 'line')[1]).toMatchObject({ y1: '87', y2: '107' });
    expect(attrs(svg, 'svg')[0]).toMatchObject({ height: '201px' });
  });
});
