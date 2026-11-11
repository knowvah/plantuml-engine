// The timing rows: every cached corpus source whose jar oracle is `data-diagram-type="TIMING"`, plus every source in
// the `timing` bucket (whose six jar error pages carry no type). Upstream has no `@starttiming` tag: TIMING is one of
// `@startuml`'s candidates (DiagramType.java:198-200), reached through TimingDiagramFactory (PSystemBuilder.java:187).
// At planning (fea72e951): 152 drawn (139 `timing`, 13 `unknown`) + 6 jar error pages in `timing`.
// Usage: node plans/timing-engine-port/measurements/timing-rows.mjs <survey-dir> [--json <out>]
//   <survey-dir> holds parity-<bucket>.json files (tests/oracle/svg-conformance, or a /tmp survey).
// Prints one line per row (bucket, slug, oracle kind, verdict, firstDiff) and a verdict count per bucket.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache';
const TIMING_BUCKET = 'timing';
const TIMING_TYPE = 'data-diagram-type="TIMING"';
const HEAD_BYTES = 900;
const [surveyDir, flag, outPath] = process.argv.slice(2);
if (surveyDir === undefined) throw new Error('usage: timing-rows.mjs <survey-dir> [--json <out>]');

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
    if (!existsSync(join(dir, 'in.puml')) || !existsSync(svg)) continue;
    const drawn = readFileSync(svg, 'utf8').slice(0, HEAD_BYTES).includes(TIMING_TYPE);
    if (!drawn && bucket !== TIMING_BUCKET) continue;
    const row = verdicts.get(`${bucket}/${slug}`);
    rows.push({
      bucket,
      slug,
      kind: drawn ? 'drawn' : 'jar-error',
      verdict: row?.verdict ?? 'unsurveyed',
      firstDiff: row?.firstDiff ?? null,
    });
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
