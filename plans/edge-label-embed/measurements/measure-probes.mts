/**
 * ele planning measurer. Renders every `.puml` under `measurements/probes/` (and
 * any extra paths given) through `renderSync` + `DeterministicMeasurer`, the
 * survey's measurer, and compares with the jar oracle at `probes/jar/<name>.svg`
 * (or `in.svg` beside an `in.puml`) via `compareSvg(ours, jar, 'deterministic')`.
 *
 *   npx tsx plans/edge-label-embed/measurements/measure-probes.mts [out.json] [extra.puml...]
 *
 * Prints `rows N zero Z open O error E`, then one line per row: diffs, `<image>`
 * count ours/jar, canvas ours/jar, first diff path. Run from the repo root.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';

const PROBES = 'plans/edge-label-embed/measurements/probes';
/** T1c: probes pinned in the authored gate move here, each with its jar `.svg` beside it. */
const FIXTURES = 'tests/fixtures/edge-label-embed';
const XETASE = 'test-results/dot-cache/state/xetase-70-zaza808/in.puml';
const [outPath = '/tmp/ele-probes.json', ...extra] = process.argv.slice(2);
const files = [
  ...readdirSync(PROBES)
    .filter((f) => f.endsWith('.puml'))
    .sort()
    .map((f) => join(PROBES, f)),
  ...readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.puml'))
    .sort()
    .map((f) => join(FIXTURES, f)),
  XETASE,
  ...extra,
];

const jarFor = (f: string): string => {
  if (basename(f) === 'in.puml') return join(dirname(f), 'in.svg');
  if (dirname(f) === FIXTURES) return join(FIXTURES, basename(f, '.puml') + '.svg');
  return join(dirname(f), 'jar', basename(f, '.puml') + '.svg');
};
const images = (svg: string): number => (svg.match(/<image/g) ?? []).length;
const canvas = (svg: string): string => {
  const m = svg.match(/width="(\d+)px" height="(\d+)px"/);
  return m === null ? '?' : `${m[1]}x${m[2]}`;
};

interface Row {
  name: string;
  n?: number;
  images?: string;
  canvas?: string;
  first?: string;
  error?: string;
}
const rows: Row[] = [];
for (const f of files) {
  const name = f === XETASE ? 'state/xetase-70-zaza808' : basename(f, '.puml');
  try {
    const jar = readFileSync(jarFor(f), 'utf8');
    const ours = renderSync(readFileSync(f, 'utf8'), { measurer: new DeterministicMeasurer() });
    const { diffs } = compareSvg(ours, jar, 'deterministic');
    rows.push({
      name,
      n: diffs.length,
      images: `${images(ours)}/${images(jar)}`,
      canvas: `${canvas(ours)}/${canvas(jar)}`,
      first: diffs[0]?.path ?? '',
    });
  } catch (e) {
    rows.push({ name, error: e instanceof Error ? e.message : String(e) });
  }
}
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
const zero = rows.filter((r) => r.n === 0).length;
const err = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - err} error ${err}`);
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.name} ERROR ${r.error}`);
  else console.log(`${r.name} n=${r.n} images=${r.images} canvas=${r.canvas} ${r.first}`);
}
