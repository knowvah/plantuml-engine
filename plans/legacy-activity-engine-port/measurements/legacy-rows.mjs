// The legacy activity rows: every cached oracle the jar drew as ACTIVITY *through svek*.
// activitydiagram3 never emits svek-N.dot, so `data-diagram-type="ACTIVITY"` plus a
// svek-*.dot in the row's cache dir picks ActivityDiagramFactory (PSystemBuilder.java:137).
// Usage: node plans/legacy-activity-engine-port/measurements/legacy-rows.mjs <survey-dir> [--json <out>]
//   <survey-dir> holds parity-<bucket>.json files (tests/oracle/svg-conformance, or a /tmp survey).
// Prints one line per row (bucket, slug, verdict, firstDiff) and a verdict count per bucket.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache';
const ACTIVITY_TYPE = 'data-diagram-type="ACTIVITY"';
const HEAD_BYTES = 600;
const [surveyDir, flag, outPath] = process.argv.slice(2);
if (surveyDir === undefined) throw new Error('usage: legacy-rows.mjs <survey-dir> [--json <out>]');

const verdicts = new Map();
for (const file of readdirSync(surveyDir).filter((f) => /^parity-[a-z0-9]+\.json$/.test(f))) {
  for (const row of JSON.parse(readFileSync(join(surveyDir, file), 'utf8')).fixtures) {
    verdicts.set(`${row.type}/${row.slug}`, row);
  }
}

const rows = [];
for (const bucket of readdirSync(CACHE)) {
  for (const slug of readdirSync(join(CACHE, bucket))) {
    const dir = join(CACHE, bucket, slug);
    const svg = join(dir, 'in.svg');
    if (!existsSync(svg)) continue;
    if (!readFileSync(svg, 'utf8').slice(0, HEAD_BYTES).includes(ACTIVITY_TYPE)) continue;
    if (!readdirSync(dir).some((f) => /^svek-\d+\.dot$/.test(f))) continue;
    const row = verdicts.get(`${bucket}/${slug}`);
    rows.push({ bucket, slug, verdict: row?.verdict ?? 'unsurveyed', firstDiff: row?.firstDiff ?? null });
  }
}
rows.sort((a, b) => (a.bucket + a.slug).localeCompare(b.bucket + b.slug));

const counts = {};
for (const r of rows) {
  console.log(`${r.bucket}/${r.slug} ${r.verdict} ${r.firstDiff ?? '-'}`);
  counts[r.bucket] ??= {};
  counts[r.bucket][r.verdict] = (counts[r.bucket][r.verdict] ?? 0) + 1;
}
console.log(`rows ${rows.length} ${JSON.stringify(counts)}`);
if (flag === '--json' && outPath !== undefined) writeFileSync(outPath, `${JSON.stringify(rows, null, 1)}\n`);
