// The git rows: every cached corpus source whose block opens with `@startgit`, the only tag that reaches
// GitDiagramFactory (DiagramType.java:143-144, PSystemBuilder.java:191). All 4 sit in the `unknown` cache tree today.
// Usage: node plans/git-engine-port/measurements/git-rows.mjs <survey-dir> [--json <out>]
//   <survey-dir> holds parity-<bucket>.json files (tests/oracle/svg-conformance, or a /tmp survey).
// Prints one line per row (bucket, slug, oracle kind, verdict, firstDiff) and a verdict count per bucket.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache';
const START_TAG = /^\s*@startgit\b/im;
const GIT_TYPE = 'data-diagram-type="GIT"';
const HEAD_BYTES = 600;
const [surveyDir, flag, outPath] = process.argv.slice(2);
if (surveyDir === undefined) throw new Error('usage: git-rows.mjs <survey-dir> [--json <out>]');

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
    const puml = join(dir, 'in.puml');
    const svg = join(dir, 'in.svg');
    if (!existsSync(puml) || !existsSync(svg)) continue;
    if (!START_TAG.test(readFileSync(puml, 'utf8'))) continue;
    const kind = readFileSync(svg, 'utf8').slice(0, HEAD_BYTES).includes(GIT_TYPE) ? 'drawn' : 'jar-error';
    const row = verdicts.get(`${bucket}/${slug}`);
    rows.push({ bucket, slug, kind, verdict: row?.verdict ?? 'unsurveyed', firstDiff: row?.firstDiff ?? null });
  }
}
rows.sort((a, b) => (a.bucket + a.slug).localeCompare(b.bucket + b.slug));

const counts = {};
for (const r of rows) {
  console.log(`${r.bucket}/${r.slug} ${r.kind} ${r.verdict} ${r.firstDiff ?? '-'}`);
  counts[r.bucket] ??= {};
  counts[r.bucket][r.verdict] = (counts[r.bucket][r.verdict] ?? 0) + 1;
}
console.log(`rows ${rows.length} ${JSON.stringify(counts)}`);
if (flag === '--json' && outPath !== undefined) writeFileSync(outPath, `${JSON.stringify(rows, null, 1)}\n`);
