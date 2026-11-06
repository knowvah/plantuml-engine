// Verdict moves of in-scope rows between two survey directories. Exit 1 on a conformant row lost.
// Usage: node plans/description-divergence-drive/measurements/moves.mjs <base-dir> <now-dir>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { BUCKETS, inScope } from './scope.mjs';

const CONFORMANT = 'conformant';
const [baseDir, nowDir] = process.argv.slice(2);
if (baseDir === undefined || nowDir === undefined) throw new Error('usage: moves.mjs <base-dir> <now-dir>');

const read = (dir, bucket) => {
  const rows = JSON.parse(readFileSync(join(dir, `parity-${bucket}.json`), 'utf8')).fixtures;
  return new Map(inScope(bucket, rows).map((r) => [r.key, r.verdict]));
};

let lost = 0;
let gained = 0;
const counts = {};
for (const bucket of BUCKETS) {
  const base = read(baseDir, bucket);
  for (const [key, verdict] of read(nowDir, bucket)) {
    counts[verdict] = (counts[verdict] ?? 0) + 1;
    const before = base.get(key);
    if (before === verdict) continue;
    if (before === CONFORMANT) lost++;
    if (verdict === CONFORMANT) gained++;
    console.log(`${key}: ${before} -> ${verdict}`);
  }
}
console.log(`in scope ${JSON.stringify(counts)}; gained ${gained}, lost ${lost}`);
process.exit(lost > 0 ? 1 : 0);
