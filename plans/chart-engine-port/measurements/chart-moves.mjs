// Verdict moves between two chart survey files, by row. Exit 1 on a conformant row lost.
// Usage: node plans/chart-engine-port/measurements/chart-moves.mjs <base-parity-chart.json> <now-parity-chart.json>
import { readFileSync } from 'node:fs';

const CONFORMANT = 'conformant';
const [basePath, nowPath] = process.argv.slice(2);
if (basePath === undefined || nowPath === undefined) throw new Error('usage: chart-moves.mjs <base> <now>');
const rows = (path) => new Map(JSON.parse(readFileSync(path, 'utf8')).fixtures.map((r) => [r.slug, r]));

const base = rows(basePath);
let lost = 0;
for (const [slug, row] of rows(nowPath)) {
  const before = base.get(slug);
  if (before?.verdict === row.verdict && before?.firstDiff === row.firstDiff) continue;
  if (before?.verdict === CONFORMANT && row.verdict !== CONFORMANT) lost++;
  console.log(`${slug}: ${before?.verdict} ${before?.firstDiff ?? '-'} -> ${row.verdict} ${row.firstDiff ?? '-'}`);
}
console.log(`lost ${lost}`);
process.exitCode = lost > 0 ? 1 : 0;
