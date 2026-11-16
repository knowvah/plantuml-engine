/**
 * Authored USymbol group scale gate (ugs, issue #149): under `scale`, upstream draws a cluster in layout units through
 * the document's scaled `UGraphic`, so every number `USymbol#asBig` emits -- its literals included -- is multiplied
 * once, at format time (`SvgGraphics.java:467-474`, `TextBlockExporter.java:165-177`). Rows are exactly the `.puml`
 * files under `tests/fixtures/usymbol-group-scale/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - A ZERO row renders at 0 diffs.
 * - An OPEN row's diff count never rises, and its `reason` names the issue (and, before it lands, the task) that holds
 *   its residual.
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/usymbol-group-scale');

/** Rows at 0 diffs. */
const ZERO: readonly string[] = [
  // 2026-11-16 ugs T1a: controls. The folder family draws plain strings with its own `scaleK`
  // (`class-namespace-shape.ts#renderNamespaceFolder`), and the description engine draws its clusters through klimt
  // with `SvgOption.scale` (`description/renderer.ts`).
  'scale-folder',
  'scale-package',
  'desc-rectangle',
  // 2026-11-16 ugs T1b: a USymbol group draws in layout units and `SvgOption.scale` multiplies every number once
  // (`SvgGraphics.java:467-474`), so `USymbol#asBig`'s literals scale with the cluster (`USymbolRectangle.java:133`,
  // `USymbolNode.java:165-179`, `USymbolDatabase.java:157-161`), as the #140 leaf does.
  'issue-149',
  'scale-rectangle',
  'scale-agent',
  'scale-hexagon',
  'scale-label',
  'scale-action',
  'scale-card',
  'scale-cloud',
  'scale-collections',
  'scale-database',
  'scale-file',
  'scale-frame',
  'scale-process',
  'scale-queue',
  'scale-stack',
  'scale-storage',
  'scale-artifact',
  'scale-node',
  'scale-1p5-node',
  'scale-gradient-node',
  'scale-nested',
  'scale-1p25-cloud',
  'object-scale-node',
  // 2026-11-16 ugs T1c: the header stereo is a `TextBlock` drawn through the cluster's scaled `UGraphic`
  // (`ClusterHeader.java:173-220`), so its numbers are multiplied and formatted once (`SvgGraphics.java:467-474`): the
  // header body is built deferred and formatted at `k` where it is placed, on the USymbol and folder/rect paths.
  'node-thick-dashed',
  'scale-rectangle-stereo',
  'folder-stereo',
  'scale-component',
  'scale-legend-node',
  'scale-sprite-stereo',
  'scale-0p5-node',
  'scale-rect-style',
];

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, { readonly maxDiffs: number; readonly reason: string }>> = {
  // 2026-11-16 ugs T2: unchanged by T1b/T1c and the same at `scale 1` (D3), filed.
  'scale-group': { maxDiffs: 84, reason: '#196: a <<Group>> package draws a folder, not USymbolFrame' },
  'scale-partition': { maxDiffs: 84, reason: '#196: a <<Partition>> package draws a folder, not USymbolFrame' },
  'package-fontsize': { maxDiffs: 101, reason: "#197: packageFontSize reaches a USymbol group's title" },
};

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function diffCount(row: string): number {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return compareSvg(ours, jar, 'deterministic').diffs.length;
}

describe('usymbol group scale authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('usymbol group scale authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs`, () => {
      expect(diffCount(row)).toBe(0);
    });
  }
});

describe('usymbol group scale authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      expect(diffCount(row)).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
