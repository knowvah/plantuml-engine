/**
 * Mission aae (issue #188) probe measurer. Renders every activity-3 row of the authored edge-label embed gate
 * (`tests/fixtures/edge-label-embed/act3*.puml`) plus any extra `.puml` paths given (each needs its jar `.svg`
 * beside it, rendered with `scripts/oracle-render.sh`), the way the gate does: `renderSync` +
 * `DeterministicMeasurer`, `compareSvg(ours, jar, 'deterministic')`.
 *
 * Usage: npx tsx plans/activity-arrow-embed/measurements/measure-probes.mts [out.json] [extra.puml ...]
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../../tests/oracle/svg-conformance/compare.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const FIXTURES = join(ROOT, 'tests/fixtures/edge-label-embed');

interface Row {
  row: string;
  diffs: number;
  image: { ours: string[]; jar: string[] };
  canvas: { ours: string; jar: string };
  firstDiffs: string[];
}

const IMAGE = /<image\b[^>]*?width="([^"]+)"[^>]*?height="([^"]+)"[^>]*?x="([^"]+)"[^>]*?y="([^"]+)"/g;
const CANVAS = /<svg\b[^>]*?width="([^"]+)px"[^>]*?height="([^"]+)px"/;

const images = (svg: string): string[] => [...svg.matchAll(IMAGE)].map((m) => `${m[1]}x${m[2]}@(${m[3]},${m[4]})`);
const canvas = (svg: string): string => {
  const m = CANVAS.exec(svg);
  return m ? `${m[1]}x${m[2]}` : '?';
};

function measure(puml: string): Row {
  const jar = readFileSync(puml.replace(/\.puml$/, '.svg'), 'utf8');
  const ours = renderSync(readFileSync(puml, 'utf8'), { measurer: new DeterministicMeasurer() });
  const diffs = compareSvg(ours, jar, 'deterministic').diffs;
  return {
    row: basename(puml, '.puml'),
    diffs: diffs.length,
    image: { ours: images(ours), jar: images(jar) },
    canvas: { ours: canvas(ours), jar: canvas(jar) },
    firstDiffs: diffs.slice(0, 5).map((d) => `${d.path} ${String(d.actual)} vs ${String(d.expected)}`),
  };
}

const [out, ...extra] = process.argv.slice(2);
const rows = [
  ...readdirSync(FIXTURES)
    .filter((f) => f.startsWith('act3') && f.endsWith('.puml'))
    .sort()
    .map((f) => join(FIXTURES, f)),
  ...extra,
].map(measure);

for (const r of rows) {
  console.log(
    `${r.row.padEnd(24)} diffs ${String(r.diffs).padStart(3)}  canvas ${r.canvas.ours} / ${r.canvas.jar}  ` +
      `image ${r.image.ours.join(' ')} / ${r.image.jar.join(' ')}`,
  );
}
const zero = rows.filter((r) => r.diffs === 0).length;
console.log(`rows ${String(rows.length)} zero ${String(zero)} open ${String(rows.length - zero)}`);
if (out !== undefined) writeFileSync(out, JSON.stringify(rows, null, 2));
