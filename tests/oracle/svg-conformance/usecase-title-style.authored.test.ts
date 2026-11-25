/**
 * Authored usecase title-style gate (uts, issue #148, D3): a usecase is drawn by `EntityImageDescription`
 * (`GeneralImageBuilder.java:169-175`; the `EntityImageUseCase` constructions there are commented out), so its stroke,
 * fill and corner come from `styleTitle`, `{root, element, componentDiagram, <symbol SNames>, title}` merged on the
 * entity's own builder (`EntityImageDescription.java:142-171`, `Entity.java:755-767`). Rows are exactly the `.puml`
 * files under `tests/fixtures/usecase-title-style/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
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

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/usecase-title-style');

/** Rows at 0 diffs. */
const ZERO: readonly string[] = [
  // 2026-11-16 uts T1b: a usecase signs `styleTitle` with `title` (`EntityImageDescription.java:142-153`) and merges it
  // on the entity's builder (`Entity.java:755-767`), as every other `EntityImageDescription` symbol does.
  'skin-title',
  'style-title',
  'skin-title-business',
  'skin-title-stereo',
  'style-usecase-title',
  'style-after-usecase',
  // 2026-11-16 uts T1b push-forward, the same reading: `#back:`/`#line:` over `styleTitle` (`eventuallyOverride(colors)`,
  // `EntityImageDescription.java:153`), `usecaseBorderColor` beside the title skinparams, `titleBorderRoundCorner`, a
  // usecase inside a `rectangle { }`, and a `<style>` on each side of a usecase (the entity's builder, `Entity.java:767`).
  'skin-title-colors',
  'skin-title-and-usecase',
  'skin-title-round',
  'skin-title-in-rectangle',
  'style-before-and-after',
  // 2026-11-25 cuts T2/T3 (#195): the class engine strokes and sizes a mixed-in usecase and actor from `styleTitle`
  // on the entity's builder (`class-usymbol-title-style.ts`; `EntityImageDescription.java:148-177`).
  'skin-title-allowmixing',
];

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, { readonly maxDiffs: number; readonly reason: string }>> = {};

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

describe('usecase title-style authored fixtures — manifest shape', () => {
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

describe('usecase title-style authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs`, () => {
      expect(diffCount(row)).toBe(0);
    });
  }
});

describe('usecase title-style authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      expect(diffCount(row)).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
