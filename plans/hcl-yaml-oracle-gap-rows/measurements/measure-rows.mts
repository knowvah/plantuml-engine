/**
 * hyogr planning measurer. Renders the 16 hcl/yaml rows that #109 captured
 * through the RATCHET path of `tests/oracle/svg-conformance/json-family-ratchet.ts`:
 * `renderFixtureJson(src, new DeterministicMeasurer())`, then
 * `compareSvg(ours, jar, 'deterministic')`, and adds the positional residue
 * from `measureResidue` (the json-family positional pin's own measurement).
 *
 *   npx tsx plans/hcl-yaml-oracle-gap-rows/measurements/measure-rows.mts [out.json] [type/slug...]
 *
 * With no rows given, measures every row in `new-rows.json`. Prints one summary
 * line (`rows N zero Z open O error E`) and one line per non-zero row with its
 * residue and first three diff paths. Run from the repo root.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';
import { renderFixtureJson } from '../../../tests/oracle/svg-conformance/render-fixture-json.js';
import { measureResidue } from '../../../tests/oracle/svg-conformance/json-family-positional.js';
import type { JsonFamilyType } from '../../../tests/oracle/svg-conformance/json-family-positional.js';

interface RowId {
  type: JsonFamilyType;
  slug: string;
}

const [outPath = '/tmp/hyogr-plan/measure.json', ...given] = process.argv.slice(2);
const ids: RowId[] =
  given.length > 0
    ? given.map((g: string) => {
        const [type, slug] = g.split('/') as [JsonFamilyType, string];
        return { type, slug };
      })
    : (JSON.parse(readFileSync('plans/hcl-yaml-oracle-gap-rows/measurements/new-rows.json', 'utf8')) as RowId[]);

interface Row extends RowId {
  n?: number;
  residue?: { aligned: boolean; nodeMax: number; pathMax: number; dw: number; dh: number };
  first?: string[];
  error?: string;
}

const rows: Row[] = [];
for (const { type, slug } of ids) {
  const dir = `test-results/dot-cache/${type}/${slug}`;
  try {
    const jar = readFileSync(`${dir}/in.svg`, 'utf8');
    const ours = renderFixtureJson(readFileSync(`${dir}/in.puml`, 'utf8'), new DeterministicMeasurer());
    const { diffs } = compareSvg(ours, jar, 'deterministic');
    const r = measureResidue(type, slug);
    rows.push({
      type,
      slug,
      n: diffs.length,
      residue: { aligned: r.aligned, nodeMax: r.nodeMax, pathMax: r.pathMax, dw: r.canvas.dw, dh: r.canvas.dh },
      first: diffs.slice(0, 3).map((d) => d.path),
    });
  } catch (e) {
    rows.push({ type, slug, error: e instanceof Error ? e.message : String(e) });
  }
}
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n');
const zero = rows.filter((r) => r.n === 0).length;
const err = rows.filter((r) => r.error !== undefined).length;
console.log(`rows ${rows.length} zero ${zero} open ${rows.length - zero - err} error ${err}`);
for (const r of rows) {
  if (r.error !== undefined) console.log(`${r.type}/${r.slug} ERROR ${r.error}`);
  else if (r.n !== 0) {
    const s = r.residue!;
    const res = `node ${s.nodeMax.toFixed(3)} path ${s.pathMax.toFixed(3)} dw ${s.dw} dh ${s.dh}`;
    console.log(`${r.type}/${r.slug} n=${r.n} aligned=${String(s.aligned)} ${res} | ${(r.first ?? []).join(' | ')}`);
  }
}
