/**
 * Authored timing time-axis gate: t-axis breaks (`break <from> to <to>`, upstream baf98040f42, #2981) and the time
 * axis unit (`time-axis unit "..."`, upstream db06d70e18e, #2982).
 *
 * Rows are every `.puml` under `tests/fixtures/timing-axis/`, each with its jar `.svg` beside it
 * (`scripts/oracle-render.sh`): `axis-break` and the five `time-axis-unit*` sources are upstream's own Vega fixtures
 * (`src/test/resources/vega/timing/`, added by those two commits); the others are authored to cross a break with
 * `manual time-axis`, codes, numeric players, a message, `scale`, two breaks, a player background, a transparent
 * document background and a hidden axis, plus the three `TimingDiagram#addBreak` refusals (`Unknown time`, `A break
 * must end after it starts`, `Breaks cannot overlap`), whose jar error pages we draw too.
 *
 * A drawn row renders at 0 diffs. An error row is a jar error page we also draw (conformant by the 2026-10-10 rule):
 * neither page carries a diagram type, and both name the same `(line N)` and the same `addBreak` message. Rendered as
 * the survey renders: `renderSync` + `DeterministicMeasurer`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from './compare.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/timing-axis');

/** The upstream Vega rows; every other row is authored. */
const VEGA = [
  'axis-break',
  'time-axis-unit',
  'time-axis-unit-break',
  'time-axis-unit-long',
  'time-axis-unit-manual',
  'time-axis-unit-scale',
];

/** Error row -> the 1-based line both pages name and `TimingDiagram#addBreak`'s message (TimingDiagram.java:426-434). */
const ERROR: Readonly<Record<string, { readonly line: number; readonly message: string }>> = {
  'break-unknown-code': { line: 10, message: 'Unknown time' },
  'break-reversed': { line: 10, message: 'A break must end after it starts' },
  'break-overlap': { line: 11, message: 'Breaks cannot overlap' },
};

const DIAGRAM_TYPE = /^<svg[^>]*\sdata-diagram-type="/;
const ERROR_LINE = /\(line (\d+)\)/;

function errorPage(svg: string, message: string): { drawn: boolean; line: number | undefined; message: boolean } {
  const line = ERROR_LINE.exec(svg)?.[1];
  return {
    drawn: DIAGRAM_TYPE.test(svg),
    line: line === undefined ? undefined : Number(line),
    message: svg.includes(`>${message}`),
  };
}

function render(row: string): string {
  return renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), { measurer: new DeterministicMeasurer() });
}

function rowsOnDisk(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .map((f) => f.slice(0, -'.puml'.length))
    .sort();
}

describe('timing time-axis breaks and unit — fixtures', () => {
  it('has the six upstream Vega rows, each with its jar .svg', () => {
    expect(rowsOnDisk().filter((r) => VEGA.includes(r))).toEqual([...VEGA].sort());
    for (const row of rowsOnDisk()) expect(readFileSync(join(FIXTURES, `${row}.svg`), 'utf8')).toContain('<svg');
  });

  for (const row of rowsOnDisk().filter((r) => !(r in ERROR))) {
    it(`${row}: matches the jar at 0 diffs`, () => {
      const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
      expect(compareSvg(render(row), jar, 'deterministic').diffs).toEqual([]);
    });
  }

  for (const [row, { line, message }] of Object.entries(ERROR)) {
    it(`${row}: the jar and we both refuse at line ${String(line)}: ${message}`, () => {
      const jar = readFileSync(join(FIXTURES, `${row}.svg`), 'utf8');
      const expected = { drawn: false, line, message: true };
      expect(errorPage(jar, message)).toEqual(expected);
      expect(errorPage(render(row), message)).toEqual(expected);
    });
  }
});
