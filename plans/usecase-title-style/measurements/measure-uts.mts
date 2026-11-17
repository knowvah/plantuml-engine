/**
 * uts measurer. Renders every `.puml` under `measurements/probes/` (and, from T1a on,
 * `tests/fixtures/usecase-title-style/`) through `renderSync` + `DeterministicMeasurer`,
 * compares with the jar SVG via `compareSvg(ours, jar, 'deterministic')`, and prints one
 * line per probe: name, diff count, first diff path, then the ellipse strokes of ours and
 * of the jar. Ends with `rows N zero Z open O error E`.
 *
 *   npx tsx plans/usecase-title-style/measurements/measure-uts.mts [out.json] [extra.puml...]
 *
 * Run from the repo root.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';

const PROBES = 'plans/usecase-title-style/measurements/probes';
const FIXTURES = 'tests/fixtures/usecase-title-style';

interface Row {
  name: string;
  n?: number;
  first?: string;
  oursEllipse?: string[];
  jarEllipse?: string[];
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
const ellipses = (svg: string): string[] =>
  [...svg.matchAll(/<ellipse\b[^>]*>/g)].map((m) => {
    const tag = m[0];
    const pick = (a: string): string => tag.match(new RegExp(`${a}="([^"]*)"`))?.[1] ?? '-';
    return `${pick('fill')}/${pick('style')}`;
  });

const jarFor = (f: string): string =>
  f.startsWith(FIXTURES) ? f.replace(/\.puml$/, '.svg') : join(PROBES, 'jar', `${basename(f, '.puml')}.svg`);

const [out, ...extra] = process.argv.slice(2);
const rows: Row[] = [];
for (const f of [...pumls(PROBES), ...pumls(FIXTURES), ...extra]) {
  const name = basename(f, '.puml');
  try {
    const jar = readFileSync(jarFor(f), 'utf8');
    const ours = render(readFileSync(f, 'utf8'));
    const { diffs } = compareSvg(ours, jar, 'deterministic');
    rows.push({ name, n: diffs.length, first: diffs[0]?.path ?? '', oursEllipse: ellipses(ours), jarEllipse: ellipses(jar) });
  } catch (e) {
    rows.push({ name, error: e instanceof Error ? e.message : String(e) });
  }
}
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.name}\tERROR\t${r.error}`);
  else console.log(`${r.name}\t${r.n}\t${r.first}\tours=${r.oursEllipse?.join(' ')}\tjar=${r.jarEllipse?.join(' ')}`);
}
const zero = rows.filter((r) => r.n === 0).length;
const errors = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - errors} error ${errors}`);
if (out !== undefined) writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
