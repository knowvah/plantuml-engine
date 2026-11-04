// Verdict moves between two state survey files.
// Usage: node plans/state-divergence-drive/measurements/state-moves.mjs <before.json> <after.json>
// Exit 1 on a row that left conformant, or a timeout/errored verdict.
import { readFileSync } from 'node:fs';

const CONFORMANT = 'conformant';
const FAULT_VERDICTS = new Set(['timeout', 'errored']);

const [beforePath, afterPath] = process.argv.slice(2);
if (beforePath === undefined || afterPath === undefined) throw new Error('usage: state-moves.mjs <before> <after>');

const rowsOf = (path) => JSON.parse(readFileSync(path, 'utf8')).fixtures;
const before = new Map(rowsOf(beforePath).map((r) => [r.slug, r.verdict]));
const after = rowsOf(afterPath);

const counts = {};
let lost = 0;
let faults = 0;
for (const r of after) {
  counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
  if (FAULT_VERDICTS.has(r.verdict)) faults++;
  const old = before.get(r.slug);
  if (old === r.verdict) continue;
  if (old === CONFORMANT) lost++;
  console.log(`${r.slug}: ${old} -> ${r.verdict}`);
}
console.log(`${JSON.stringify(counts)} lost ${lost}, timeout or errored ${faults}`);
process.exit(lost + faults > 0 ? 1 : 0);
