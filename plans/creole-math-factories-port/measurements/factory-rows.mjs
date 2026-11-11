// The cmf rows: every cached corpus source that reaches one of #129's five factories (PSystemCreoleFactory,
// PSystemDefinitionFactory, HelpFactory, PSystemMathFactory, PSystemLatexFactory), classified by the source itself
// (never by a verdict or a rendered diagram). `help ...` and `@start...` tags are upstream's own DiagramType keys
// (core/DiagramType.java:105-205, help/CommandHelp*.java).
// Usage: node plans/creole-math-factories-port/measurements/factory-rows.mjs <survey-dir> [--json <out>]
//   <survey-dir> holds parity-<bucket>.json files (tests/oracle/svg-conformance, or a /tmp survey).
// Prints one line per row (factory, bucket, slug, verdict, firstDiff) and a verdict count per factory.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = 'test-results/dot-cache';
const START_TAGS = { creole: 'creole', math: 'math', latex: 'latex', def: 'def' };
const HELP = /^\s*help\s+\S+/i;
const [surveyDir, flag, outPath] = process.argv.slice(2);
if (surveyDir === undefined) throw new Error('usage: factory-rows.mjs <survey-dir> [--json <out>]');

const verdicts = new Map();
for (const file of readdirSync(surveyDir).filter((f) => /^parity-[a-z0-9]+\.json$/.test(f))) {
  for (const row of JSON.parse(readFileSync(join(surveyDir, file), 'utf8')).fixtures) {
    verdicts.set(`${row.type}/${row.slug}`, row);
  }
}

/** The factory a source reaches, or undefined. A `@startuml` block is HelpFactory's when its first command line is `help ...`. */
function factoryOf(puml) {
  const lines = puml.split(/\r?\n/);
  const start = lines.findIndex((l) => /^\s*@start/i.test(l));
  if (start < 0) return undefined;
  const tag = /^\s*@start(\w+)/i.exec(lines[start])[1].toLowerCase();
  if (START_TAGS[tag] !== undefined) return START_TAGS[tag];
  if (tag !== 'uml') return undefined;
  const first = lines.slice(start + 1).find((l) => l.trim() !== '' && !l.trim().startsWith("'"));
  return first !== undefined && HELP.test(first) ? 'help' : undefined;
}

const rows = [];
for (const bucket of readdirSync(CACHE)) {
  const bucketDir = join(CACHE, bucket);
  for (const slug of readdirSync(bucketDir)) {
    const dir = join(bucketDir, slug);
    const puml = join(dir, 'in.puml');
    if (!existsSync(puml) || !existsSync(join(dir, 'in.svg'))) continue;
    const factory = factoryOf(readFileSync(puml, 'utf8'));
    if (factory === undefined) continue;
    const row = verdicts.get(`${bucket}/${slug}`);
    rows.push({ factory, bucket, slug, verdict: row?.verdict ?? 'unsurveyed', firstDiff: row?.firstDiff ?? null });
  }
}
rows.sort((a, b) => (a.factory + a.slug).localeCompare(b.factory + b.slug));

const counts = {};
for (const r of rows) {
  console.log(`${r.factory.padEnd(6)} ${r.bucket}/${r.slug} ${r.verdict} ${r.firstDiff ?? '-'}`);
  counts[r.factory] ??= {};
  counts[r.factory][r.verdict] = (counts[r.factory][r.verdict] ?? 0) + 1;
}
console.log(`rows ${rows.length} ${JSON.stringify(counts)}`);
if (flag === '--json' && outPath !== undefined) writeFileSync(outPath, `${JSON.stringify(rows, null, 1)}\n`);
