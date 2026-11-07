// node plans/activity-authored-rows/measurements/flip-twins.mjs <commit> <slug ...>
//
// Re-pins the `dot-cache`/`activity` rows of routing-baseline.json
// (`known-misroute` -> `agree`, ourType ACTIVITY) and refusal-baseline.json
// (`known-gap` -> `ok`, weErrored false) for rows a fix made render activity.
// The routing/refusal gates log such rows `[FIXED] ... pin is STALE`; this
// writes exactly that re-pin and nothing else. The gates then verify it: a
// wrong `agree`/`ok` claim fails them.
import { readFileSync, writeFileSync } from 'node:fs';

const [commit, ...slugs] = process.argv.slice(2);
if (!commit || slugs.length === 0) {
  console.error('usage: flip-twins.mjs <commit> <slug ...>');
  process.exit(2);
}
const today = new Date().toISOString().slice(0, 10);
const ROUTING = 'oracle/goldens/svg-conformance/routing-baseline.json';
const REFUSAL = 'oracle/goldens/svg-conformance/refusal-baseline.json';

function rewrite(file, flip) {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  let n = 0;
  data.fixtures = data.fixtures.map((row) => {
    if (row.tree !== 'dot-cache' || row.type !== 'activity' || !slugs.includes(row.slug)) return row;
    n++;
    const rest = { ...row };
    delete rest.reason;
    return { ...flip(rest), measuredAt: today, measuredAgainstCommit: commit };
  });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  return n;
}

const r = rewrite(ROUTING, (row) => ({ ...row, ourType: 'ACTIVITY', status: 'agree' }));
const f = rewrite(REFUSAL, (row) => ({ ...row, weErrored: false, engine: 'none', status: 'ok' }));
console.log(`routing ${r} refusal ${f} of ${slugs.length}`);
if (r !== slugs.length || f !== slugs.length) process.exit(1);
