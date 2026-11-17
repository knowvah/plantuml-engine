/**
 * ugs measurer. Renders every `.puml` under `measurements/probes/` (and, from T1a on,
 * `tests/fixtures/usymbol-group-scale/`) through `renderSync` + `DeterministicMeasurer`,
 * compares with the jar SVG via `compareSvg(ours, jar, 'deterministic')`, and prints one
 * line per probe: name, diff count, then the first 3 diffs as `path ours→jar`. Ends with
 * `rows N zero Z open O error E`.
 *
 *   npx tsx plans/usymbol-group-scale/measurements/measure-ugs.mts [out.json] [extra.puml...]
 *
 * An extra `.puml` needs its jar `.svg` beside it. Run from the repo root.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';

const PROBES = 'plans/usymbol-group-scale/measurements/probes';
const FIXTURES = 'tests/fixtures/usymbol-group-scale';
const SHOWN = 3;

interface Row {
  name: string;
  n?: number;
  first?: string[];
  error?: string;
}

const render = (puml: string): string => renderSync(puml, { measurer: new DeterministicMeasurer() });
const pumls = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.puml'))
        .sort()
        .map((f) => join(dir, f))
    : [];
const jarFor = (f: string): string =>
  f.startsWith(PROBES) ? join(PROBES, 'jar', `${basename(f, '.puml')}.svg`) : f.replace(/\.puml$/, '.svg');

const [out, ...extra] = process.argv.slice(2);
const rows: Row[] = [];
for (const f of [...pumls(PROBES), ...pumls(FIXTURES), ...extra]) {
  const name = basename(f, '.puml');
  try {
    const jar = readFileSync(jarFor(f), 'utf8');
    const { diffs } = compareSvg(render(readFileSync(f, 'utf8')), jar, 'deterministic');
    const first = diffs.slice(0, SHOWN).map((d) => `${d.path} ${String(d.actual)}→${String(d.expected)}`);
    rows.push({ name, n: diffs.length, first });
  } catch (e) {
    rows.push({ name, error: e instanceof Error ? e.message : String(e) });
  }
}
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.name}\tERROR\t${r.error}`);
  else console.log(`${r.name}\t${r.n}\t${r.first?.join(' | ') ?? ''}`);
}
const zero = rows.filter((r) => r.n === 0).length;
const errors = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - errors} error ${errors}`);
if (out !== undefined) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
