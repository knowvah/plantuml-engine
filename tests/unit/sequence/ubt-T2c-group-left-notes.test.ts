/**
 * ubt-T2c: a group's footprint reaches left over the notes written after its
 * `end`. `GroupingTile#getMinX` is
 * `min.addFixed(-EXTERNAL_MARGINX1 - getNotesWidth(LEFT))`
 * (`teoz/GroupingTile.java:984-986`, `EXTERNAL_MARGINX1 = 3` at `:83`), and
 * `drawNotes` draws a left note at `min - width` (`:1007-1013`), so the jar
 * keeps 3 px empty left of such a note.
 *
 * Each `tests/fixtures/ubt-T2c/<name>/in.svg` is the jar's render: the corpus
 * row `teoz-ng-001-17`, or `scripts/oracle-render.sh` for every other name.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(HERE, '../../fixtures/ubt-T2c');

type RenderOptions = NonNullable<Parameters<typeof renderSync>[1]>;

function renderFixture(name: string): { ours: string; jar: string } {
  const dir = join(FIXTURE_ROOT, name);
  const options = { jarCompatibleStyleInput: true, measurer: new DeterministicMeasurer() } as RenderOptions;
  return {
    ours: renderSync(readFileSync(join(dir, 'in.puml'), 'utf8'), options),
    jar: readFileSync(join(dir, 'in.svg'), 'utf8'),
  };
}

describe('ubt-T2c teoz-ng-001-17', () => {
  it("is 605 wide with participant A's box at the jar's x", () => {
    const { ours } = renderFixture('teoz-ng-001-17');
    expect(ours).toContain('width="605px"');
    expect(ours).toContain('<rect x="472.506" y="10" width="23.363" height="28"');
  });
});

describe('ubt-T2c every fixture equals its oracle', () => {
  for (const name of readdirSync(FIXTURE_ROOT).sort()) {
    it(`${name}: 0 compareSvg diffs`, () => {
      const { ours, jar } = renderFixture(name);
      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }
});
