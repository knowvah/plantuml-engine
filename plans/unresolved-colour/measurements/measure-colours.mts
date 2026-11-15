/**
 * ucol planning measurer. Two modes.
 *
 *   npx tsx plans/unresolved-colour/measurements/measure-colours.mts probes [out.json] [extra.puml...]
 *     Renders every `.puml` under `measurements/probes/` (and the extras) through
 *     `renderSync` + `DeterministicMeasurer`, compares with `probes/jar/<name>.svg`
 *     via `compareSvg(ours, jar, 'deterministic')`, and lists the invalid colour
 *     values in ours and in the jar's.
 *
 *   npx tsx plans/unresolved-colour/measurements/measure-colours.mts corpus [out.json]
 *     Renders every `test-results/dot-cache/<type>/<slug>/in.puml` and lists the rows
 *     whose output carries an invalid colour value. No compare.
 *
 * Valid = `tests/helpers/svg-colour-validity.ts#invalidColours` (T1a; it also scans
 * `style` properties). Prints `rows N zero Z open O error E invalid I`. Run from
 * the repo root.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { invalidColours } from '../../../tests/helpers/svg-colour-validity.js';

const PROBES = 'plans/unresolved-colour/measurements/probes';
const FIXTURES = 'tests/fixtures/unresolved-colour';
const CACHE = 'test-results/dot-cache';

interface Row {
  name: string;
  n?: number;
  invalidOurs?: string[];
  invalidJar?: string[];
  first?: string;
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

function probes(extra: string[]): Row[] {
  const rows: Row[] = [];
  const jarFor = (f: string): string =>
    f.startsWith(FIXTURES) ? f.replace(/\.puml$/, '.svg') : join(PROBES, 'jar', basename(f, '.puml') + '.svg');
  for (const f of [...pumls(PROBES), ...pumls(FIXTURES), ...extra]) {
    const name = basename(f, '.puml');
    try {
      const jar = readFileSync(jarFor(f), 'utf8');
      const ours = render(readFileSync(f, 'utf8'));
      const { diffs } = compareSvg(ours, jar, 'deterministic');
      rows.push({
        name,
        n: diffs.length,
        invalidOurs: invalidColours(ours),
        invalidJar: invalidColours(jar),
        first: diffs[0]?.path ?? '',
      });
    } catch (e) {
      rows.push({ name, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return rows;
}

let scanned = 0;
function corpus(): Row[] {
  const rows: Row[] = [];
  for (const type of readdirSync(CACHE).sort()) {
    const dir = join(CACHE, type);
    if (!existsSync(dir) || type.includes('.')) continue;
    for (const slug of readdirSync(dir).sort()) {
      const f = join(dir, slug, 'in.puml');
      if (!existsSync(f)) continue;
      scanned++;
      try {
        // As the refusal gate does (T1a): a value the oracle itself carries is the jar's answer.
        const golden = join(dir, slug, 'in.svg');
        const jar = new Set(existsSync(golden) ? invalidColours(readFileSync(golden, 'utf8')) : []);
        const bad = invalidColours(render(readFileSync(f, 'utf8'))).filter((c) => !jar.has(c));
        if (bad.length > 0) rows.push({ name: `${type}/${slug}`, invalidOurs: bad });
      } catch (e) {
        // A throw is the survey's `errored` verdict, not a colour finding: listed so a scan
        // that silently threw everywhere cannot read as "0 invalid".
        rows.push({ name: `${type}/${slug}`, error: e instanceof Error ? e.message : String(e) });
      }
    }
  }
  return rows;
}

const [mode = 'probes', outPath = '/tmp/ucol.json', ...extra] = process.argv.slice(2);
const rows = mode === 'corpus' ? corpus() : probes(extra);
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
const zero = rows.filter((r) => r.n === 0).length;
const err = rows.filter((r) => r.error !== undefined).length;
const inv = rows.filter((r) => (r.invalidOurs?.length ?? 0) > 0).length;
if (mode === 'corpus') console.log(`scanned ${scanned}`);
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - err} error ${err} invalid ${inv}`);
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.name} ERROR ${r.error}`);
  else console.log(`${r.name} n=${r.n ?? '-'} ours=[${r.invalidOurs?.join(' ')}] jar=[${r.invalidJar?.join(' ') ?? ''}] ${r.first ?? ''}`);
}
