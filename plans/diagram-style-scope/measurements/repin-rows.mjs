// dss close step 5 (copied from dbp): lower oracle/goldens/diagram-style-scope.json to a close's
// measure; exits 1 on any rise or a conformant->non-conformant flip (stop 5).
// Usage: node repin-rows.mjs <bN-rows.json>
import { readFileSync, writeFileSync } from 'node:fs';
const PIN = 'oracle/goldens/diagram-style-scope.json';
const pin = JSON.parse(readFileSync(PIN, 'utf8'));
const meas = JSON.parse(readFileSync(process.argv[2], 'utf8')).rows;
let bad = 0;
for (const [k, m] of Object.entries(meas)) {
  const p = pin.rows[k];
  if (!p) { console.log('NEW (unpinned)', k, JSON.stringify(m)); bad++; continue; }
  if (m.diffCount > p.diffCount || (p.conformant && !m.conformant)) { console.log('RISE', k, JSON.stringify(p), '->', JSON.stringify(m)); bad++; continue; }
  if (m.diffCount < p.diffCount || m.conformant !== p.conformant) { console.log('lower', k, p.diffCount, '->', m.diffCount, m.conformant); pin.rows[k] = m; }
}
for (const k of Object.keys(pin.rows)) if (!meas[k]) { console.log('GONE', k); bad++; }
const rows = Object.values(pin.rows);
console.log('rows', rows.length, 'conformant', rows.filter((r) => r.conformant).length, 'sum', rows.reduce((s, r) => s + r.diffCount, 0));
if (bad) process.exit(1);
writeFileSync(PIN, JSON.stringify(pin, null, 2) + '\n');
