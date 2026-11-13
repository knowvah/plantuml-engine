// pso: pin a rows.mts measure into oracle/goldens/diagram-style-scope.json.
// dss's repin-rows.mjs with one change: an unpinned row whose name contains `__frameorder-` (this mission's rows) is
// ADDED at its measured count instead of failing. Every other rule stands: exit 1 on a rise, a
// conformant -> non-conformant flip, an unpinned row of any other family, or a pinned row the measure lacks.
// A partial measure (a prefix run) checks only the rows it holds.
// Usage: node plans/partition-skinparam-order/measurements/pin-rows.mjs <rows.json> [--partial]
import { readFileSync, writeFileSync } from 'node:fs';

const PIN = 'oracle/goldens/diagram-style-scope.json';
const MISSION_ROW = '__frameorder-';
const partial = process.argv.includes('--partial');
const pin = JSON.parse(readFileSync(PIN, 'utf8'));
const meas = JSON.parse(readFileSync(process.argv[2], 'utf8')).rows;
let bad = 0;
for (const [k, m] of Object.entries(meas)) {
  const p = pin.rows[k];
  if (!p) {
    if (k.includes(MISSION_ROW)) {
      console.log('add', k, m.diffCount);
      pin.rows[k] = m;
    } else {
      console.log('NEW (not a mission row)', k, JSON.stringify(m));
      bad++;
    }
    continue;
  }
  // A `stockError` row is left alone, as `activity-authored-rows/measurements/lower-dss.mjs:17` does: rows.mts
  // measures raw, the ratchet measures it under the error-page rule (smc D5, `diagram-style-scope.ts:92-97`).
  if (p.stockError === true) continue;
  if (m.diffCount > p.diffCount || (p.conformant && !m.conformant)) {
    console.log('RISE', k, JSON.stringify(p), '->', JSON.stringify(m));
    bad++;
    continue;
  }
  if (m.diffCount < p.diffCount || m.conformant !== p.conformant) {
    console.log('lower', k, p.diffCount, '->', m.diffCount, m.conformant);
    pin.rows[k] = m;
  }
}
if (!partial) {
  for (const k of Object.keys(pin.rows)) {
    if (!meas[k]) {
      console.log('GONE', k);
      bad++;
    }
  }
}
const sorted = Object.fromEntries(Object.entries(pin.rows).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
const rows = Object.values(sorted);
console.log('rows', rows.length, 'conformant', rows.filter((r) => r.conformant).length, 'sum', rows.reduce((s, r) => s + r.diffCount, 0));
if (bad) process.exit(1);
writeFileSync(PIN, JSON.stringify({ ...pin, rows: sorted }, null, 2) + '\n');
