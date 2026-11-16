/**
 * ele T2b: a legacy activity link label `-->[{{ … }}]` draws its embedded diagram as one `<image>` at the label block
 * corner (`SvekEdge.java:951-954`, `EmbeddedDiagram.java:169-174`). The label measure already embedded (its
 * `Display#create0` reaches `CreoleParser#createSheetSlow`); the draw read the joined lines as one line until T2a.
 * Expected attributes are the jar's, from `tests/fixtures/edge-label-embed/<row>.svg`.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/edge-label-embed');
const IMAGE = /<image width="([\d.]+)" height="([\d.]+)" x="([\d.]+)" y="([\d.]+)"/g;
const CANVAS = /width="(\d+)px" height="(\d+)px"/;

function render(row: string): { images: string[][]; canvas: string[] } {
  const svg = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return { images: [...svg.matchAll(IMAGE)].map((m) => m.slice(1)), canvas: svg.match(CANVAS)!.slice(1) };
}

describe('ele T2b: legacy activity edge label with an embedded diagram', () => {
  it('draws the nested class 61x68 at the label corner (actleg2)', () => {
    expect(render('actleg2')).toEqual({ images: [['61', '68', '21.34', '120']], canvas: ['98', '255'] });
  });

  it('draws the Welcome page of an unterminated `{{` (actleg2-open)', () => {
    expect(render('actleg2-open')).toEqual({ images: [['532', '227', '21.34', '120']], canvas: ['569', '414'] });
  });

  it('draws it beside a horizontal link (actleg-h-open)', () => {
    expect(render('actleg-h-open')).toEqual({ images: [['532', '227', '61.84', '7']], canvas: ['662', '268'] });
  });
});
