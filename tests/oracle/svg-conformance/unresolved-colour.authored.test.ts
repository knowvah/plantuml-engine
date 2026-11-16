/**
 * Authored unresolved-colour gate (ucol, issue #145, D5): a colour token `HColorSet` cannot parse still draws a valid
 * colour wherever the jar draws. Each call site picks its answer from one `HColorSet` method (`HColorSet.java:58-76`):
 * an arrow-style token takes `getColorOrWhite` (`WithLinkType.java:161-163`), a `name:value` part takes
 * `getColorOrNull` and claims its key (`Colors.java:105-113`), and a `<style>` value takes `getColorOrWhite` through
 * `ValueImpl.asColor` (`ValueImpl.java:92-108`). Rows are exactly the `.puml` files under
 * `tests/fixtures/unresolved-colour/`, each with its jar `.svg` beside it (`scripts/oracle-render.sh`).
 *
 * - Every row draws no invalid colour (`invalidColours`), and neither does its jar oracle (a fixture check). An OPEN
 *   row whose task has not landed carries `invalid: true`, which inverts the first assertion for that row only: it
 *   must still draw one, so a stale flag fails.
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
import { invalidColours } from '../../helpers/svg-colour-validity.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/unresolved-colour');

/** Rows at 0 diffs. */
const ZERO: readonly string[] = [
  // 2026-11-15 ucol T1a: guards, already at 0 on `5bab49f41`. State goes through `core/decoration/WithLinkType.ts`
  // and `core/abel/Colors.ts`; description's style path through `ValueImpl.asColor` (`style-reads.ts#stylePaint`).
  'state-arrow',
  'state-line',
  'state-text',
  'class-note-line',
  'act-partition-header',
  'act-partition-line',
  'skin-arrow',
  'skin-class-bg',
  'style-comp-bg',
  'style-root-bg-comp',
  // 2026-11-15 ucol T2a: M1, a class link's arrow-style token is `getColorOrWhite` (`WithLinkType.java:161-163`).
  'class-arrow',
  'seq-arrow',
  'class-arrow-comma',
  // 2026-11-15 ucol T2b: M2, a `name:value` part is `getColorOrNull` and a null claims its key (`Colors.java:111-113`);
  // the link's trailing colour is one `COLORS_REGEXP` capture (`CommandLinkClass.java:160`), never a label.
  'class-line',
  'class-line-override',
  'class-package-line',
  'class-link-colors',
  // 2026-11-15 ucol T2c: M3, a `<style>` colour value is `Value#asColor` -> `getColorOrWhite` (`ValueImpl.java:92-108`).
  'style-class-bg',
  'style-root-bg',
  'style-root-font',
  'style-arrow-line',
  // 2026-11-15 ucol T3a: M1, description's arrow-style token is `getColorOrWhite` (`CommandLinkElement.java:330`).
  'comp-arrow',
  'comp-arrow-dashed',
  // 2026-11-15 ucol T3b: M2, a description `name:value` part is `getColorOrNull` and a null claims its key
  // (`Colors.java:111-113`). `comp-text-override` is authored: the jar draws the default, so the null replaced red.
  'comp-text',
  'uc-back',
  'deploy-node-text',
  'comp-text-override',
  'comp-link-colors',
];

interface OpenRow {
  readonly maxDiffs: number;
  readonly reason: string;
  /** Our render still emits an invalid colour; the task named in `reason` removes the flag (D5). */
  readonly invalid?: true;
}

/** Row -> the diff count it may not exceed, and the issue that holds its residual. */
const OPEN: Readonly<Record<string, OpenRow>> = {
  // 2026-11-15 ucol T1a: the 17 open probes. T2a moved 3 to ZERO, T2b 4, T2c 4, T3a 2, and T3b 4 plus its authored row:
  // empty since T3b, so no row carries `invalid: true` (D5).
};

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

interface Measured {
  readonly diffs: number;
  readonly ours: readonly string[];
  readonly jar: readonly string[];
}

function measure(row: string): Measured {
  const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
  const ours = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
  });
  return {
    diffs: compareSvg(ours, jar, 'deterministic').diffs.length,
    ours: invalidColours(ours),
    jar: invalidColours(jar),
  };
}

describe('unresolved-colour authored fixtures — manifest shape', () => {
  it('rows are exactly the .puml files on disk, each listed once, each with its jar .svg', () => {
    const listed = [...ZERO, ...Object.keys(OPEN)].sort();
    expect(listed).toEqual(rowsOnDisk());
    expect(new Set(listed).size).toBe(listed.length);
    for (const row of listed) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8'), row).toContain('<svg');
  });

  it('every open row names its issue', () => {
    expect(Object.entries(OPEN).filter(([, v]) => !/#\d+/.test(v.reason))).toEqual([]);
  });
});

describe('unresolved-colour authored fixtures — zero rows', () => {
  for (const row of ZERO) {
    it(`${row}: 0 diffs, and no invalid colour on either side`, () => {
      const m = measure(row);
      expect(m.jar).toEqual([]);
      expect(m.ours).toEqual([]);
      expect(m.diffs).toBe(0);
    });
  }
});

describe('unresolved-colour authored fixtures — open rows never rise', () => {
  for (const [row, { maxDiffs, reason, invalid }] of Object.entries(OPEN)) {
    it(`${row}: diffs <= ${String(maxDiffs)}${invalid === true ? ', invalid colour pending' : ''} (${reason})`, () => {
      const m = measure(row);
      expect(m.jar).toEqual([]);
      // A pending flag on a row that is already clean is stale: the landing task drops it (D5).
      if (invalid === true) expect(m.ours.length, `${row}: valid now, drop invalid: true`).toBeGreaterThan(0);
      else expect(m.ours).toEqual([]);
      expect(m.diffs).toBeLessThanOrEqual(maxDiffs);
    });
  }
});
