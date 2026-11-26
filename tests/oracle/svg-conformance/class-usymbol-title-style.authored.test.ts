/**
 * Authored class usymbol title-style gate (cuts, issue #195, D3): every mixed-in description leaf of a class diagram
 * (`CIRCLE`, `DESCRIPTION`, `USECASE`, `USECASE_BUSINESS`) is drawn by `EntityImageDescription`
 * (`GeneralImageBuilder.java:162-180`), so its stroke, fill and size come from `styleTitle`,
 * `{root, element, classDiagram, <symbol SNames>, title}` merged with the stereotype on the entity's own builder
 * (`EntityImageDescription.java:142-177`, `Entity.java:760-772`). Rows are exactly the `.puml` files under
 * `tests/fixtures/class-usymbol-title-style/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - A ZERO row renders at 0 diffs.
 * - An OPEN row's diff count never rises, and its `reason` names the issue (and, before it lands, the task) that holds
 *   its residual.
 *
 * Rendered as the survey renders (`scripts/svg-parity-survey.ts`): `renderSync` + `DeterministicMeasurer`, with the
 * ELK backend from `prepareElkOnce()` for the `!pragma layout elk` row.
 */
import { beforeAll, describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ElkBackend } from '../../../src/index.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';
import { prepareElkOnce } from './render-fixture-class.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/class-usymbol-title-style');

/** Rows at 0 diffs. */
const ZERO: readonly string[] = [
  // 2026-11-25 cuts T1: controls at 0 on the base. `ctl-plain` has no title style; `title-font` moves only the title
  // fonts, which already match. The three `embed-*` rows guard the module-state trap (decisions.md D1): a nested
  // `{{ }}` class render must never hand its builder to the outer leaf.
  'ctl-plain',
  'title-font',
  'embed-class',
  'embed-desc',
  'embed-group',
  // 2026-11-25 cuts T2: the class engine stamps `styleTitle` on each description leaf from its own builder
  // (`class-usymbol-title-style.ts`; `EntityImageDescription.java:148-168`, `Entity.java:760-772`), and the draw reads
  // its `LineColor`, `BackGroundColor` and stroke below the inline colours.
  'component',
  'database',
  'rectangle',
  'node-cloud',
  'diagram-title',
  'style-usecase-title',
  'title-back',
  'inline-back',
  'style-after',
  // 2026-11-25 cuts T3: the box and an actor's ink are sized for `styleTitle`'s stroke
  // (`EntityImageDescription.java:168,177`; `class-layout-leaf-shapes.ts`, `class-layout-generic-classifier.ts`).
  'business',
  'style-title',
  'usecase-border',
  // 2026-11-25 cuts push-forward: the same `styleTitle` reads reach `circle`/`()` (`LeafType.CIRCLE` ->
  // `USymbols.INTERFACE`, `Entity.java:420-421`), hexagon/queue/stack, a business actor's
  // `ACTOR_BUSINESS_TITLE` (`EntityImageDescription.java:142-143`), the ELK adapter (`class-elk-adapter.ts`
  // `buildUSymbolEntityParams`) and `scale 2` (the stroke scales with `theme.scaleK`).
  'circle',
  'hexagon-queue-stack',
  'actor-business-style',
  'elk',
  'scale',
  // 2026-11-25 cuts T4 push-forward: the usecase/actor sizer measures the `stereo` block the draw adds
  // (`EntityImageDescription.java:192-202`; `class-stereotype.ts#leafStereotypeSizing`), as the generic leaf did.
  'stereo',
  'title-stereo',
];

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, { readonly maxDiffs: number; readonly reason: string }>> = {
  // 2026-11-25 cuts push-forward: an empty `package P { }` with no usymbol is `EntityImageEmptyPackage`
  // (`GeneralImageBuilder.java:206-210`), not `EntityImageDescription`: `PACKAGE_TITLE` on the diagram's last builder
  // (`EntityImageEmptyPackage.java:87-107`). Ours strokes it from flat tiers (`class-empty-package.ts`).
  'empty-package': { maxDiffs: 4, reason: '#297: class empty package reads no `title` style' },
  // 2026-11-25 cuts T2 push-forward: `deltaShadow` is `styleTitle.getShadowing()` (`EntityImageDescription.java:167`),
  // so the component casts its shadow; the canvas still omits it (`leaf-sizing-entity.ts:187`).
  'title-shadow': { maxDiffs: 4, reason: '#260' },
};

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

let elk: ElkBackend | undefined;

beforeAll(async () => {
  elk = await prepareElkOnce();
});

function diffCount(row: string): number {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
    elk,
  });
  return compareSvg(ours, jar, 'deterministic').diffs.length;
}

describe('class usymbol title-style authored fixtures — manifest shape', () => {
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

describe('class usymbol title-style authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs`, () => {
      expect(diffCount(row)).toBe(0);
    });
  }
});

describe('class usymbol title-style authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)} (${reason})`, () => {
      expect(diffCount(row)).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
