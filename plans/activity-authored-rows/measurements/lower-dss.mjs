// node plans/activity-authored-rows/measurements/lower-dss.mjs <rows.json>
//
// Lowers oracle/goldens/diagram-style-scope.json from a `rows.mts --json`
// measurement: a row whose measured diffCount fell takes the new count; a
// `stockError` row is left alone (rows.mts measures raw, the ratchet measures
// under the error-page rule). Exit 1, writing nothing, if any row ROSE (the
// pin is shrink-only, stop condition 2).
import { readFileSync, writeFileSync } from 'node:fs';

const PIN = 'oracle/goldens/diagram-style-scope.json';
const measured = JSON.parse(readFileSync(process.argv[2], 'utf8')).rows;
const pin = JSON.parse(readFileSync(PIN, 'utf8'));
const lowered = [];
const rose = [];
for (const [row, now] of Object.entries(measured)) {
  const was = pin.rows[row];
  if (was === undefined || was.stockError === true) continue;
  if (now.diffCount > was.diffCount) rose.push(`${row} ${was.diffCount} -> ${now.diffCount}`);
  else if (now.diffCount < was.diffCount) {
    lowered.push(`${row} ${was.diffCount} -> ${now.diffCount}`);
    pin.rows[row] = { conformant: now.diffCount === 0, diffCount: now.diffCount };
  }
}
for (const l of lowered) console.log(`lowered ${l}`);
for (const r of rose) console.log(`ROSE ${r}`);
if (rose.length > 0) process.exit(1);
writeFileSync(PIN, `${JSON.stringify(pin, null, 2)}\n`);
console.log(`lowered ${lowered.length}, rose 0`);
