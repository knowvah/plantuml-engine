/**
 * ubt-T3b: probes past the rows #119 fixed, each beside its jar oracle
 * (`scripts/oracle-render.sh`): `<<#color>>` stereogroups in a swimlane, a
 * partition and nested compounds (T1a); a stereotype style in a swimlane, on a
 * box with a note, against a `skinparam` (T1b); a monochrome sprite as a group
 * title (T2a); a leaf table inside a concurrent region (T2b); end notes after an
 * `alt` and a `loop` holding a `ref` (T2c). The render path is the survey's.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../src/index.js';
import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { compareSvg } from '../oracle/svg-conformance/compare.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(HERE, '../fixtures/ubt-T3b');

type RenderOptions = NonNullable<Parameters<typeof renderSync>[1]>;

describe('ubt-T3b every probe equals its oracle', () => {
  for (const name of readdirSync(FIXTURE_ROOT).sort()) {
    it(`${name}: 0 compareSvg diffs`, () => {
      const dir = join(FIXTURE_ROOT, name);
      const options = { jarCompatibleStyleInput: true, measurer: new DeterministicMeasurer() } as RenderOptions;
      const ours = renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options);
      expect(compareSvg(ours, readFileSync(join(dir, 'in.svg'), 'utf8'), 'deterministic').diffs).toEqual([]);
    });
  }
});
