/**
 * Authored edge-label embed gate (ele, issue #144, D5): a `{{ … }}` in a svek link label is one `EmbeddedDiagram`
 * stripe (`SvekEdge.java:299-300` -> `CreoleParser.java:146-170`). Rows are exactly the `.puml` files under
 * `tests/fixtures/edge-label-embed/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - A ZERO row renders at 0 diffs and draws the jar's `<image>` count. The count is asserted on its own because
 *   `compareSvg` stops at a `childCount` mismatch, so a missing `<image>` can show as only a few diffs.
 * - An OPEN row's diff count never rises, and its `reason` names the issue that holds its residual.
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

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/edge-label-embed');

/** Row -> the jar's `<image>` count. */
const ZERO: Readonly<Record<string, number>> = {
  // 2026-11-15 ele T1c: state.
  state: 1,
  'state-open': 1,
  'state-self': 1,
  'state-mixed': 1,
  'state-mixed-right': 1,
  'state-h-open': 1,
  // 2026-11-15 ele T2a: description (main label, quantifier, link note, horizontal nodesep).
  comp: 1,
  'comp-open': 1,
  'uc-open': 1,
  'comp-h-open': 1,
  'comp-qual': 1,
  'comp-note': 1,
  // 2026-11-15 ele T2b: legacy activity.
  actleg2: 1,
  'actleg2-open': 1,
  'actleg-h-open': 1,
  // 2026-11-15 ele T3a: class/object (the well-formed row held 0 before this mission).
  class: 1,
  'class-open': 1,
  'obj-open': 1,
  // 2026-11-15 ele T4: label pipelines outside `SvekEdge` that already embed (D1).
  seq: 1,
  'seq-open': 1,
  timing: 1,
  'timing-open': 1,
};

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, { readonly maxDiffs: number; readonly reason: string }>> = {
  // 2026-11-15 ele T4: activity-3 arrow labels build outside `SvekEdge` (`FtileFactoryDelegator.java:103-112`).
  act3: { maxDiffs: 3, reason: '#188: the embed image is drawn 8.556 above the jar' },
  'act3-open': { maxDiffs: 30, reason: '#188: the open embed reserves more height; every node sits 31.5 lower' },
};

const IMAGE = /<image\b/g;
const imageCount = (svg: string): number => (svg.match(IMAGE) ?? []).length;

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

function measure(row: string): { diffs: number; ours: number; jar: number } {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return { diffs: compareSvg(ours, jar, 'deterministic').diffs.length, ours: imageCount(ours), jar: imageCount(jar) };
}

describe('edge-label embed authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...Object.keys(ZERO), ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('edge-label embed authored fixtures — zero rows', () => {
  for (const [row, images] of Object.entries(ZERO)) {
    it(`${row}: 0 diffs and ${String(images)} <image> as the jar draws`, () => {
      const m = measure(row);
      expect(m.jar).toBe(images);
      expect(m.ours).toBe(images);
      expect(m.diffs).toBe(0);
    });
  }
});

describe('edge-label embed authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      expect(measure(row).diffs).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
