// Compare the capture report with the planning trial. A difference is a journal row, not a stop.
// Usage: node check-route.mjs <capture-report.json>
// Exit 1 on a row the capture skipped, failed, or placed in another bucket.
import { readFileSync } from 'node:fs';

const TRIAL = 'plans/oracle-gap-capture/measurements/trial-rows.json';
const MULTI_PAGE_SLUG = 'xobebi-29-jilu859'; // unmeasured in the trial: it wrote two files, see D4
const [reportPath] = process.argv.slice(2);
if (reportPath === undefined) throw new Error('usage: check-route.mjs <capture-report.json>');

const trial = new Map(JSON.parse(readFileSync(TRIAL, 'utf8')).map((r) => [`${r.manifest}/${r.slug}`, r]));
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const seen = new Set();
let bad = 0;
for (const r of report.rows) {
  const key = `${r.manifest}/${r.slug}`;
  seen.add(key);
  const expected = trial.get(key);
  if (expected === undefined) {
    console.log(`not in the trial: ${key} -> ${r.bucket}`);
    bad++;
  } else if (expected.bucket !== r.bucket && r.slug !== MULTI_PAGE_SLUG) {
    console.log(`moved: ${key}: trial ${expected.bucket}, capture ${r.bucket}`);
    bad++;
  }
  if (r.kind === 'none' || r.kind === 'ambiguous') {
    console.log(`no usable svg: ${key} (${r.kind})`);
    bad++;
  }
}
for (const key of trial.keys()) {
  if (!seen.has(key)) {
    console.log(`in the trial, not captured: ${key}`);
    bad++;
  }
}
console.log(`${report.rows.length} rows, ${bad} differ from the trial`);
process.exit(bad > 0 ? 1 : 0);
