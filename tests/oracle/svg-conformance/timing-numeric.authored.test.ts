/**
 * Authored timing numeric-player gate: the `analog` and `digital` players after upstream 3cdc46b2092 ("Allow Timing
 * `digital` signal", #2502) and 1a8b87e2baa (the split into `CommandNumericPlayer` + `CommandAnalog`/`CommandDigital`,
 * `AbstractNumericPlayer` + `PlayerAnalog`/`PlayerDigital`, `PanelsNumeric` + `PanelsAnalog`/`PanelsDigital`).
 *
 * Rows:
 * - every `.puml` under `tests/fixtures/timing-numeric/`, each with its jar `.svg` beside it
 *   (`scripts/oracle-render.sh`): the eight `simple-analog*`/`simple-digital*` sources are upstream's own Vega
 *   fixtures (`src/test/resources/vega/timing/`, added by 3cdc46b2092), the `digital-*` ones are authored to cross the
 *   new player with `compact`, a stereotype, `from … to`, `ticks num on multiple`, a constraint and the state players;
 * - the three corpus rows the a720bdd re-pin moved from "jar error" to TIMING (`unknown/Timing-short-alias-7..9`),
 *   read from the tracked oracle cache.
 *
 * Each renders at 0 diffs. Rendered as the survey renders: `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, '../../fixtures/timing-numeric');
const CACHE_UNKNOWN = join(HERE, '../../../test-results/dot-cache/unknown');

const CORPUS_ROWS = ['Timing-short-alias-7', 'Timing-short-alias-8', 'Timing-short-alias-9'];

const TIMING_TYPE = 'data-diagram-type="TIMING"';

interface Row {
  readonly name: string;
  readonly puml: string;
  readonly svg: string;
}

function rows(): Row[] {
  const authored = readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .sort()
    .map((f) => {
      const stem = f.slice(0, -'.puml'.length);
      return { name: stem, puml: join(FIXTURES, f), svg: join(FIXTURES, `${stem}.svg`) };
    });
  const corpus = CORPUS_ROWS.map((slug) => ({
    name: `unknown/${slug}`,
    puml: join(CACHE_UNKNOWN, slug, 'in.puml'),
    svg: join(CACHE_UNKNOWN, slug, 'in.svg'),
  }));
  return [...authored, ...corpus];
}

describe('timing numeric players — fixtures', () => {
  it('has the eight upstream Vega rows and the authored digital rows', () => {
    const names = rows().map((r) => r.name);
    expect(names.filter((n) => n.startsWith('simple-'))).toHaveLength(8);
    expect(names.filter((n) => n.startsWith('digital-'))).toHaveLength(3);
  });

  for (const row of rows()) {
    it(`${row.name}: the jar draws TIMING and we match it at 0 diffs`, () => {
      const jar = readFileSync(row.svg, 'utf8');
      const ours = renderSync(readFileSync(row.puml, 'utf8'), { measurer: new DeterministicMeasurer() });
      expect(jar).toContain(TIMING_TYPE);
      expect(ours).toContain(TIMING_TYPE);
      expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
    });
  }
});
