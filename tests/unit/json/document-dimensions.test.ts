/**
 * ebi-T1 (#187 ruling, mechanism 2): the json block's ink extent is a
 * `LimitFinder` walk (`JsonDiagram#calculateDimension`, `JsonDiagram.java:130-137`).
 *
 * - An empty block has no `lines` (`TextBlockJson.java:117-135` adds one per
 *   member/element only), so `drawU`'s row loop (`:288-316`) draws nothing and
 *   only the full-node `URectangle` (`:279-281,317`) reaches the walk:
 *   `LimitFinder#drawRectangle` records `x - 1, y - 1` … `x + w - 1, y + h - 1`
 *   (`LimitFinder.java:184-188`; the rectangle carries no `deltaShadow`).
 * - A block with lines also draws each cell's `UEmpty` (`TextBlockMarged.java:83`),
 *   whose far corner `LimitFinder#drawEmpty` records at `x + w, y + h`
 *   (`LimitFinder.java:159-162`).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { documentDimensions } from '../../../src/diagrams/json/document-dimensions.js';
import type { JsonNodeGeo, JsonRowGeo } from '../../../src/diagrams/json/layout.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const FIXTURE_DIR = 'tests/fixtures/json';

function row(): JsonRowGeo {
  return {
    key: 'k',
    value: 'v',
    valueType: 'string',
    valueLines: ['v'],
    highlight: false,
    arrayEntry: false,
    y: 0,
    height: 17,
    keyWidth: 5,
    valueLineWidths: [5],
    keyTextLength: 5,
    valueTextLengths: [5],
    keyBaselineY: 12,
    valueBaselineYs: [12],
    keyAtoms: [{ text: 'k', dx: 0, textLength: 5 }],
    valueAtoms: [[{ text: 'v', dx: 0, textLength: 5 }]],
  };
}

function node(box: { x: number; y: number; width: number; height: number }, rows: JsonRowGeo[] = []): JsonNodeGeo {
  return { id: 'n0', ...box, keyColWidth: 0, valueColWidth: box.width, rows };
}

const BOX = { x: 5, y: 5, width: 15, height: 17 };

describe('documentDimensions -- LimitFinder ink of a json block', () => {
  it('a lone rowless node is its rectangle only: ink 4 … 19 by 4 … 21', () => {
    expect(documentDimensions([node(BOX)], [])).toEqual({ width: 15, height: 17 });
  });

  it('a lone node with a row reaches x + w / y + h through its cells: 16 x 18', () => {
    expect(documentDimensions([node(BOX, [row()])], [])).toEqual({ width: 16, height: 18 });
  });

  it('a rowless node that is not the extreme on an axis leaves that axis alone', () => {
    // The rowed node spans x 5 … 45 and y 5 … 105; the rowless one sits inside
    // both ranges, so neither maximum is its own.
    const rowed = node({ x: 5, y: 5, width: 40, height: 100 }, [row()]);
    const empty = { ...node({ x: 10, y: 10, width: 15, height: 17 }), id: 'n1' };
    expect(documentDimensions([rowed, empty], [])).toEqual({ width: 41, height: 101 });
  });

  it('a rowless node that is the extreme on one axis only moves that axis', () => {
    // Rightmost ink is the rowless node (x 50 + 15 - 1 = 64); bottommost is the rowed one (5 + 100).
    const rowed = node({ x: 5, y: 5, width: 40, height: 100 }, [row()]);
    const empty = { ...node({ x: 50, y: 10, width: 15, height: 17 }), id: 'n1' };
    expect(documentDimensions([rowed, empty], [])).toEqual({ width: 60, height: 101 });
  });

  it('renders nested-arrays.puml at the jar oracle height (an empty [] is its bottommost ink)', () => {
    const oracle = readFileSync(`${FIXTURE_DIR}/nested-arrays.svg`, 'utf8');
    const jarHeight = /^<svg[^>]*\sheight="([^"]+)"/.exec(oracle)?.[1];
    expect(jarHeight).toMatch(/px$/);
    const svg = renderSync(readFileSync(`${FIXTURE_DIR}/nested-arrays.puml`, 'utf8'), {
      measurer: new DeterministicMeasurer(),
      filename: 'nested-arrays.puml',
    });
    const ours = /^<svg[^>]*\sheight="([^"]+)"/.exec(svg)?.[1];
    expect(ours).toBe(jarHeight);
  });
});
